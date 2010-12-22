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
			// �L���b�V���g�p
			if( this.checkVideoInfoCacheFileDateLastModified( url ) && url.match(/\/(sm|nm|so)[0-9]+$/) ){
				// �L���b�V�������� -> �l�b�g����擾���ĕۑ�
				this.retrieveVideoInfoCacheFile(url);
			}
			
			// DOM �I�u�W�F�N�g�����
			var xmldom = new ActiveXObject("Microsoft.XMLDOM");
			xmldom.async = false;
			try {
				xmldom.load( this.getCacheFileName(url) );
				if( xmldom.parseError != 0 )
					throw "parseError";
				
				// callback ���Ă�
				callback(xmldom);
			} catch (e) {
				// ���s������A�ʏ�����ɐ؂�ւ���
				if( settings["Debug"] )
					alert("������̉�͂Ɏ��s���܂��� orz: " + e);
				
				this.getXMLviaNet(url, callback);
			}
		}
		else{
			// �L���b�V���g�p���Ȃ��A�܂��͒ʏ�� XML
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
				// �ۑ�
				NicoLive.saveVideoInfoCacheFile(file, result);
			},
			error: function (req, status, error) {
//				alert("������̎擾�Ɏ��s���܂��� orz");
			}
		} );
	},
	loadVideoInfoCacheFile: function( file ){
		var f = new File;
		f.file = file;
		return f.read();
	},
	saveVideoInfoCacheFile: function( file, content ){
		// �g��Ȃ��C�O�^�O�������ɍ��
		// -> XRegExp �� SocketManager ����ŃG���o�O����̂Ŏg��Ȃ����ƁI
		// http://ext.nicovideo.jp/api/getthumbinfo/nm6610413
//		var re = XRegExp("<tags domain=\"(es|de|tw)\">.+?<\/tags>\n?", "gs");
//		content = content.replace(re, "");
		
		// UTF-8 �ŕۑ�����
		var f = new File;
		f.file = file;
		return f.saveAsUTF8(content);
	},
	checkVideoInfoCacheFileDateLastModified: function(url){
		var f = new File;
		f.file = this.getCacheFileName(url);
		
		if( f.isExists() ){
			// �ŏI�X�V���Ԃ�����
			var epoch = f.getLastModified();
			var now = parseInt( (new Date).getTime() / 1000, 10 );
			if( now - epoch < settings["VideoInfoCacheExpireHour"] * 60 * 60 ){
				// �L���b�V���������Ă���
				if( f.getSize() > 0 ){
					// �󂶂�Ȃ�
					return;
				}
			}
		}
		
		return 1;
	},
	// �t�@�C�����𓾂�i���łɃf�B���N�g�����쐬�j
	getCacheFileName: function(url){
		var id = url.replace(/^.+((sm|nm|so)[0-9]+)$/, "$1");
		var n = parseInt( id.replace(/^(sm|nm|so)([0-9]+)$/, "$2"), 10 );
		var subdirUpper = parseInt( n / 1000000 );
		var subdirLower = parseInt( ( n - subdirUpper * 1000000 ) / 1000 );

		var fs = new ActiveXObject('Scripting.FileSystemObject');

		// �p�X�̘A���ƃf�B���N�g���쐬
		var extra = ["System", cacheDir, subdirUpper, subdirLower];
		var path = this.createDirRecursive( fs.GetParentFolderName(location.pathname), extra );
		return fs.BuildPath( path, id + '.xml' );
	},
	// �^���ċA�I�Ƀf�B���N�g������肽��
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
							"closed": "���̃j�R���͏I�����܂����B",
							"notlogin": "���O�C�����Ă��܂���B\nIE�Ńj�R�j�R����Ƀ��O�C�����Ă��������B",
							"notfound": "�ԑg��񂪎擾�ł��܂���B\n�j�R��ID���m�F���Ă��������B",
							"unknown_error": "�j�R��ID������������܂���B\n�j�R��ID���m�F���Ă��������B",
							"unknown": "�A�N�Z�X���W�����Ă��܂��B\n���Ԃ������Ă�����x�ڑ������݂Ă��������B",
							"maintenance": "�����e�i���X���ł��B\n�j�R�j�R����̃A�i�E���X���m�F���Ă��������B"
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
				//alert("NicoLive.js:WshShell�̐����Ɏ��s���܂���")
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