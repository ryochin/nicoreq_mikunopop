var cacheDir = 'caches';

function NicoLive(){
	this.initialize.apply(this, arguments);
}

NicoLive.prototype = {
	initialize: function(){
	},
	login: function(mail, password){
		try{
			var xmlhttp = createXMLHttpRequest();
			xmlhttp.Open("POST", "https://secure.nicovideo.jp/secure/login?site=niconico", false);
			xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xmlhttp.Send("mail="+mail+"&password="+password);
		}catch(e){
		}
	},
	getXML: function(url, type, callback){
		if( type == "video" && settings["UseVideoInfoCache"] ){
			// キャッシュ使用
			if( this.checkVideoInfoCacheFileDateLastModified( url ) && url.match(/\/(sm|nm|so)[0-9]+$/) ){
				// キャッシュが無効 -> ネットから取得して保存
				this.retrieveVideoInfoCacheFile(url);
			}
			
			// DOM オブジェクトを作る
			var xmldom = new ActiveXObject("Microsoft.XMLDOM");
			xmldom.async = false;
			try {
				xmldom.load( this.getCacheFileName(url) );
				if( xmldom.parseError != 0 )
					throw "parseError";
				
				// callback を呼ぶ
				callback(xmldom);
			} catch (e) {
				// 失敗したら、通常方式に切り替える
				if( settings["Debug"] )
					alert("動画情報の解析に失敗しました orz: " + e);
				
				this.getXMLviaNet(url, callback);
			}
		}
		else{
			// キャッシュ使用しない、または通常の XML
			this.getXMLviaNet(url, callback);
		}
	},
	retrieveVideoInfoCacheFile: function(url){
		var file = this.getCacheFileName(url);
		
		$.ajax( {
			url: url,
			async: 0,
			timeout: 5000,
			dataType: "text",
			success: function (result) {
				// 保存
				NicoLive.saveVideoInfoCacheFile(file, result);
			},
			error: function (req, status, error) {
//				alert("動画情報の取得に失敗しました orz");
			}
		} );
	},
	loadVideoInfoCacheFile: function( file ){
		var f = new File;
		f.file = file;
		return f.read();
	},
	saveVideoInfoCacheFile: function( file, content ){
		// 使わない海外タグを強引に削る
		// -> XRegExp は SocketManager 周りでエンバグするので使わないこと！
		// http://ext.nicovideo.jp/api/getthumbinfo/nm6610413
//		var re = XRegExp("<tags domain=\"(es|de|tw)\">.+?<\/tags>\n?", "gs");
//		content = content.replace(re, "");
		
		// UTF-8 で保存する
		var f = new File;
		f.file = file;
		return f.saveAsUTF8(content);
	},
	checkVideoInfoCacheFileDateLastModified: function(url){
		var f = new File;
		f.file = this.getCacheFileName(url);
		
		if( f.isExists() ){
			// 最終更新時間を見る
			var epoch = f.getLastModified();
			var now = parseInt( (new Date).getTime() / 1000, 10 );
			if( now - epoch < settings["VideoInfoCacheExpireHour"] * 60 * 60 ){
				// キャッシュが生きている
				if( f.getSize() > 0 ){
					// 空じゃない
					return;
				}
			}
		}
		
		return 1;
	},
	// ファイル名を得る（ついでにディレクトリも作成）
	getCacheFileName: function(url){
		var id = url.replace(/^.+((sm|nm|so)[0-9]+)$/, "$1");
		var n = parseInt( id.replace(/^(sm|nm|so)([0-9]+)$/, "$2"), 10 );
		var subdirUpper = parseInt( n / 1000000 );
		var subdirLower = parseInt( ( n - subdirUpper * 1000000 ) / 1000 );

		var fs = new ActiveXObject('Scripting.FileSystemObject');

		// パスの連結とディレクトリ作成
		var extra = ["System", cacheDir, subdirUpper, subdirLower];
		var path = this.createDirRecursive( fs.GetParentFolderName(location.pathname), extra );
		return fs.BuildPath( path, id + '.xml' );
	},
	// 疑似再帰的にディレクトリを作りたい
	createDirRecursive: function(path, extra){    // str, array
		var fs = new ActiveXObject('Scripting.FileSystemObject');
		for( var i = 0; i < extra.length; i++ ){
			path = fs.BuildPath( path, extra[i] );
			if( ! fs.FolderExists( path ) ){
				fs.CreateFolder( path );
			}
		}
		return path;
	},
	getXMLviaNet: function(url, callback){
		var xmlhttp = createXMLHttpRequest();
		xmlhttp.onreadystatechange = function(){
			if(xmlhttp.readyState==4){
				clearTimeout(timer);
				callback(xmlhttp.responseXML);
			}
		}
		var timer = setTimeout(function(){
			callback();
			xmlhttp.abort();
		}, 5000);
		xmlhttp.open("GET", url, true);
		xmlhttp.send();
	},
	getPlayerStatus: function(lv, callback, errorAlert){
		if(settings["UseIE"]){
			this.getXML("http://watch.live.nicovideo.jp/api/getplayerstatus?v=lv" + lv, 'normal', function(xmldom){
				if(xmldom){
					if(xmldom.getElementsByTagName("error").length > 0){
						var ErrMSG = {
							"closed": "このニコ生は終了しました。",
							"notlogin": "ログインしていません。\nIEでニコニコ動画にログインしてください。",
							"notfound": "番組情報が取得できません。\nニコ生IDを確認してください。",
							"unknown_error": "ニコ生IDが正しくありません。\nニコ生IDを確認してください。",
							"unknown": "アクセスが集中しています。\n時間をおいてもう一度接続を試みてください。",
							"maintenance": "メンテナンス中です。\nニコニコ動画のアナウンスを確認してください。"
						};
						if(!errorAlert) alert(ErrMSG[xmldom.getElementsByTagName("code")[0].text]);
						callback();
					}else{
						callback(new PlayerStatus(lv, xmldom));
					}
				}else{
					callback();
				}
			});
		}else{
			try{
				var WshShell = new ActiveXObject("WScript.Shell");
				WshShell.run("http://watch.live.nicovideo.jp/api/getplayerstatus/lv" + lv);
			}catch(e){
				window.open("http://watch.live.nicovideo.jp/api/getplayerstatus/lv" + lv);
				//alert("NicoLive.js:WshShellの生成に失敗しました")
			}
		}
	},
	getThumbInfo: function(id, reqCommentNum, callback){
		this.getXML("http://ext.nicovideo.jp/api/getthumbinfo/" + id, 'video', function(xmldom){
			if(xmldom){
				callback(new Request(id, reqCommentNum, xmldom));
			}else{
				callback();
			}
		});
	},
	postComment: function(body, mail){
		if(!SocketManager.connected) return;
		var lv = SocketManager.playerStatus.lv;
		if(!lv || body=="") return;
		if(!mail) mail = "";
		var xmlhttp = createXMLHttpRequest();
		var url = "http://watch.live.nicovideo.jp/api/broadcast/lv" + lv
			+ "?body=" + encodeURIComponent(body)
			+ "&mail=" + encodeURIComponent(mail)
			+ "&token=" + apiToken;
		xmlhttp.Open("GET", url, true);
		xmlhttp.send();
	}
}

var NicoLive = new NicoLive();