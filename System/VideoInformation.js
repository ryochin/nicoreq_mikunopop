SocketManager.attachEvent("receiveComment", __VideoInformation__receiveComment);

var __VideoInformation__PlayLog = "";
var __VideoInformation__MylistIDs = __VideoInformation__getMylistIDs();


function __VideoInformation__getMylistIDs(){
	var file = getMylistCacheFile();
	if( settings["UseMylistInfoCache"] ){
		// �L���b�V���@�\���g�p����
		if( checkMylistCacheFileDateLastModified( file ) ){
			// �L���b�V�������A�擾���ă��[�J���ɕۑ�
//			alert("�}�C���X�g�L���b�V�����T�[�o����擾");
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
//			alert("�L���b�V�������������̂ł��̂܂ܕԋp");
			return loadMylistCacheFile( file );
		}
	}
	else{
		// �L���b�V���@�\���g�p���Ȃ�
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
		if( now - epoch < settings["MylistInfoCacheExpireHour"] * 60 * 60 ){
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
//				alert("���O�C���ł��܂���ł��� orz");
				return;
			}
		}
		else{
//			alert("���O�C���ł��܂���ł��� orz");
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
		var num = 0;    // ���݂͎擾�ł��Ȃ�

		// �u���b�N���X�g�ɍڂ��Ă��閼�O��e��
		if(Zen2Han(settings["MylistBlackList"].join(",")).indexOf(","+Zen2Han(title)+",") > -1)
			return;

		// 500 ���t���ɖ��܂��Ă��邩�ǂ������`�F�b�N���������猏���������o��
		if( num < 500 ){
			// �ǉ�����]�n������
			result.push('{id: ' + id + ',name: "' + title + '",flag: true}');
		}
		else{
			// ���������ς������ς�
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
				// ��������擾���Ă݂�
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
				
				// HTML�̍\�z
				// IE��select��innerHTML�Œǉ��ł��Ȃ��o�O������̂Ŕ��ɓD�L������������
				if(settings["UseIE"]){
					document.getElementById("VideoInformation").innerHTML
						+= "<span id=\"checkMylistResult\"></span>" + VideoID + " ���}�C���X�g ";
					var sel = document.createElement("select");
					sel.setAttribute("id", "__VideoInformation__Mylist");
					var AllreadyExist = false;
					for(var i=0,l=__VideoInformation__MylistIDs.length; i<l; i++){
						if(settings["CheckPlayedVideoIdIsAdd2Mylists"]){
							// �}�C���X�ɓo�^����Ă邩�ǂ�������
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
									+ VideoID + ' �̓}�C���X�g�u<span class="mylist-name">'+__VideoInformation__MylistIDs[i].name+'</span>�v�ɓo�^����Ă��܂��B<br>' );
								AllreadyExist = true;
							} );
						}
						
						// �}�C���X�g�̃v���_�E�������
						if(!(settings["CheckPlayedVideoIdIsAdd2Mylists"] && __VideoInformation__MylistIDs[i].flag==false)){
							var opt = document.createElement("option");
							opt.appendChild(document.createTextNode(__VideoInformation__MylistIDs[i].name));
							opt.setAttribute("value", __VideoInformation__MylistIDs[i].id);
							sel.appendChild(opt);
						}
					}
					
					if(!AllreadyExist)
						$('#checkMylistResult').html( VideoID + ' �͂ǂ̃}�C���X�g�ɂ��o�^����Ă��܂���B<br>' );
					
					document.getElementById("VideoInformation").appendChild(sel);
					document.getElementById("VideoInformation").insertAdjacentHTML("BeforeEnd",
						" �� <input type=\"button\" value=\"�o�^\" onclick=\"__VideoInformation__addMylist('" + VideoID + "')\">");
				}
				
				// ���ݗ���Ă���Ȃ̃T���l�C���Ə����Z�b�g
				var info = [];
				info.push(" <span id=\"__VideoInformation__Twitter\"></span><br>");
				info.push("<div id=\"addMylistResult\"></div>");
				info.push("<hr />");
				info.push("<img src=\"http://niconail.info/"+VideoID+"\" alt=\""+VideoID+" : "+title+"\" width=\"314\" height=\"178\">");

				// info
				info.push('<div class="info"><fieldset><legend>���</legend>');
				info.push("<span class=\"subtitle\">�~�N�m�x�E�c </span><span class=\"count\">"+(settings["GetMikunopopCount"]?getMikunopopCount(VideoID):"-")+"</span><br>");
				info.push("<span class=\"subtitle\">�}�C���X�g�� </span>" + (Math.round(10000*(Number(mylist_counter)/Number(view_counter)))/100) +"%<br>");
				info.push("</fieldset></div>");

				// tags
				info.push('<div class="tags"><fieldset><legend>�^�O</legend>');
				$.each( tags, function () {
					info.push( '<span>' + this.name + "</span>" );
					if( this.locked == true )
						info.push( ' <span class="locked" title="�^�O���b�N">*</span>' );
					info.push( "<br>" );
				} );
				info.push("</fieldset></div>");

				document.getElementById("VideoInformation").insertAdjacentHTML("BeforeEnd", info.join("") );

				if(settings["Twitter"]) __VideoInformation__addTwitter(document.getElementById("__VideoInformation__Twitter"), VideoID, title);
				
				// ���O�ɏ����o��
				__VideoInformation__PlayLog += VideoID + "�@" + title + "\n";
				if(settings["SaveLogTiming"]=="AtPlay") {
					writelog("watch",VideoID + "�@" + title);
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
				// ����
				alerter("�w�肳�ꂽ�}�C���X�g�ɓo�^���܂���" );
			}
			else{
				// �G���[
				alerter( data.error.description );
			}
		},
		error: function (_, status, e) {
			alerter("�}�C���X�g�̓o�^���ɃG���[���������܂���");
		}
	});
};

function alerter (str) {
	$('#addMylistResult').html( str );
}

function __VideoInformation__addMylist(VideoID){
	// ����ԍ�����V�X�e������ ID �𓾂�K�v������ sm8311828 -> 1253666960
	var xmlhttp = createXMLHttpRequest();
	xmlhttp.open("GET", "http://www.nicovideo.jp/mylist_add/video/" + VideoID, false);
	xmlhttp.send();
	xmlhttp.responseText.match(/name="item_id" value="([0-9]{10,})">/i);    // hidden field
	if( ! RegExp.$1 ){
		alerter("�o�^�ł��܂���ł����B���O�C���͍ς�ł��܂����H");
	}
	var realVideoId = RegExp.$1;
	
	// token �𓾂�
	// NicoAPI.token = "4630161-1256991501-0bdb968a....";
	xmlhttp.responseText.match(/NicoAPI.token = "(.+?)">/i);
	if( ! RegExp.$1 ){
		alerter("�o�^�ł��܂���ł����B���O�C���͍ς�ł��܂����H");
	}
	NicoAPI.token = RegExp.$1;    // like a black magic.. hehe
	
	// http://www.nicovideo.jp/mylist_add/video/sm8311828
	var mylistID = $('#__VideoInformation__Mylist').val();
	var addMylistSel = document.getElementById("__VideoInformation__Mylist");
	var addMylistI = addMylistSel.selectedIndex;
	
//	NicoAPI.Mylist.add(group_id, item_type, item_id, description);
	NicoAPI.Mylist.add(mylistID, "0", realVideoId, "");
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