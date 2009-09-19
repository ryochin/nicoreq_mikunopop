SocketManager.attachEvent("receiveComment", __VideoInformation__receiveComment);

var __VideoInformation__PlayLog = "";
var __VideoInformation__Premium = false;
var __VideoInformation__MylistIDs = __VideoInformation__getMylistIDs();


function __VideoInformation__getMylistIDs(){
	var file = getMylistCacheFile();
	if( checkMylistCacheFileDateLastModified( file ) ){
		// �L���b�V�������A�擾���ă��[�J���ɕۑ�
//		alert("�}�C���X�g�L���b�V�����T�[�o����擾");
		var content;
		try {
			content = __VideoInformation__getMylistIDs_via_net();
			saveMylistCacheFile( file, content );
			return eval('(' + content + ')');    // json to object
		} catch (e) {
			alert("�}�C���X�g�̏��𐳏�Ɏ擾�ł��܂���ł��� orz\n�i�T�[�o�����G���Ă���ƋN����₷���悤�ł��j");
			return;
		}
	}
	else{
		// �L���b�V����Ԃ�
//		alert("�L���b�V�������������̂ł��̂܂ܕԋp");
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
			alert("�f�B���N�g���̍쐬�Ɏ��s���܂��� orz");
		}
	}
	
	// file
	var st = fs.OpenTextFile(file, 2, true, -2);
	// simply write down all the content as-is :)
	try {
		st.writeLine(content);
	} catch (e) {
		alert("�t�@�C���̏������݂Ɏ��s���܂��� orz");
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
		alert("�}�C���X�g�L���b�V���̓ǂݍ��݂Ɏ��s���܂��� orz");
	} finally {
		st.Close();
	}
}

function checkMylistCacheFileDateLastModified (file) {
	var fs = new ActiveXObject('Scripting.FileSystemObject');
	if( fs.FileExists(file) == true ){
		// �ŏI�X�V���Ԃ�����
		var f = fs.GetFile(file);
		var s = f.DateLastModified;
		var epoch = parseInt( Date.parse(s), 10 ) / 1000;
		var now = parseInt( (new Date).getTime() / 1000, 10 );
		if( now - epoch < 24 * 60 * 60 ){
			// �L���b�V���������Ă���
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
	// ���łɃv���~�A�����肵�Ă���
	__VideoInformation__Premium = (xmlhttp.responseText.indexOf("�v���~�A��") > -1);
	var result = [];
	// �}�C�y�[�W����}�C���X�g��ID�Ɩ��O�𒊏o
	var Options = xmlhttp.responseText.match(/ href="mylist\/(.+?)">(.+?)<\/a><\/strong>/ig);
	if(!Options) return result;
	for(var i=0,l=Options.length; i<l; i++){
		Options[i].match(/ href="mylist\/(.+?)">(.+?)<\/a><\/strong>/ig);
		var id = Number(RegExp.$1);
		var name = RegExp.$2;
		
		// �u���b�N���X�g�ɍڂ��Ă��閼�O��e��
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
//del		// ���O�ɒǋL
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
				// ��������擾���Ă݂�
				var title = xmldom.getElementsByTagName("title")[0].text;
				var description = xmldom.getElementsByTagName("description")[0].text;
				var thumbnail_url = xmldom.getElementsByTagName("thumbnail_url")[0].text;
				var first_retrieve = xmldom.getElementsByTagName("first_retrieve")[0].text.replace("T"," ").replace("+09:00","");
				var view_counter = xmldom.getElementsByTagName("view_counter")[0].text;
				var comment_num = xmldom.getElementsByTagName("comment_num")[0].text;
				var mylist_counter = xmldom.getElementsByTagName("mylist_counter")[0].text;

				// HTML�̍\�z
				// IE��select��innerHTML�Œǉ��ł��Ȃ��o�O������̂Ŕ��ɓD�L������������
				if(settings["UseIE"]){
//del					document.getElementById("VideoInformation").innerHTML = VideoID + "���}�C���X�g ";
//add start
					document.getElementById("VideoInformation").innerHTML += "<span id=\"checkMylistResult\"></span>" + VideoID + "���}�C���X�g ";
//add end
					var sel = document.createElement("select");
					sel.setAttribute("id", "__VideoInformation__Mylist");
//add start
					var AllreadyExist = false;
//add end
					for(var i=0,l=__VideoInformation__MylistIDs.length; i<l; i++){
//add start
						if(settings["CheckPlayedVideoIdIsAdd2Mylists"]){
							// �}�C���X�ɓo�^����Ă邩�ǂ�������
							var xmlhttp = createXMLHttpRequest();
							xmlhttp.open("GET","http://www.nicovideo.jp/mylist/"+__VideoInformation__MylistIDs[i].id,false);
							xmlhttp.send();
							var result = new Array();
							result = xmlhttp.responseText.match(/<h3><a class="video" href="watch\/([^\"]+?)">([^<]+?)<\/a><\/h3>/ig);
							if(result) for(j=0;j<result.length;j++){
								result[j].match(/<h3><a class="video" href="watch\/([^\"]+?)">([^<]+?)<\/a><\/h3>/ig);
								if(RegExp.$1==VideoID){
									document.getElementById("checkMylistResult").innerHTML += VideoID+'�̓}�C���X�g�u'+__VideoInformation__MylistIDs[i].name+'�v�ɓo�^����Ă��܂��B<br>';
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
					if(!AllreadyExist) document.getElementById("checkMylistResult").innerHTML = VideoID+'�͂ǂ̃}�C���X�g�ɂ��o�^����Ă��܂���B<br>';
//add end
					document.getElementById("VideoInformation").appendChild(sel);
					document.getElementById("VideoInformation").insertAdjacentHTML("BeforeEnd", " �� <input type=\"button\" value=\"�o�^\" onclick=\"__VideoInformation__addMylist('"+VideoID+"')\">");
				}
				document.getElementById("VideoInformation").insertAdjacentHTML("BeforeEnd", ""+
					" <span id=\"__VideoInformation__Twitter\"></span><br>"+
//					(__VideoInformation__Premium?"":"<img src=\"./System/premium.gif\">") +
//del					"<img src=\"http://niconail.info/"+VideoID+"\" alt=\""+VideoID+" : "+title+"\" width=\"314\" height=\"178\"><br><br>" +
//add start
					"<hr />" +
					"<img src=\"http://niconail.info/"+VideoID+"\" alt=\""+VideoID+" : "+title+"\" width=\"314\" height=\"178\"><br>" +
					"<span class=\"subtitle\">�c </span><span class=\"count\">"+(settings["GetMikunopopCount"]?getMikunopopCount(VideoID):"-")+"</span>" +
					" <span class=\"subtitle\">�}�C���X�g�� </span>" + (Math.round(10000*(Number(mylist_counter)/Number(view_counter)))/100) +"%<br><br>" +
//add end
					"<div id=\"addMylistResult\"></div>"
				);
				if(settings["Twitter"]) __VideoInformation__addTwitter(document.getElementById("__VideoInformation__Twitter"), VideoID, title);
//add start
				__VideoInformation__PlayLog += VideoID + "�@" + title + "\n";
				if(settings["SaveLogTiming"]=="AtPlay") {
					writelog("watch",VideoID + "�@" + title);
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
	postData = postData.substring(0, postData.length-1);// �Ō��&������
	xmlhttp.send(postData);
	try{
		var result = eval(xmlhttp.responseText);
		var addMylistSel = document.getElementById("__VideoInformation__Mylist");
		var addMylistI = addMylistSel.selectedIndex;
		if(result && result.result=="success"){
			document.getElementById("addMylistResult").innerHTML += VideoID + "���}�C���X�g�u" + addMylistSel.options[addMylistI].text + "�v�ɓo�^���܂���";
//add start
			if(document.getElementById("checkMylistResult").innerHTML.match('�͂ǂ̃}�C���X�g�ɂ��o�^����Ă��܂���B')){
				document.getElementById("checkMylistResult").innerHTML = VideoID+'�̓}�C���X�g�u'+addMylistSel.options[addMylistI].text+'�v�ɓo�^����Ă��܂��B<br>';
			}else{
				document.getElementById("checkMylistResult").innerHTML += VideoID+'�̓}�C���X�g�u'+addMylistSel.options[addMylistI].text+'�v�ɓo�^����Ă��܂��B<br>';
			}
//add end
		}else if(result.result=="duperror"){
			document.getElementById("addMylistResult").innerHTML += VideoID + "�͊��Ƀ}�C���X�g�u" + addMylistSel.options[addMylistI].text + "�v�ɓo�^����Ă��܂��B";
//add start
		}else if(result.result=="maxerror"){
			alert("�}�C���X�g�u" + addMylistSel.options[addMylistI].text + "�v�͂��łɖ��t�Ȃ̂Œǉ��ł��܂���B\n���̃}�C���X�g���w�肵�Ă��������B");
//add end
		}else{
			alert("�z��O�̃G���[:"+result.result);
		}
	}catch(e){
		alert("�z��O�̃G���[:"+e.description);
	}
}

// �܂��j�R�j�R����݂Ă�O���[�X�����L�[�𗬗p
function __VideoInformation__addTwitter(span, VideoID, title){
	var btn = document.createElement("input");
	btn.setAttribute("type", "button");
	btn.setAttribute("value", "Twitter�ɓ��e");
	btn.attachEvent("onclick", function(){
		var url = "http://www.nicovideo.jp/watch/" + VideoID;
		try{
			var xmlhttp = createXMLHttpRequest();
			xmlhttp.Open("POST", "http://twitter.com/statuses/update.json", false, settings["Twitter_Mail"], settings["Twitter_Pass"]);
			xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xmlhttp.Send("status=" + encodeURIComponent(
				"�j�R�����猩�Ă� : " +
				title + " " + url
			));
		}catch(e){
			alert("VideoInformation.Twitter:"+e.description);
		}
	});
	span.appendChild(btn);
}

// �ڑ����ɗ���Ă��铮���ߑ�
function __VideoInformation__onConnect(lv){
	if(!settings["UseIE"]) return;
	NicoLive.getXML("http://watch.live.nicovideo.jp/api/getplayerstatus?v=lv" + lv, 'normal', function(xmldom){
		if(!xmldom) return;
		if(xmldom.getElementsByTagName("error").length > 0){
			// ���G���G���[�̏ꍇ��1�b��ɍĎ��s
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