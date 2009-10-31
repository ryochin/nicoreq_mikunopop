SocketManager.attachEvent("receiveComment", __VideoInformation__receiveComment);

var __VideoInformation__PlayLog = "";
var __VideoInformation__MylistIDs = __VideoInformation__getMylistIDs();


function __VideoInformation__getMylistIDs(){
	var file = getMylistCacheFile();
	if( settings["UseMylistInfoCache"] ){
		// キャッシュ機能を使用する
		if( checkMylistCacheFileDateLastModified( file ) ){
			// キャッシュ無効、取得してローカルに保存
//			alert("マイリストキャッシュをサーバから取得");
			var content;
			try {
				content = __VideoInformation__getMylistIDs_via_net();
				saveMylistCacheFile( file, content );
				return eval('(' + content + ')');    // json to object
			} catch (e) {
				alert("マイリストの情報を正常に取得できませんでした orz\n（サーバが混雑していると起こりやすいようです）");
				return;
			}
		}
		else{
			// キャッシュを返す
//			alert("キャッシュが見つかったのでそのまま返却");
			return loadMylistCacheFile( file );
		}
	}
	else{
		// キャッシュ機能を使用しない
		return __VideoInformation__getMylistIDs_via_net();
	}
}

function saveMylistCacheFile (file, content) {
	var fs = new ActiveXObject('Scripting.FileSystemObject');
	// cache dir
	var cacheDir = fs.GetParentFolderName( file );
	if( ! fs.FolderExists( cacheDir ) ){
		try {
			fs.CreateFolder( cacheDir );
		} catch (e) {
			alert("ディレクトリの作成に失敗しました orz");
		}
	}
	
	// file
	var st = fs.OpenTextFile(file, 2, true, -2);
	// simply write down all the content as-is :)
	try {
		st.writeLine(content);
	} catch (e) {
		alert("ファイルの書き込みに失敗しました orz");
	} finally {
		st.Close();
	}
}

function loadMylistCacheFile (file) {
	var fs = new ActiveXObject('Scripting.FileSystemObject');
	try {
		var st = fs.OpenTextFile(file, 1, false, -2);
		var content = st.ReadAll();
		
		return eval("("+content+")");    // load as json
	} catch(e) {
		alert("マイリストキャッシュの読み込みに失敗しました orz");
	} finally {
		st.Close();
	}
}

function checkMylistCacheFileDateLastModified (file) {
	var fs = new ActiveXObject('Scripting.FileSystemObject');
	if( fs.FileExists(file) == true ){
		// 最終更新時間を見る
		var f = fs.GetFile(file);
		var s = f.DateLastModified;
		var epoch = parseInt( Date.parse(s), 10 ) / 1000;
		var now = parseInt( (new Date).getTime() / 1000, 10 );
		if( now - epoch < settings["MylistInfoCacheExpireHour"] * 60 * 60 ){
			// キャッシュが生きている
			return;
		}
	}

	return 1;
}

function getMylistCacheFile () {
	var fs = new ActiveXObject('Scripting.FileSystemObject');
	var dirs = [ fs.GetParentFolderName(location.pathname), 'System', 'caches', 'mylist.json' ];
	var path;
	for( var i = 0; i < dirs.length; i++ ){
		path = fs.BuildPath( path, dirs[i] );
	}
	return path;
}

function __VideoInformation__getMylistIDs_via_net(){
	var xmlhttp = createXMLHttpRequest();
	xmlhttp.open("GET", "http://www.nicovideo.jp/my/mylist", false);
	try{
		xmlhttp.send();
	}
	catch (e) {
		if(settings["EnforceLogin"]){
			NicoLive.login(settings["Login_Mail"], settings["Login_Pass"]);
			try{
				xmlhttp.send();
			}
			catch(e){
//				alert("ログインできませんでした orz");
				return;
			}
		}
		else{
//			alert("ログインできませんでした orz");
			return;
		}
	}

	// extract
	var json = extractObjectByPreloadSection( xmlhttp.responseText );
	
	// check
	if( ! json ){
		return;
	}

	var result = [];
	$.each( json, function () {

		var id = this.id;
		var title = this.name;
		var num = 0;    // 現在は取得できない

		// ブラックリストに載っている名前を弾く
		if(Zen2Han(settings["MylistBlackList"].join(",")).indexOf(","+Zen2Han(title)+",") > -1)
			return;

		// 500 件フルに埋まっているかどうかをチェックしたいから件数も抜き出す
		if( num < 500 ){
			// 追加する余地がある
			result.push('{id: ' + id + ',name: "' + title + '",flag: true}');
		}
		else{
			// もういっぱいいっぱい
			result.push('{id: ' + id + ',name: "' + title + '",flag: false}');
		}
	} );
	
	// to json
	var json = "[\n\t";
	json += result.join(",\n\t");
	json += "\n]";
	return json;
}

function __VideoInformation__receiveComment(Chat){
	var sms  = Chat.text.match(/(sm|nm)\d+/g);
	if(sms && /^\/(play|playsound|swapandplay) smile:/.test(Chat.text)){
		var VideoID = sms[0];
		document.getElementById("VideoInformation").innerHTML = "";
		NicoLive.getXML("http://ext.nicovideo.jp/api/getthumbinfo/" + VideoID, 'video', function(xmldom){
			if(!xmldom || xmldom.getElementsByTagName("error").length){
				__VideoInformation__PlayLog += VideoID + "\n";
				if(settings["SaveLogTiming"]=="AtPlay") writelog("watch",VideoID);
				return false;
			}
			else{
				// 動画情報を取得してみる
				var title = xmldom.getElementsByTagName("title")[0].text;
				var description = xmldom.getElementsByTagName("description")[0].text;
				var thumbnail_url = xmldom.getElementsByTagName("thumbnail_url")[0].text;
				var first_retrieve = xmldom.getElementsByTagName("first_retrieve")[0].text.replace("T"," ").replace("+09:00","");
				var view_counter = xmldom.getElementsByTagName("view_counter")[0].text;
				var comment_num = xmldom.getElementsByTagName("comment_num")[0].text;
				var mylist_counter = xmldom.getElementsByTagName("mylist_counter")[0].text;
				var xmltags = xmldom.getElementsByTagName("tags")[0].getElementsByTagName("tag");
				var tags = [];
				for(var i=0,l=xmltags.length; i<l; i++){
					var locked = 0;
					if(xmltags[i].getAttributeNode("lock")&&xmltags[i].getAttributeNode("lock").value=="1"){
						locked = true;
					}
					tags.push( { name: xmltags[i].text, locked: locked } );
				}
				
				// HTMLの構築
				// IEはselectをinnerHTMLで追加できないバグがあるので非常に泥臭い処理をする
				if(settings["UseIE"]){
					document.getElementById("VideoInformation").innerHTML
						+= "<span id=\"checkMylistResult\"></span>" + VideoID + " をマイリスト ";
					var sel = document.createElement("select");
					sel.setAttribute("id", "__VideoInformation__Mylist");
					var AllreadyExist = false;
					for(var i=0,l=__VideoInformation__MylistIDs.length; i<l; i++){
						if(settings["CheckPlayedVideoIdIsAdd2Mylists"]){
							// マイリスに登録されてるかどうか調査
							var xmlhttp = createXMLHttpRequest();
							xmlhttp.open("GET","http://www.nicovideo.jp/mylist/"+__VideoInformation__MylistIDs[i].id,false);
							xmlhttp.send();
							
							// extract
							var json = extractObjectByPreloadSection( xmlhttp.responseText );
							if( ! json )
								continue;
							
							// check
							$.each( json, function () {
								if( this.item_data.video_id != VideoID )
									return;
								
								$('#checkMylistResult').html( $('#checkMylistResult').html()
									+ VideoID + ' はマイリスト「<span class="mylist-name">'+__VideoInformation__MylistIDs[i].name+'</span>」に登録されています。<br>' );
								AllreadyExist = true;
							} );
						}
						
						// マイリストのプルダウンを作る
						if(!(settings["CheckPlayedVideoIdIsAdd2Mylists"] && __VideoInformation__MylistIDs[i].flag==false)){
							var opt = document.createElement("option");
							opt.appendChild(document.createTextNode(__VideoInformation__MylistIDs[i].name));
							opt.setAttribute("value", __VideoInformation__MylistIDs[i].id);
							sel.appendChild(opt);
						}
					}
					
					if(!AllreadyExist)
						$('#checkMylistResult').html( VideoID + ' はどのマイリストにも登録されていません。<br>' );
					
					document.getElementById("VideoInformation").appendChild(sel);
					document.getElementById("VideoInformation").insertAdjacentHTML("BeforeEnd",
						" に <input type=\"button\" value=\"登録\" onclick=\"__VideoInformation__addMylist('" + VideoID + "')\">");
				}
				
				// 現在流れている曲のサムネイルと情報をセット
				var info = [];
				info.push(" <span id=\"__VideoInformation__Twitter\"></span><br>");
				info.push("<div id=\"addMylistResult\"></div>");
				info.push("<hr />");
				info.push("<img src=\"http://niconail.info/"+VideoID+"\" alt=\""+VideoID+" : "+title+"\" width=\"314\" height=\"178\">");

				// info
				info.push('<div class="info"><fieldset><legend>情報</legend>');
				info.push("<span class=\"subtitle\">ミクノ度・彡 </span><span class=\"count\">"+(settings["GetMikunopopCount"]?getMikunopopCount(VideoID):"-")+"</span><br>");
				info.push("<span class=\"subtitle\">マイリスト率 </span>" + (Math.round(10000*(Number(mylist_counter)/Number(view_counter)))/100) +"%<br>");
				info.push("</fieldset></div>");

				// tags
				info.push('<div class="tags"><fieldset><legend>タグ</legend>');
				$.each( tags, function () {
					info.push( '<span>' + this.name + "</span>" );
					if( this.locked == true )
						info.push( ' <span class="locked" title="タグロック">*</span>' );
					info.push( "<br>" );
				} );
				info.push("</fieldset></div>");

				document.getElementById("VideoInformation").insertAdjacentHTML("BeforeEnd", info.join("") );

				if(settings["Twitter"]) __VideoInformation__addTwitter(document.getElementById("__VideoInformation__Twitter"), VideoID, title);
				
				// ログに書き出す
				__VideoInformation__PlayLog += VideoID + "　" + title + "\n";
				if(settings["SaveLogTiming"]=="AtPlay") {
					writelog("watch",VideoID + "　" + title);
				}
			}
		});
	}
}

// override for abs uri
NicoAPI.Mylist.add = function (group_id, item_type, item_id, description) {
	return NicoAPI.mylist_add_call(
		"http://www.nicovideo.jp/api/mylist/add",
		{ "group_id": group_id,
		  "item_type": item_type,
		  "item_id": item_id,
		  "description": description });
};
// copied & optimized from nico api js
function query(obj) {
	if (typeof obj == "object") {
		var params = [];
		for (var key in obj) {
			key = encodeURIComponent(key);
			query.encode(params, key, obj[key]);
		}
		return params.join("&");
	} else if (typeof obj == "string") {
		return obj;
	} else {
		throw new TypeError("non-Object passed to query()");
	}
}
query.encode = function (params, key, obj) {
	if (jQuery.isArray(obj)) {
		jQuery.each(obj, function (i, value) {
			query.encode(params, key + "[]", value);
		});
	} else if (typeof obj == "object") {
		for (var k in obj) {
			if (obj[k] !== undefined) {
				k = encodeURIComponent(k);
				query.encode(params, key + "[" + k + "]", obj[k]);
			}
		}
	} else if (obj === true) {
		params.push(key + "=1");
	} else if (obj === false) {
		params.push(key + "=0");
	} else if (obj === null) {
		params.push(key + "=");
	} else if (obj !== undefined) {
		params.push(key + "=" + encodeURIComponent(obj));
	}
}
NicoAPI.mylist_add_call = function (path, params, options) {
	params = params || {};
	options = jQuery.extend(this.defaultOptions, options || {});

	if (this.token)
		params.token = this.token;

	if (options.global && !NicoAPI.active++)
		jQuery.event.trigger("nicoApiStart");

	jQuery.ajax({
		type: "POST",
		url: path,
		data: query(params),
		dataType: "json",
		success: function (data, status) {
			if( data.status == NicoAPI.Status.SUCCESS ){
				// 成功
				alerter("指定されたマイリストに登録しました" );
			}
			else{
				// エラー
				alerter( data.error.description );
			}
		},
		error: function (_, status, e) {
			alerter("マイリストの登録時にエラーが発生しました");
		}
	});
};

function alerter (str) {
	$('#addMylistResult').html( str );
}

function __VideoInformation__addMylist(VideoID){
	// 動画番号からシステム側の ID を得る必要がある sm8311828 -> 1253666960
	var xmlhttp = createXMLHttpRequest();
	xmlhttp.open("GET", "http://www.nicovideo.jp/mylist_add/video/" + VideoID, false);
	xmlhttp.send();
	xmlhttp.responseText.match(/name="item_id" value="([0-9]{10,})">/i);    // hidden field
	if( ! RegExp.$1 ){
		alerter("登録できませんでした。ログインは済んでいますか？");
	}
	var realVideoId = RegExp.$1;
	
	// token を得る
	// NicoAPI.token = "4630161-1256991501-0bdb968a....";
	xmlhttp.responseText.match(/NicoAPI.token = "(.+?)">/i);
	if( ! RegExp.$1 ){
		alerter("登録できませんでした。ログインは済んでいますか？");
	}
	NicoAPI.token = RegExp.$1;    // like a black magic.. hehe
	
	// http://www.nicovideo.jp/mylist_add/video/sm8311828
	var mylistID = $('#__VideoInformation__Mylist').val();
	var addMylistSel = document.getElementById("__VideoInformation__Mylist");
	var addMylistI = addMylistSel.selectedIndex;
	
//	NicoAPI.Mylist.add(group_id, item_type, item_id, description);
	NicoAPI.Mylist.add(mylistID, "0", realVideoId, "");
}

// またニコニコ動画みてるグリースモンキーを流用
function __VideoInformation__addTwitter(span, VideoID, title){
	var btn = document.createElement("input");
	btn.setAttribute("type", "button");
	btn.setAttribute("value", "Twitterに投稿");
	btn.attachEvent("onclick", function(){
		var url = "http://www.nicovideo.jp/watch/" + VideoID;
		try{
			var xmlhttp = createXMLHttpRequest();
			xmlhttp.Open("POST", "http://twitter.com/statuses/update.json", false, settings["Twitter_Mail"], settings["Twitter_Pass"]);
			xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xmlhttp.Send("status=" + encodeURIComponent(
				"ニコ生から見てる : " +
				title + " " + url
			));
		}catch(e){
			alert("VideoInformation.Twitter:"+e.description);
		}
	});
	span.appendChild(btn);
}

// 接続時に流れている動画を捕捉
function __VideoInformation__onConnect(lv){
	if(!settings["UseIE"]) return;
	NicoLive.getXML("http://watch.live.nicovideo.jp/api/getplayerstatus?v=lv" + lv, 'normal', function(xmldom){
		if(!xmldom) return;
		if(xmldom.getElementsByTagName("error").length > 0){
			// 混雑中エラーの場合は1秒後に再試行
			if(xmldom.getElementsByTagName("code")[0].text=="unknown"){
				setTimeout(function(){__VideoInformation__onConnect(lv)}, 1000);
			}
			return;
		}
		var contents = xmldom.getElementsByTagName("contents");
		for(var i=0,l=contents.length; i<l; i++){
			var id = contents[i].getAttributeNode("id").value;
			if(id=="main"){
				__VideoInformation__receiveComment(new Chat("<chat>/play "+contents[i].text+"</chat>"));
			}
		}
	});
}