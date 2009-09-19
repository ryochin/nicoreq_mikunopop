SocketManager.attachEvent("receiveComment", __VideoInformation__receiveComment);

var __VideoInformation__PlayLog = "";
var __VideoInformation__Premium = false;
var __VideoInformation__MylistIDs = __VideoInformation__getMylistIDs();


function __VideoInformation__getMylistIDs(){
	var file = getMylistCacheFile();
	if( checkMylistCacheFileDateLastModified( file ) ){
		// キャッシュ無効、取得してローカルに保存
//		alert("マイリストキャッシュをサーバから取得");
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
//		alert("キャッシュが見つかったのでそのまま返却");
		return loadMylistCacheFile( file );
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
		if( now - epoch < 24 * 60 * 60 ){
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
	xmlhttp.open("GET", "http://www.nicovideo.jp/mylistgroup_edit", false);
	xmlhttp.send();
	// ついでにプレミアム判定しておく
	__VideoInformation__Premium = (xmlhttp.responseText.indexOf("プレミアム") > -1);
	var result = [];
	// マイページからマイリストのIDと名前を抽出
	var Options = xmlhttp.responseText.match(/ href="mylist\/(.+?)">(.+?)<\/a><\/strong>/ig);
	if(!Options) return result;
	for(var i=0,l=Options.length; i<l; i++){
		Options[i].match(/ href="mylist\/(.+?)">(.+?)<\/a><\/strong>/ig);
		var id = Number(RegExp.$1);
		var name = RegExp.$2;
		
		// ブラックリストに載っている名前を弾く
		if(Zen2Han(settings["MylistBlackList"].join(",")).indexOf(","+Zen2Han(name)+",") > -1)
			continue;
		
		if(!isNaN(id)){
			xmlhttp.open("GET","http://www.nicovideo.jp/mylist/" + id, false);
			xmlhttp.send();
			var Options2 = xmlhttp.responseText.match(/<h3><a class="video" href="watch\/(.+?)">(.+?)<\/a><\/h3>/ig);
			if(!Options2||Options2.length<500) {
				result.push('{id: ' + id + ',name: "' + name + '",flag: true}');
			}else{
				result.push('{id: ' + id + ',name: "' + name + '",flag: false}');
			}
		}
	}
	
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
//del		// ログに追記
//del		__VideoInformation__PlayLog += VideoID + "\n";
		document.getElementById("VideoInformation").innerHTML = "";
		NicoLive.getXML("http://ext.nicovideo.jp/api/getthumbinfo/" + VideoID, 'video', function(xmldom){
			if(!xmldom || xmldom.getElementsByTagName("error").length){
//add start
				__VideoInformation__PlayLog += VideoID + "\n";
				if(settings["SaveLogTiming"]=="AtPlay") writelog("watch",VideoID);
//add end
				return false;
			}else{
				// 動画情報を取得してみる
				var title = xmldom.getElementsByTagName("title")[0].text;
				var description = xmldom.getElementsByTagName("description")[0].text;
				var thumbnail_url = xmldom.getElementsByTagName("thumbnail_url")[0].text;
				var first_retrieve = xmldom.getElementsByTagName("first_retrieve")[0].text.replace("T"," ").replace("+09:00","");
				var view_counter = xmldom.getElementsByTagName("view_counter")[0].text;
				var comment_num = xmldom.getElementsByTagName("comment_num")[0].text;
				var mylist_counter = xmldom.getElementsByTagName("mylist_counter")[0].text;

				// HTMLの構築
				// IEはselectをinnerHTMLで追加できないバグがあるので非常に泥臭い処理をする
				if(settings["UseIE"]){
//del					document.getElementById("VideoInformation").innerHTML = VideoID + "をマイリスト ";
//add start
					document.getElementById("VideoInformation").innerHTML += "<span id=\"checkMylistResult\"></span>" + VideoID + "をマイリスト ";
//add end
					var sel = document.createElement("select");
					sel.setAttribute("id", "__VideoInformation__Mylist");
//add start
					var AllreadyExist = false;
//add end
					for(var i=0,l=__VideoInformation__MylistIDs.length; i<l; i++){
//add start
						if(settings["CheckPlayedVideoIdIsAdd2Mylists"]){
							// マイリスに登録されてるかどうか調査
							var xmlhttp = createXMLHttpRequest();
							xmlhttp.open("GET","http://www.nicovideo.jp/mylist/"+__VideoInformation__MylistIDs[i].id,false);
							xmlhttp.send();
							var result = new Array();
							result = xmlhttp.responseText.match(/<h3><a class="video" href="watch\/([^\"]+?)">([^<]+?)<\/a><\/h3>/ig);
							if(result) for(j=0;j<result.length;j++){
								result[j].match(/<h3><a class="video" href="watch\/([^\"]+?)">([^<]+?)<\/a><\/h3>/ig);
								if(RegExp.$1==VideoID){
									document.getElementById("checkMylistResult").innerHTML += VideoID+'はマイリスト「'+__VideoInformation__MylistIDs[i].name+'」に登録されています。<br>';
									AllreadyExist = true;
								}
							}
						}
						if(!(settings["CheckPlayedVideoIdIsAdd2Mylists"] && __VideoInformation__MylistIDs[i].flag==false)){
//add end
						var opt = document.createElement("option");
						opt.appendChild(document.createTextNode(__VideoInformation__MylistIDs[i].name));
						opt.setAttribute("value", __VideoInformation__MylistIDs[i].id);
						sel.appendChild(opt);
//add start
						}
//add end
					}
//add start
					if(!AllreadyExist) document.getElementById("checkMylistResult").innerHTML = VideoID+'はどのマイリストにも登録されていません。<br>';
//add end
					document.getElementById("VideoInformation").appendChild(sel);
					document.getElementById("VideoInformation").insertAdjacentHTML("BeforeEnd", " に <input type=\"button\" value=\"登録\" onclick=\"__VideoInformation__addMylist('"+VideoID+"')\">");
				}
				document.getElementById("VideoInformation").insertAdjacentHTML("BeforeEnd", ""+
					" <span id=\"__VideoInformation__Twitter\"></span><br>"+
//					(__VideoInformation__Premium?"":"<img src=\"./System/premium.gif\">") +
//del					"<img src=\"http://niconail.info/"+VideoID+"\" alt=\""+VideoID+" : "+title+"\" width=\"314\" height=\"178\"><br><br>" +
//add start
					"<hr />" +
					"<img src=\"http://niconail.info/"+VideoID+"\" alt=\""+VideoID+" : "+title+"\" width=\"314\" height=\"178\"><br>" +
					"<span class=\"subtitle\">彡 </span><span class=\"count\">"+(settings["GetMikunopopCount"]?getMikunopopCount(VideoID):"-")+"</span>" +
					" <span class=\"subtitle\">マイリスト率 </span>" + (Math.round(10000*(Number(mylist_counter)/Number(view_counter)))/100) +"%<br><br>" +
//add end
					"<div id=\"addMylistResult\"></div>"
				);
				if(settings["Twitter"]) __VideoInformation__addTwitter(document.getElementById("__VideoInformation__Twitter"), VideoID, title);
//add start
				__VideoInformation__PlayLog += VideoID + "　" + title + "\n";
				if(settings["SaveLogTiming"]=="AtPlay") {
					writelog("watch",VideoID + "　" + title);
				}
//add end
			}
		});
	}
}

function __VideoInformation__addMylist(VideoID){
	var mylistID = document.getElementById("__VideoInformation__Mylist").value;
	var xmlhttp = createXMLHttpRequest();
	xmlhttp.open("GET", "http://www.nicovideo.jp/watch/"+VideoID, false);
	xmlhttp.send();
	xmlhttp.responseText.match(/"csrf_token" value="(.+?)"/ig);
	var csrf_token = RegExp.$1;
	xmlhttp.open("POST", "http://www.nicovideo.jp/watch/"+VideoID, false);
	xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	var postData = "";
	var data = {
		"mylist": "add",
		"mylistgroup_name": "",
		"csrf_token": csrf_token,
		"group_id": mylistID,
		"ajax": "1"
	};
	for(name in data){
		postData += name+"="+encodeURIComponent(data[name])+"&";
	}
	postData = postData.substring(0, postData.length-1);// 最後の&を消す
	xmlhttp.send(postData);
	try{
		var result = eval(xmlhttp.responseText);
		var addMylistSel = document.getElementById("__VideoInformation__Mylist");
		var addMylistI = addMylistSel.selectedIndex;
		if(result && result.result=="success"){
			document.getElementById("addMylistResult").innerHTML += VideoID + "をマイリスト「" + addMylistSel.options[addMylistI].text + "」に登録しました";
//add start
			if(document.getElementById("checkMylistResult").innerHTML.match('はどのマイリストにも登録されていません。')){
				document.getElementById("checkMylistResult").innerHTML = VideoID+'はマイリスト「'+addMylistSel.options[addMylistI].text+'」に登録されています。<br>';
			}else{
				document.getElementById("checkMylistResult").innerHTML += VideoID+'はマイリスト「'+addMylistSel.options[addMylistI].text+'」に登録されています。<br>';
			}
//add end
		}else if(result.result=="duperror"){
			document.getElementById("addMylistResult").innerHTML += VideoID + "は既にマイリスト「" + addMylistSel.options[addMylistI].text + "」に登録されています。";
//add start
		}else if(result.result=="maxerror"){
			alert("マイリスト「" + addMylistSel.options[addMylistI].text + "」はすでに満杯なので追加できません。\n他のマイリストを指定してください。");
//add end
		}else{
			alert("想定外のエラー:"+result.result);
		}
	}catch(e){
		alert("想定外のエラー:"+e.description);
	}
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