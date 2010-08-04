var acceptRequest = true;
var timeLeftTimer  = 0;
var playStateTimer = 0;
var PlayLog = "";
var NGIDs = new Array();
var PlayedVideoIds = new Array();
var lastPlayedID = "";    // ���߂ɗ���������
var apiToken = "";    // API token

setWindowSize(settings["WindowWidth"], settings["WindowHeight"]);

window.attachEvent("onload", function(){
	NicoCookieImporter("connect", settings["browserType"], settings["cookieLifeSpan"]);
	// ���O�t�@�C���̍폜
	if(settings["DeleteLogWhenOpen"]){
		var fs = new ActiveXObject('Scripting.FileSystemObject');
		var watchlog = fs.GetParentFolderName(location.pathname)+"\\watchlog.txt";
		var playlog = fs.GetParentFolderName(location.pathname)+"\\playlog.txt";
		if(fs.FileExists(watchlog)) fs.DeleteFile(watchlog);
		if(fs.FileExists(playlog)) fs.DeleteFile(playlog);
	}
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
	if(settings["logoffCheck"]) document.getElementById("loginCheck").checked=true;
	checklogoffCheck();
	// NGIDList.txt����NG����ꗗ���擾
	loadNGIDs();
	// �X�g�b�N�̃��[�h
	if(settings["AutoLoadStock"]) loadStockList();

	// multi_req_check
	if( settings["multiRequestLimit"] > 0 ){
		// on
		$('#multiReqCheck').attr( { checked: 1 } );
		$('#multiReqNum').val( settings["multiRequestLimit"] );
	}
	else{
		// off
		$('#multiReqCheck').attr( { checked: 0 } );
		$('#multiReqNum').attr( { disabled: 1 } );
		$('#multiReqNum').val( 1 );
	}
	
	$('#multiReqCheck').click( function () {
		// 
		if( $(this).attr('checked') ){
			$('#multiReqNum').attr( { disabled: 0 } );
			settings["multiRequestLimit"] = $('#multiReqNum').val();
		}
		else{
			$('#multiReqNum').attr( { disabled: 1 } );
			settings["multiRequestLimit"] = 0;
		}
	} );
	
	$('#multiReqNum').keyup( function () {
		var n = parseInt( $(this).val() );
		if( n > 0 ){
			// ok
			settings["multiRequestLimit"] = $(this).val();
		}
		else{
			// invalid
			settings["multiRequestLimit"] = 1;
		}
	} );
	$('#multiReqNum').blur( function () {
		if( ! $(this).val().match(/^[1-9][0-9]*$/) )
			$(this).val(1);
	} );
});

document.attachEvent("onkeydown", function(){
	var target = settings["key"][event.keyCode];
	if(target && typeof(target)=="function") target();

	if(event.keyCode==116) event.keyCode = 0;
});

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

var liveID = null;

function connect(PS){
	if(!PS || PS.lv=="" || PS.addr=="" || PS.port=="" || PS.thread==""){
		//���O�I�t���������O�C���̃`�F�b�N���O��
		document.getElementById("loginCheck").checked = false;
	}else{
		SocketManager.connect(PS);
		PlayLog += getLiveTitle( PS.lv ) + "\n";
		__VideoInformation__PlayLog += getLiveTitle( PS.lv ) + "\n";

		if(settings["SaveLogTiming"]=="AtPlay") {
			writelog("play","lv"+PS.lv);
			writelog("watch","lv"+PS.lv);
		}

		if(timeLeftTimer!=0){
			clearInterval(timeLeftTimer);
		}
		timeLeftTimer = setInterval(getTimeLeft, 500);
		__VideoInformation__onConnect(PS.lv);
		
		// set API token
		setAPIToken( PS.lv );
		
		// set global live id
		liveID = PS.lv;
	}
	
	// �g�̎��Ԃ������I�Ƀ��Z�b�g
	settings["LimitTime"] = 30 * 60;
}

// get & set API token by w2k
function setAPIToken (lv) {
	NicoLive.getXMLviaNet("http://live.nicovideo.jp/api/getpublishstatus?v=lv" + lv, function (xmldom) {
		if( ! xmldom || ! xmldom.getElementsByTagName("token") )
			return;
		try {
			apiToken = xmldom.getElementsByTagName("token")[0].text;
		} catch(e) { }
	});
}

var reqIDs = {};    // { liveid => { userid => n, .. }, .. } on memory only

// ���N�G�X�g�̃`�F�b�N
function receiveComment_Request(Chat){
	// �����i��j�̒ʏ픭���Ȃ�A��ɏE��Ȃ�
	if( Chat.premium == 3 )
		return;
	var text = Zen2Han(Chat.text);
	var sms  = text.match(/(sm|nm)\d+/g);

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
							NicoLive.postComment("<font size=\"-8\" color=\"#acacec\">��"+dummyAdminName+"����</font><br /> "+Chat.text.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\//g,"�^").replace(/\n/g,"<br>").replace(/\r/g,""), Chat.mail!=undefined?Chat.mail.replace("184",""):Chat.mail,"big");
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

	if(sms && !(/^\/(play|playsound|swapandplay) smile:/.test(text))){
		if(!acceptRequest){
			// ���N�Y��
			NicoLive.postComment(">>"+Chat.no+"����A���̓��N�󂯕t���ĂȂ��̂ŁE�E�E����", "big");
		}
		else if(sms[1]){
			// �P�R���ɕ����̓���ԍ�������
			NicoLive.postComment(">>"+Chat.no+"����A1�R��1���N�ł��肢���܂��B", "big");
		}
		else if(NGIDs[sms[0]]) {
			// NG ����
			NicoLive.postComment(">>"+Chat.no+"����A���̓���͎��NG���惊�X�g��<br />�o�^�ς݂Ȃ̂ŗ����Ȃ���ł��A���߂�Ȃ���", "big");
		}
		else if(settings["AddPlayedVideoId2NGIDs"]&&PlayedVideoIds[sms[0]]) {
			// �ŋߗ��ꂽ����
			NicoLive.postComment(">>"+Chat.no+"����A���̓���͗������΂���Ȃ̂ŁE�E�E���݂܂���B", "");
		}
		else if( settings["multiRequestLimit"] > 0 && ! checkReqIDs( liveID, Chat.user_id ) ){
			// �P�l�ɂ�镡���񃊃N�̃`�F�b�N
			NicoLive.postComment(">>"+Chat.no+"����A����l" + settings["multiRequestLimit"] +  "���N�܂łƂ����Ă��������܂� m(_ _)m", "");
		}
		else if(settings["CheckNew"]){
			// �V�����ǂ����m�F���A�V���������ꍇ�͉^�c�R���ŒʒB
			NicoLive.getXML("http://ext.nicovideo.jp/api/getthumbinfo/" + sms[0], 'video', function(xmldom){
				if(!xmldom.getElementsByTagName("first_retrieve")[0]) {
					NicoLive.postComment(">>"+Chat.no+"����@<br />���̓���͏�񂪎擾�ł��Ȃ������̂ŗ����܂���E�E�B", "big");
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
						
						// �������N�G�X�g�̃`�F�b�N�̂��߂� user id ��o�^����
						addReqIDs( liveID, Chat.user_id );
					}
				}
			});
		}
		else{
			RequestManager.addRequestQueue(new RequestQueue(sms[0], "C", Chat.no, 'listener'));
			
			// �������N�G�X�g�̃`�F�b�N�̂��߂� user id ��o�^����
			addReqIDs( liveID, Chat.user_id );
		}
	}
}

function addReqIDs (live_id, user_id) {
	if( reqIDs[ live_id ] == undefined )
		reqIDs[ live_id ] = {};
	
	if( reqIDs[ live_id ][ user_id ] == undefined ){
		reqIDs[ live_id ][ user_id ] = 1;
	}
	else{
		reqIDs[ live_id ][ user_id ]++;
	}
}

function checkReqIDs (live_id, user_id) {
	if( reqIDs[ live_id ] == undefined )
		return 1;
	
	if( reqIDs[ live_id ][ user_id ] == undefined )
		return 1;
	
	return reqIDs[ live_id ][ user_id ] < settings["multiRequestLimit"]
		? 1
		: 0;
}

// �ʏ탂�[�h�̍Đ�
var lastPlayVideoTime = 0;
RequestManager.Events["Play"] = function(id){
	// �������[�h
	if(!settings["UseIE"]){
		// �Đ������擾
		PlayLog += RequestManager.getPlayLog(id);
		PlayLog += "\n";

		if(settings["SaveLogTiming"]=="AtPlay") {
			writelog("play",PlayLog);
		}

		// �����{�^���𖳌���
		document.getElementById("PLY"+id).disabled = true;
	}

	if(settings["AddPlayedVideoId2NGIDs"]) PlayedVideoIds[id] = true;

	if(!SocketManager.connected) return;

	// �Q�x�����`�F�b�N
	if( thisTime() - lastPlayVideoTime < 10 * 1000 ){
		Status.postStatus("�A���Đ������m���܂����I�@�P�x�ڈȍ~�̍Đ����L�����Z�����܂����B", 5000);
		return;
	}
	
	// play �R�}���h�𔭍s
	postPlayCommand( id );
	
	// �������L�^
	lastPlayVideoTime = thisTime();
	
	// �ēx�R�}���h���s�̂��߂� id ���T���Ă���
	lastPlayedID = id;
	
	PlayLog += RequestManager.getPlayLog(id)+"\n";
	// �����񂪎擾�ł��Ă��Ȃ�������I��
	if(!RequestManager.Requests[id]) return;
	// clear
	NicoLive.postComment("/clear", "");
	// InfoComment�̓��e
	NicoLive.postComment(RequestManager.getInfoComment(id), "big");
	// InfoComment2���ݒ肳��Ă����玞�ԍ����e
	if(settings["InfoComment2"]!=""){
		setTimeout(function(){
			NicoLive.postComment(RequestManager.getInfoComment2(id), "big");
		}, settings["InfoCommentTimer"]);
	}
	// PermComment
	if( settings["PermComment"] != undefined ){
		var cmd = ["hidden"];
		if( settings["PermCommentCmd"] != "" ){
			cmd.push( settings["PermCommentCmd"] );
		}
		setTimeout(function(){
			NicoLive.postComment("/perm " + RequestManager.getPermComment(id), cmd.join(" "));
		}, settings["InfoCommentTimer"] * 2 );
	}

	if(settings["SaveLogTiming"]=="AtPlay") {
		writelog("play",PlayLog);
	}

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
		showPlayState(startTime, PlayTime, id);
	}, 500);
	// 2�x������h�����߂̏���
	document.getElementById("btnPF").disabled = true;
	// 5�b��ɕ���
	setTimeout(function(){
		document.getElementById("btnPF").disabled = false;
	}, 5000);
}

// play �R�}���h�𔭍s
function postPlayCommand (id) {
	if( settings["PlayMode"] == 0 ){
//		var cmd = (document.getElementById("playSound").checked?"/playsound ":"/play ")+id+(document.getElementById("playSub").checked?" sub":"");
		var cmd = $("#playSound").attr('checked') ? "/playsound " : "/play ";
		cmd += id;
		cmd += $('#playSub').attr('checked') ? " sub" : "";
		NicoLive.postComment( cmd );
		
		// �X�g�b�N���X�g�����ۑ�
		if( settings["autoSaveStockFile"] )
			autoSaveStockList();
	}
	else if( settings["PlayMode"] == 1 ){
		NicoLive.postComment("/swapandplay " + id);
		setTimeout(function(){
			NicoLive.postComment("/stop sub", "big");
		}, 5000);
	}
}

// ���O�̍Đ��R�}���h���Ĕ��s����
function postLastIDPlayCommand () {
	if( lastPlayedID == "" ){
		// �܂��P���Đ����Ă��Ȃ��ꍇ
		Status.postStatus('�܂��P���Đ����Ă��܂���B', 5000);
	}
	else{
		// �Ĕ��s
		postPlayCommand( lastPlayedID );
		Status.postStatus('���� ' + lastPlayedID + ' �̍Đ��R�}���h�𔭍s���܂����B', 10000);
	}
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

function calcTimeLeft () {
	return settings["LimitTime"]
		- (0-(SocketManager.playerStatus.baseTime-9*60*60)
		+ (new Date().getTime()/1000 + new Date().getTimezoneOffset()*60));
}

//�c�莞�Ԃ��v�Z
function getTimeLeft(){
	if(!SocketManager.connected) return;
	var tagF = "", tagT = "";
	//settings["LimitTime"][�b]-(-�J�n����[�b]+���ݎ���[�b])
	//�J�n���Ԃ͓��{���ԌŒ肾���A���ݎ��Ԃ͓��{���ԂƂ͌���Ȃ��̂ł��ꂼ��UTC�W�����ɕϊ�
	//�������A�T�}�[�^�C������������Ă�ꍇ�ɂ͂���ɕ␳���K�v
	var timeLeft = calcTimeLeft();

	if(timeLeft < 60 * 5){
		tagF="<font color=red>";
		tagT="</font>";
	}
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
		$('#timeleft').html("�����I��");
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
var last_t = 0;
function showPlayState(startTime, PlayTime, id){
	var tagF = "", tagT = "";
	var timeLeft = (new Date().getTime() - startTime) / 1000;
	var Interval = Number(document.getElementById("autoPlayInterval").value);
	var autoPlay = document.getElementById("autoPlay").checked;
	var min = (autoPlay && Interval < PlayTime) ? Interval : PlayTime;
	if(timeLeft>=(min-20)){
		tagF="<font color=red>";
		tagT="</font>";
	}
	if(id.match("sm")){
		min += settings["AutoPlayMargin"];
	}
	else if(id.match("nm")){
		min += settings["AutoPlayMargin_nm"];
	}

	// �Đ���
	if(min-timeLeft>0){
		var residue;
		if( settings["TimeLeftCountdown"] == 1 ){
			// �J�E���g�_�E��
			residue = PlayTime - timeLeft;
			if( residue < 0 ){
				residue = 0;
			}
			
			// �Đ��}�[�W�����Z�b�g
			var t = parseInt( calcTimeLeft() - residue );
			var str = "�� " + convertTimeString( t );
			if( last_t == 0 || Math.abs( last_t - t ) > 5 ){    // trying to suppress annoying flip-flop flickers :(
				$('#timemargin').html( str );
				last_t = t;
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
			$("#playState").html("�Đ��I��");
			$("#timemargin").html("�Đ��I��");
		}
	}
}

function convertTimeString(num){
	var n = num >= 0
		? num
		: - num;
	
	var min = parseInt( n / 60 );
	if( min < 10 )
		min = '0' + min;
	var sec = parseInt( n % 60 );
	if( sec < 10 )
		sec = '0' + sec;
	
	var str = min + ':' + sec;
	return num >= 0
		? str
		: '-' + str;
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
			if(!settings["AutoSaveStock"]||fs.FileExists(stockfile)){
//				fs.DeleteFile(stockfile,true);
				try {
					// �t�@�C������ɂ���i�Ȃɂ��������܂��ɃN���[�Y�j
					var cf = fs.CreateTextFile(stockfile);
					cf.Close(); 
				} catch(e) {
					alert("�X�g�b�N���X�g�t�@�C���̑���Ɏ��s���܂��� orz");
				}
			}
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

// �X�g�b�N���X�g�̎����ۑ�
var autoSaveStockListRequest = 0;
var autoSaveStockListLastRun = thisTime();

// �ۑ����N�G�X�g���������玞�����L�^����
function autoSaveStockList(){
	autoSaveStockListRequest = thisTime();
}

// �^�C�}�[���d�|����
function autoSaveStockListTimer () {
	// �����Ō�ɕۑ�����������肠���炵�����N�G�X�g����������N������
	if( autoSaveStockListRequest > autoSaveStockListLastRun ){
		autoSaveStockListMain();
		autoSaveStockListLastRun = thisTime();
	}
	
	// call myself
	setTimeout( "autoSaveStockListTimer()", 10 * 1000 );
}

// bootstrap
if( settings["autoSaveStockFile"] )
	autoSaveStockListTimer();

// main
function autoSaveStockListMain () {
	// ������v���O�����Ƀ~�X���������ꍇ�ɏ����Ă��܂��̂�h��
	if(RequestManager.RequestQueues.length>0)
		saveStockList();
//	Status.postStatus("�X�g�b�N���X�g��ۑ����܂����B", 3000);
}

function thisTime () {
	var d = new Date;
	return parseInt( d.getTime(), 10 );    // epoch �� 10^3 �{�̒l�ł��邱�Ƃɒ���
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

// lv1234567 �̓��Ƀp�[�g�ԍ���t����
// api �Ŏ��Ȃ��̂���
var LiveTitle = [];
function getLiveTitle (lv) {
	// return cache
	if( LiveTitle[lv] != null )
		return LiveTitle[lv];
	
	var result = "lv" + lv;
	var url = "http://live.nicovideo.jp/gate/lv" + lv;

	var xmlhttp = createXMLHttpRequest();
	xmlhttp.open("GET", url, false);
	xmlhttp.send();
	xmlhttp.responseText.match(/<title[^<>]*?>(.+?)</);
	if( RegExp.$1 != "" ){
		var title = RegExp.$1;
		
		// �p�[�g�����𓾂�
		if( title.match(/(Part|Vol)[^0-9]*?([0-9]+)/i) ){
			var part = RegExp.$1;
			var n = RegExp.$2;
			if( part.match(/Part/i) ){
				result = "Part." + n + " " + result;
			}
			else if( part.match(/Vol/i) ){
				result = "vol." + n + " " + result;
			}
		}
	}
	LiveTitle[lv] = result;
	return result;
}

// �z�b�g�L�[���Z�b�g
$(document).bind('keydown', 'c', createHotkeyFunc( function(){

	// �ڑ� connect
	if( SocketManager.connected ){
//		alert("���łɐڑ����Ă��܂��B");
	}
	else{
		top.connectDialog();
	}
}));
$(document).bind('keydown', 'd', createHotkeyFunc( function(){
	// �ؒf  disconnect
	if( SocketManager.connected ){
		// connected
		if( window.confirm("�T�[�o����ؒf���܂��B��낵���ł����H") ){
			top.disconnect();
		}
	}
	else{
//		alert("�܂��ڑ�����Ă��܂���B");
	}
}));
$(document).bind('keydown', 'i', createHotkeyFunc( function(){
	// �e�L�X�g�̎�荞�� import
	top.importText();
}));
$(document).bind('keydown', 'e', createHotkeyFunc( function(){
	// �Đ������̏o�� export
	top.exportIDs('PlayLog');
}));
$(document).bind('keydown', 'f', createHotkeyFunc( function(){
	// �}�C���X�g���猟�� find
	top.findMylist();
}));

function createHotkeyFunc (func) {
	return function () {
		if( isOnEditableArea() )
			return;
		func();
	};
}

function isOnEditableArea () {
	return eval( $(document.activeElement).get(0).tagName.match(/^(input|textarea)$/i) ) ? true : false;
}

function OpenOfficialSite () {
	var WshShell = new ActiveXObject("WScript.Shell");
	var url = "http://mikunopop.info/manual/nicoreq.html";
	WshShell.run("rundll32.exe url.dll,FileProtocolHandler " + url, 4, false);
}

