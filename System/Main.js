var acceptRequest = true;
var timeLeftTimer  = 0;
var playStateTimer = 0;
//var JASCodes = new Array();
var PlayLog = "";
//add start
var NGIDs = new Array();
var PlayedVideoIds = new Array();
//add end


setWindowSize(settings["WindowWidth"], settings["WindowHeight"]);

window.attachEvent("onload", function(){
//add start
	NicoCookieImporter("connect", settings["browserType"], settings["cookieLifeSpan"]);
	// ���O�t�@�C���̍폜
	if(settings["DeleteLogWhenOpen"]){
		var fs = new ActiveXObject('Scripting.FileSystemObject');
		var watchlog = fs.GetParentFolderName(location.pathname)+"\\watchlog.txt";
		var playlog = fs.GetParentFolderName(location.pathname)+"\\playlog.txt";
		if(fs.FileExists(watchlog)) fs.DeleteFile(watchlog);
		if(fs.FileExists(playlog)) fs.DeleteFile(playlog);
	}
//add end
	if(!settings["UseIE"]){
		document.getElementById("divAutoPlay").style.display = "none";
		document.getElementById("btnPF").style.display = "none";
		document.getElementById("btnPR").style.display = "none";
		document.title += "(�������[�h)";
	}
	if(acceptRequest) openRequest(); else closeRequest();
	if(settings["PlayMode"]==1) document.getElementById("divPlaySub").style.display = "none";
	// SocketManager��FLASH�I�u�W�F�N�g��o�^
	// FLASH��ExternalInterface��o�^����֌W��onload�ȍ~�łȂ��Ƃ����Ȃ�
	SocketManager.setFlash(Socket);
	SocketManager.attachEvent("receiveComment", receiveComment_Request);
	if(settings["TopMost"]) TopMost();
//	loadJASCode();
//add start ���O�I�t�`�F�b�N
	if(settings["logoffCheck"]) document.getElementById("loginCheck").checked=true;
	checklogoffCheck();
	// NGIDList.txt����NG����ꗗ���擾
	loadNGIDs();
	// �X�g�b�N�̃��[�h
	if(settings["AutoLoadStock"]) loadStockList();
//add end
});

document.attachEvent("onkeydown", function(){
	var target = settings["key"][event.keyCode];
	if(target && typeof(target)=="function") target();
//del	if(event.keyCode==116) return false;
//add start
	if(event.keyCode==116) event.keyCode = 0;
//add end
});
//add start

window.attachEvent("onbeforeunload", function(){
	if(settings["AutoSaveStock"]) saveStockList();
	// �I�����Ƀ��O�ۑ�
	if(settings["SaveLogTiming"]=="AtEnd") {
		writelog("play",PlayLog);
		writelog("watch",__VideoInformation__PlayLog);
	}
	// �E�B���h�E�̈ʒu�E�T�C�Y��settings.js�ɔ��f
	if(settings["AutoSaveWindowParams"]) saveWindowSize();
	NicoCookieImporter("disconnect");
});
//add end

function connect(PS){
	if(!PS || PS.lv=="" || PS.addr=="" || PS.port=="" || PS.thread==""){
		//���O�I�t���������O�C���̃`�F�b�N���O��
		document.getElementById("loginCheck").checked = false;
	}else{
		SocketManager.connect(PS);
		PlayLog += "lv"+PS.lv+"\n";
		__VideoInformation__PlayLog += "lv"+PS.lv+"\n";
//add start
		if(settings["SaveLogTiming"]=="AtPlay") {
			writelog("play","lv"+PS.lv);
			writelog("watch","lv"+PS.lv);
		}
//add end
		if(timeLeftTimer!=0){
			clearInterval(timeLeftTimer);
		}
		timeLeftTimer = setInterval(getTimeLeft, 500);
		__VideoInformation__onConnect(PS.lv);
	}
}

// ���N�G�X�g�̃`�F�b�N
function receiveComment_Request(Chat){
//del	if(!acceptRequest) return;
	var text = Zen2Han(Chat.text);
//	checkJASCode(text);
	var sms  = text.match(/(sm|nm)\d+/g);
//add start
	//���Ǘ��ҋ@�\
	if (DummyAdminManager.Indexes[Chat.user_id] != undefined){
		var dummyAdminID = DummyAdminManager.DummyAdminQueues[DummyAdminManager.Indexes[Chat.user_id]].UserID;
		var dummyAdminName = DummyAdminManager.DummyAdminQueues[DummyAdminManager.Indexes[Chat.user_id]].Name;
		var dummyAdminCmdCheck = DummyAdminManager.DummyAdminQueues[DummyAdminManager.Indexes[Chat.user_id]].CmdFlag;
		var dummyAdminCmtCheck = DummyAdminManager.DummyAdminQueues[DummyAdminManager.Indexes[Chat.user_id]].CmtFlag;
		var dummyAdminNameCheck = DummyAdminManager.DummyAdminQueues[DummyAdminManager.Indexes[Chat.user_id]].NameFlag;

		if (Chat.user_id == dummyAdminID){
			if ((/^\s*\/(play|playsound|soundonly|stop|swap)(.*| sub$)/.test(Chat.text))
			 || (/^\s*\/swapand(play|playsound|stop)/.test(Chat.text))
			 || (/^\s*\/soundonly (on|off)(.*| sub$)/.test(Chat.text))
			 || (/^\s*\/(play|playsound)( (sm|nm|so|am|fz|ut|ax|ca|cd|cw|fx|ig|na|nl|om|sd|sk|yk|yo|za|zb|zc|zd|ze)\d+| \d{10})(.*| sub$)/.test(Chat.text))
			 || (/^\s*\/swapand(play|playsound)( (sm|nm|so|am|fz|ut|ax|ca|cd|cw|fx|ig|na|nl|om|sd|sk|yk|yo|za|zb|zc|zd|ze)\d+| \d{10})/.test(Chat.text))
			 || (/^\s*((sm|nm|so|am|fz|ut|ax|ca|cd|cw|fx|ig|na|nl|om|sd|sk|yk|yo|za|zb|zc|zd|ze)\d+|\d{10})($| sub$)/.test(Chat.text))
			   )
			{
				if (dummyAdminCmdCheck){
					NicoLive.postComment(Chat.text.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\n/g,"<br>").replace(/\r/g,""), Chat.mail!=undefined?Chat.mail.replace("184",""):Chat.mail);
					return;
				}
			}else{
				if (dummyAdminCmtCheck){
					if (dummyAdminNameCheck){
						if (dummyAdminName != ""){
							NicoLive.postComment("<font size=\"-8\">��"+dummyAdminName+"����</font><br />"+Chat.text.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\//g,"�^").replace(/\n/g,"<br>").replace(/\r/g,""), Chat.mail!=undefined?Chat.mail.replace("184",""):Chat.mail,"big");
						}else{
							NicoLive.postComment(Chat.text.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\//g,"�^").replace(/\n/g,"<br>").replace(/\r/g,""), Chat.mail!=undefined?Chat.mail.replace("184",""):Chat.mail);
						}
					}else{
						NicoLive.postComment(Chat.text.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\//g,"�^").replace(/\n/g,"<br>").replace(/\r/g,""), Chat.mail!=undefined?Chat.mail.replace("184",""):Chat.mail);
					}
					return;
				}
			}
		}
	}
//add end
	if(sms && !(/^\/(play|playsound|swapandplay) smile:/.test(text))){
//add start
		if(!acceptRequest){
			NicoLive.postComment(">>"+Chat.no+"����A���̓��N�󂯕t���ĂȂ��̂ŁE�E�E����", "big");
		}else if(sms[1]){
			NicoLive.postComment(">>"+Chat.no+"����A1�R��1���N�ł��肢���܂��B", "big");
		}else if(NGIDs[sms[0]]) {
			NicoLive.postComment(">>"+Chat.no+"����A���̓���͎��NG���惊�X�g��<br />�o�^�ς݂Ȃ̂ŗ����Ȃ���ł��A���߂�Ȃ���", "big");
		}else if(settings["AddPlayedVideoId2NGIDs"]&&PlayedVideoIds[sms[0]]) {
			NicoLive.postComment(">>"+Chat.no+"����A���̓���͗������΂���Ȃ̂ŁE�E�E���݂܂���B", "");
		}else if(settings["CheckNew"]){
			// �V�����ǂ����m�F���A�V���������ꍇ�͉^�c�R���ŒʒB
			NicoLive.getXML("http://ext.nicovideo.jp/api/getthumbinfo/" + sms[0], 'video', function(xmldom){
				if(!xmldom.getElementsByTagName("first_retrieve")[0]) {
					NicoLive.postComment(">>"+Chat.no+"����@<br />���̓���͕����I���R�ŕ����ł��܂���B", "big");
				}else{
					// ����
					var today = Math.floor(new Date(new Date().getTime())/1000);
					
					// �A�b�v���� e.g. 2009-09-03T23:45:56+09:00
					var first_retrieve = xmldom.getElementsByTagName("first_retrieve")[0].text
						.replace(/T/," ").replace(/\+.+$/,"").replace(/-/g,"/");
					var uploadedDay = Math.floor(new Date(new Date(first_retrieve)/1000));
					
					// �P�U�W���Ԉȓ��Ȃ�e��
					var limit = ( 7 * 24 * 60 * 60 ) - ( today - uploadedDay );
					if( limit > 0 ){
						// �c�莞�Ԃ�\������
						var msg = getTimeLeftMessage( limit );
						
						NicoLive.postComment("��"+Chat.no+"����A���̋Ȃ͂���"+ msg + "�o���Ȃ���<br>�����Ȃ��̂ł� m(_ _)m", "big");
					}
					else{
						RequestManager.addRequestQueue(new RequestQueue(sms[0], "C", Chat.no, 'listener'));
					}
				}
			});
		}else{
//add end
		RequestManager.addRequestQueue(new RequestQueue(sms[0], "C", Chat.no, 'listener'));
//add start
		}
//add end
	}
}

// JAS�R�[�h��`�ςݓ���ID�����[�h
//function loadJASCode(){
//	try{
//		var fso = new ActiveXObject("Scripting.FileSystemObject");
//		var file = fso.OpenTextFile("System\\jascode.csv");
//		while(!file.AtEndOfStream){
//			var line = file.ReadLine();
//			if(line != "") var temp = line.split(",");
//			JASCodes[temp[0]] = temp[1];
//		}
//		file.Close();
//	}catch(e){}
//}

// JAS�R�[�h�t�����N�G�X�g���`�F�b�N
//function checkJASCode(text){
//	var smJAS = text.match(/(sm|nm)\d+.+?[0-9a-zA-Z]{3}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]/ig);
//	if(!smJAS) return;
//	for(var i=0,l=smJAS.length; i<l; i++){
//		var sm = smJAS[i].match(/(sm|nm)\d+/);
//		var jc = smJAS[i].match(/[0-9a-zA-Z]{3}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]/);
//		JASCodes[sm[0]] = jc;
//	}
//}

// �ʏ탂�[�h�̍Đ�
RequestManager.Events["Play"] = function(id){
	// �������[�h
	if(!settings["UseIE"]){
		// �Đ������擾
		PlayLog += RequestManager.getPlayLog(id);
		PlayLog += "\n";
//add start
		if(settings["SaveLogTiming"]=="AtPlay") {
			writelog("play",PlayLog);
		}
//add end
		// �����{�^���𖳌���
		document.getElementById("PLY"+id).disabled = true;
	}
//add start
	if(settings["AddPlayedVideoId2NGIDs"]) PlayedVideoIds[id] = true;
//add end
	if(!SocketManager.connected) return;
	// PlayMode�ɂ���ď����𕪊�
	if(settings["PlayMode"]==0){
		NicoLive.postComment((document.getElementById("playSound").checked?"/playsound ":"/play ")+id+(document.getElementById("playSub").checked?" sub":""));
	}else if(settings["PlayMode"]==1){
		NicoLive.postComment("/swapandplay "+id);
		setTimeout(function(){
			NicoLive.postComment("/stop sub", "big");
		}, 5000);
	}
	PlayLog += RequestManager.getPlayLog(id)+"\n";
	// �����񂪎擾�ł��Ă��Ȃ�������I��
	if(!RequestManager.Requests[id]) return;
	// InfoComment�̓��e
	NicoLive.postComment(RequestManager.getInfoComment(id), "big");
	// InfoComment2���ݒ肳��Ă����玞�ԍ����e
	if(settings["InfoComment2"]!=""){
		setTimeout(function(){
			NicoLive.postComment(RequestManager.getInfoComment2(id), "big");
		}, settings["InfoCommentTimer"]);
	}
//add start
	if(settings["SaveLogTiming"]=="AtPlay") {
		writelog("play",PlayLog);
	}
//add end
	// �L���[�̍폜
	RequestManager.deleteRequestQueueById(id);
	// �Đ����^�X�N�̏���
	var startTime = new Date().getTime();
	var PlayTime  = RequestManager.Requests[id].getLengthNumber();
	if(playStateTimer!=0){
		clearInterval(playStateTimer);
		playStateTimer = 0;
	}
	playStateTimer = setInterval(function(){
//del		showPlayState(startTime, PlayTime);
//add start
		showPlayState(startTime, PlayTime, id);
//add end
	}, 500);
	// 2�x������h�����߂̏���
	document.getElementById("btnPF").disabled = true;
	// 5�b��ɕ���
	setTimeout(function(){
		document.getElementById("btnPF").disabled = false;
	}, 5000);
}

// ���N�G�X�g���X�g�̍ŏ����Đ�
function playFirst(){
	var cd = document.getElementById("RequestHTML").firstChild;
	if(cd) RequestManager.Events["Play"](cd.id);
}

// �����_���Đ�
function playRandom(){
	var index = GetRandom(0, RequestManager.RequestQueues.length-1);
	var RQ = RequestManager.RequestQueues[index];
	if(RQ) RequestManager.Events["Play"](RQ.id);
}

// ���N�G�X�g���X�g�̍ŏ����폜
function delFirst(){
	var cd = document.getElementById("RequestHTML").firstChild;
	if(cd) RequestManager.deleteRequestQueueById(cd.id);
}

// ���N�G�X�g�̕�W�؂�ւ�
function changeRequest(){
	if(acceptRequest){
		closeRequest();
	}else{
		openRequest();
	}
}

// ���N�G�X�g�̕�W�J�n
function openRequest(){
	acceptRequest = true;
	document.getElementById("btnCR").value="����";
	if(SocketManager.connected && document.getElementById("extraComment").checked) NicoLive.postComment("��W�J�n�I", "big");
}

// ���N�G�X�g�̕�W��~
function closeRequest(){
	acceptRequest = false;
	document.getElementById("btnCR").value="��W";
	if(SocketManager.connected && document.getElementById("extraComment").checked) NicoLive.postComment("��W���؁I", "big");
}

//�c�莞�Ԃ��v�Z
function getTimeLeft(){
	if(!SocketManager.connected) return;
	var tagF = "", tagT = "";
//del	//30[��]-(-�J�n����[�b]+���ݎ���[�b])
//del	var timeLeft = 1800 - (0-SocketManager.playerStatus.baseTime+new Date().getTime()/1000);
//add start
	//settings["LimitTime"][�b]-(-�J�n����[�b]+���ݎ���[�b])
	//�J�n���Ԃ͓��{���ԌŒ肾���A���ݎ��Ԃ͓��{���ԂƂ͌���Ȃ��̂ł��ꂼ��UTC�W�����ɕϊ�
	//�������A�T�}�[�^�C������������Ă�ꍇ�ɂ͂���ɕ␳���K�v
	var timeLeft = settings["LimitTime"] - (0-(SocketManager.playerStatus.baseTime-9*60*60)+(new Date().getTime()/1000 + new Date().getTimezoneOffset()*60));
//add end
	if(timeLeft<600){
		tagF="<font color=red>";
		tagT="</font>";
	}
//	document.getElementById("timeleft").innerHTML = "�c�莞��/" + tagF + convertTimeString(timeLeft) + tagT;
	document.getElementById("timeleft").innerHTML = "�c " + tagF + convertTimeString(timeLeft) + tagT;
	if(timeLeft<=0){
		if(timeLeftTimer!=0){
			clearInterval(timeLeftTimer);
			timeLeftTimer = 0;
		}
		//30���������O�I�t
		if(document.getElementById("logoffCheck").checked){
			disconnect();
		}
		document.getElementById("timeleft").innerHTML = "�����I��";
	}
}

// �����Đ�
function checkAutoPlay(flag){
	document.getElementById("autoPlayInterval").disabled = flag;
	document.getElementById("autoPlayRandom").disabled = flag;
	document.getElementById("autoPlayStanby").disabled = flag;
}

// �Đ����̕\���Ǝ����Đ��̃`�F�b�N
// getTimeLeft�Ƃ͎��Ԃ̈��������t�Ȃ̂ɒ���
//del function showPlayState(startTime, PlayTime){
//add start
function showPlayState(startTime, PlayTime, id){
//add end
	var tagF = "", tagT = "";
	var timeLeft = (new Date().getTime() - startTime) / 1000;
	var Interval = Number(document.getElementById("autoPlayInterval").value);
	var autoPlay = document.getElementById("autoPlay").checked;
	var min = (autoPlay && Interval < PlayTime) ? Interval : PlayTime;
	if(timeLeft>=(min-20)){
		tagF="<font color=red>";
		tagT="</font>";
	}
//del	min += settings["AutoPlayMargin"];
//add start
	if(id.match("sm")){
		min += settings["AutoPlayMargin"];
	}
	else if(id.match("nm")){
		min += settings["AutoPlayMargin_nm"];
	}
//add end
	// �Đ���
	if(min-timeLeft>0){
		var residue;
		if( settings["TimeLeftCountdown"] == 1 ){
			// �J�E���g�_�E��
			residue = PlayTime - timeLeft;
			if( residue < 0 ){
				residue = 0;
			}
		}
		else{
			// �J�E���g�A�b�v�i�f�t�H���g�j
			residue = timeLeft;
		}
		document.getElementById("playState").innerHTML = tagF+convertTimeString(residue)+"/"+convertTimeString(PlayTime)+tagT;
	// �Đ��I��
	}else{
		// �����Đ���ON�ł��胊�N�G�X�g�L���[��0�̏ꍇ��
		if(autoPlay && RequestManager.RequestQueues.length==0){
			if(document.getElementById("autoPlayStanby").checked){
				document.getElementById("playState").innerHTML = "�ҋ@��";
			}else{
				document.getElementById("autoPlay").checked = false;
				checkAutoPlay(false);
			}
			return;
		}
		// �Đ����̒�~
		if(playStateTimer!=0){
			clearInterval(playStateTimer);
			playStateTimer = 0;
		}
		// �����Đ���ON�Ȃ玟�̓�����Đ�
		if(autoPlay){
			if(document.getElementById("autoPlayRandom").checked){
				var l = RequestManager.RequestQueues.length;
				var index = GetRandom(0, l-1);
				RequestManager.Events["Play"](RequestManager.RequestQueues[index].id);
			}else{
				clearInterval(playStateTimer);
				playFirst();
			}
		// �����Đ���OFF�Ȃ�Đ��I�����đҋ@
		}else{
			document.getElementById("playState").innerHTML = "�Đ��I��";
		}
	}
}

function convertTimeString(num){
	mm=parseInt(num/60);
	if(mm<10) mm = "0"+mm;
	ss=parseInt(num%60);
	if(ss<10) ss = "0"+ss;
	return mm+":"+ss;
}

// �������O�C���@�\
function checkloginCheck(){
	//�`�F�b�N���Ȃ����ڑ�������ꍇ�͏����I��
	if(!document.getElementById("loginCheck").checked || SocketManager.connected) return;
	//���O�I�t���������O�C���Ƀ`�F�b�N�������Ă�A���A�ڑ����Ȃ���ΐڑ���ʂ�\��
	connectDialog();
}

// �������O�I�t�@�\
function checklogoffCheck(){
	if(!document.getElementById("loginCheck").checked || (SocketManager.connected && document.getElementById("timeleft").innerHTML!="�����I��")) return;
	disconnect();
}
//add start

// �E�B���h�E�̈ʒu�E�T�C�Y��settings.js�ɔ��f
function saveWindowSize(){
	try{
		var windowX = window.event.screenX - window.event.clientX;
		var windowY = window.event.screenY - window.event.clientY;
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		var orgsettings = fso.GetParentFolderName(location.pathname)+"\\settings.js";
		var settingstmp = fso.GetParentFolderName(location.pathname)+"\\settings.tmp";
		var readsettings = fso.OpenTextFile(orgsettings);
		var writesettingstmp = fso.CreateTextFile(settingstmp,true);
		while(!readsettings.AtEndOfStream){
			var line = readsettings.ReadLine();
			if(line.match(/settings\[\"WindowWidth\"\]/)){
				writesettingstmp.WriteLine('settings["WindowWidth"] = ' + document.body.clientWidth + ';');
			}else if(line.match(/settings\[\"WindowHeight\"\]/)){
				writesettingstmp.WriteLine('settings["WindowHeight"] = ' + document.body.clientHeight + ';');
			}else if(line.match(/settings\[\"WindowX\"\]/)){
				writesettingstmp.WriteLine('settings["WindowX"] = ' + windowX + ';');
			}else if(line.match(/settings\[\"WindowY\"\]/)){
				writesettingstmp.WriteLine('settings["WindowY"] = ' + windowY + ';');
			}else{
				writesettingstmp.WriteLine(line);
			}
		}
		readsettings.Close();
		writesettingstmp.Close();
		fso.CopyFile(settingstmp, orgsettings, true);
		fso.DeleteFile(settingstmp);
	}catch(e){}
}

// stock.txt����X�g�b�N�����[�h
function loadStockList(){
	try{
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		var stockfile = fso.GetParentFolderName(location.pathname)+"\\stock.txt";
		if(!fso.FileExists(stockfile)) return;
		var file = fso.OpenTextFile(stockfile);
		var count = 1;
		while(!file.AtEndOfStream){
			//count++;
			var line = file.ReadLine();
			if(line.match(/([sn]m\d+)/)){
				line.match(/([sn]m\d+)/);
				RequestManager.addRequestQueue(new RequestQueue(RegExp.$1, "L", count++, 'stock'));
			}
		}
		file.Close();
	}catch(e){}
}

// ���݂̃X�g�b�N���X�g��ۑ�
function saveStockList(){
	try{
		var fs = new ActiveXObject("Scripting.FileSystemObject");
		var stockfile = fs.GetParentFolderName(location.pathname)+"\\stock.txt";
		if(RequestManager.RequestQueues.length==0) {
			if(!settings["AutoSaveStock"]||fs.FileExists(stockfile)) fs.DeleteFile(stockfile,true);
			return;
		}
		var stocklist = new Array();
		for(var i=0;i<RequestManager.RequestQueues.length;i++){
			var RQ = RequestManager.RequestQueues[i];
			stocklist.push(RQ.id);
		}
		var cf = fs.CreateTextFile(stockfile)
		for(var i=0;i<stocklist.length;i++){
			cf.WriteLine(stocklist[i]);
		}
		cf.Close(); 
	}catch(e){}
}

// NG����ID�����[�h
function loadNGIDs(){
	try{
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		var file = fso.OpenTextFile("NGIDList.txt");
		while(!file.AtEndOfStream){
			var line = file.ReadLine();
			if(line.match(/([sn]m\d+)/)){
				line.match(/([sn]m\d+)/);
				NGIDs[RegExp.$1] = true;
			}
		}
		file.Close();
	}catch(e){}
}

function extend(){
	settings["LimitTime"] += 1800;
}

function LimitTimeReset(){
	settings["LimitTime"] = 1800;
}

function setSelectedUseridToDummyAdmin(UserId){
	document.getElementById("Tab").selectedIndex = 4;
	document.getElementById("dummyAdminID").value = UserId;
}

function NicoCookieImporter(flag, browserType, cookieLifeSpan){
	try{
		var WshShell = new ActiveXObject("WScript.Shell");
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		var NicoCookieFilePath = fso.GetParentFolderName(location.pathname)+"\\NicoCookieImporter\\NicoCookieImporter.exe";
		var NicoCookieFileExist = fso.FileExists(NicoCookieFilePath);
	}catch(e){
		var NicoCookieFileExist = false;
	}
	if(!NicoCookieFileExist){
		if(browserType!=0 && flag=="connect") alert("�ڑ��ɂ� NicoCookieImporter ���K�v�ł��B");
		return;
	}
	if(browserType!=0){
		if(flag=="connect"){
			var NicoCookieImportResult = WshShell.run("\"" + NicoCookieFilePath + "\" " + cookieLifeSpan + " " + browserType , 0, true);
		}
		if(flag=="disconnect"){
			var NicoCookieImportResult = WshShell.run("\"" + NicoCookieFilePath + "\" -1" , 0, true);
		}
		if(NicoCookieImportResult!=0) alert("�u���E�U��Cookie�̋��L�Ɏ��s���܂����B�j�R�j�R�Ɛڑ��ł��܂���B");
	}
}

var AutoCmtAllMode = 0;
var AutoCmtTimerID;

//�����R�����g�o��
function AutoCmtOnePut(){
	var TargetCmtText;
	var AutoTimerInterval;

	if (document.getElementById("AutoCmtText").value == "") return;

	//���s���Ȃ���Εt��
	if (document.getElementById("AutoCmtText").value.match("\n") != "\n"){
		document.getElementById("AutoCmtText").value += "\n";
	}

	//1�s�����񒊏o&�o��
	TargetCmtText = document.getElementById("AutoCmtText").value.match("^.*\n");
	NicoLive.postComment(TargetCmtText, "");

	//�o�͕�����폜
	document.getElementById("AutoCmtText").value = document.getElementById("AutoCmtText").value.replace(TargetCmtText,"");

	if (AutoCmtAllMode == 1){
		//�����M�R�����g���L��΃^�C�}�[��ɍēx���s
		if (document.getElementById("AutoCmtText").value != ""){
			AutoTimerInterval = document.getElementById("AutoCmtInterval").value * 1000;
			AutoCmtTimerID = setTimeout(AutoCmtOnePut, AutoTimerInterval);
		}else{
			AutoCmtAllMode = 0;
			document.getElementById("AutoCmAlltBtn").value="�A���o��"
			document.getElementById("AutoCmtInterval").disabled = "";
		}
	}
}

//�����R�����g�o��(�S�s)
function AutoCmtAllPut(){
	if (AutoCmtAllMode == 0){
		AutoCmtAllMode = 1;
		document.getElementById("AutoCmAlltBtn").value="�o�͒�~"
		document.getElementById("AutoCmtInterval").disabled = "true";
		AutoCmtOnePut();
	}else{
		AutoCmtAllMode = 0;
		document.getElementById("AutoCmAlltBtn").value="�A���o��"
		document.getElementById("AutoCmtInterval").disabled = "";
		clearTimeout(AutoCmtTimerID);
	}
}

// ������̍ŐV�R�����g���擾(�e�X�g��)
if (typeof DOMParser == "undefined") {
	DOMParser = function () {};
	DOMParser.prototype.parseFromString = function (str, contentType) {
		if (typeof ActiveXObject != "undefined") {
			var d = new ActiveXObject("MSXML.DomDocument");
			d.loadXML(str);
			return d;
		} else if (typeof XMLHttpRequest != "undefined") {
			var req = new XMLHttpRequest;
			req.open("GET", "data:" + (contentType || "application/xml") +
				";charset=utf-8," + encodeURIComponent(str), false);
			if (req.overrideMimeType) {
				req.overrideMimeType(contentType);
			}
			req.send(null);
			return req.responseXML;
		}
	};
}

function getComment(id){
	xmlhttp = createXMLHttpRequest();
	xmlhttp.onreadystatechange = function(){_getComment(id)};
	xmlhttp.Open("GET", "http://www.nicovideo.jp/watch/"+id);
	xmlhttp.Send(null);
}

function _getComment(id){
	if (xmlhttp && (xmlhttp.readyState == 4) && (xmlhttp.status == 200)) {
		xmlhttp = createXMLHttpRequest();
		xmlhttp.onreadystatechange = function(){myDispFLVStat(id)};
		xmlhttp.Open("GET", "http://www.nicovideo.jp/api/getflv?v="+id);
		xmlhttp.Send(null);
	}
}

function myDispFLVStat(id){
	if (xmlhttp && (xmlhttp.readyState == 4) && (xmlhttp.status == 200)) {
		myXThreadId = unescape(/thread_id\=(.*?)\&/.exec(xmlhttp.responseText)[1]);
		myXMS       = unescape(/ms\=(.*?)\&/.exec(xmlhttp.responseText)[1]);
		myXUserId   = unescape(/user_id\=(.*?)\&/.exec(xmlhttp.responseText)[1]);
//		alert("myXThreadId = "+myXThreadId+"\nmyXMS       = "+myXMS+"\nmyXUserId   = "+myXUserId);
		myGetWayBackKey(id);
	}
}

function myGetWayBackKey(id){
	xmlhttp = createXMLHttpRequest();
	xmlhttp.onreadystatechange = function(){myDispWayBackKey(id)};
	xmlhttp.Open("GET", "http://www.nicovideo.jp/api/getwaybackkey?thread=" + myXThreadId);
	xmlhttp.Send(null);
}

function myDispWayBackKey(id){
	if (xmlhttp && (xmlhttp.readyState == 4) && (xmlhttp.status == 200)) {
		myXWBK      = unescape(/waybackkey\=(.*?)$/.exec( xmlhttp.responseText)[1]);
//		alert("myXWBK      = "+myXWBK);
		myPostCmt(id);
	}
}

function myPostCmt(id){
	if (xmlhttp && (xmlhttp.readyState == 4) && (xmlhttp.status == 200)) {
		var myData = "<thread no_compress=\"0\" " +
				"user_id=\"" + myXUserId + "\" " +
				"when=\"" + (Math.floor(new Date().getTime()/1000)+new Date().getTimezoneOffset()*60) + "\" " +
				"waybackkey=\"" + myXWBK + "\" " +
				"res_from=\"1000\" " +
				"version=\"20061206\" " +
				"thread=\"" + myXThreadId + "\" />";
		xmlhttp = createXMLHttpRequest();
		xmlhttp.onreadystatechange = function(){myDispCmt(id)};
		xmlhttp.open("POST", myXMS);
		xmlhttp.setRequestHeader("content-type","text/xml");
		xmlhttp.send(myData);
	}
}
function myDispCmt(id){
	if (xmlhttp && (xmlhttp.readyState == 4) && (xmlhttp.status == 200)) {
		alert(xmlhttp.responseText);
//		var xml = (new DOMParser()).parseFromString(xmlhttp.responseText, "text/xml");
//		var tags = xml.getElementsByTagName("chat");
//		alert(tags.length);
	}
}
//add end

function getTimeLeftMessage (sec) {
	var msg;
	if( sec > 2 * 24 * 60 * 60 ){
		// �Q���ȏ�
		var day = parseInt( sec / ( 24 * 60 * 60 ) );
		msg = day + "��";
	}
	else if( sec > 24 * 60 * 60 ){
		// �Q���ȉ�
		var day = parseInt( sec / ( 24 * 60 * 60 ) );
		var hour = parseInt( ( sec - ( day * 24 * 60 * 60 ) ) / ( 60 * 60 ) );
		if( hour == 0 ){
			msg = day + "��";
		}
		else{
			msg = day + "��" + hour + "����";
		}
	}
	else if( sec > 60 * 60 ){
		// �P���ȉ�
		var hour = parseInt( sec / ( 60 * 60 ) );
		var min = parseInt( ( sec - ( hour * 60 * 60 ) ) / 60 );
		
		if( hour < 12 && min != 0 ){
			msg = hour + "����" + min + "��";
		}
		else{
			msg = hour + "����";
		}
	}
	else if( sec > 60 ){
		// �P���Ԉȉ�
		var min = parseInt( sec / 60 );
		msg = min + "��";
	}
	else{
		// �P���ȓ�
		msg = sec + "�b";
	}
	
	return msg;
}

