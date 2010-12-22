// ActiveXObject�̗p��
try{
	var WshShell = new ActiveXObject("WScript.Shell");
	var Locator = new ActiveXObject("WbemScripting.SWbemLocator");
	var Service = Locator.ConnectServer();
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var __SofTalk__softalk = fso.FileExists("softalk\\SofTalk.exe");
}catch(e){
	var __SofTalk__softalk = false;
}

// SofTalk���샂�[�h�������Ȃ�I�v�V�������B��
window.attachEvent("onload", function(){
	if(!__SofTalk__softalk || settings["SofTalkMode"] == -1)
		document.getElementById("divSofTalk").style.display = "none";
});

// SocketManager�ɃC�x���g�o�^
SocketManager.attachEvent("receiveComment", function(Chat){
	// ���N�G�X�g�R�����g�͓ǂ܂Ȃ�
	var sms  = Chat.text.match(/(sm|nm|so)\d+/g);
	if(softalk && document.getElementById("softalk").checked && !sms){
		SofTalk.Talk(Chat.text);
	}
});

// SofTalk�N���X
// ���p���[�h�ł�RequestManager�Ɠ����^�X�N�������s���Ă���
function SofTalk(){
	this.CommentTasks  = new Array();
	this.CommentTimer  = 0;
	this.CommentFlag   = true;
	this.initialize.apply(this, arguments);
}

SofTalk.prototype = {
	initialize: function(){
	},
	Talk: function(text){
		// �R�}���h���ۂ��R�����g�̓X���[
		if(/^\//.test(text)) return;
		// �ǂޕK�v���Ȃ��R�����g����������
		text = text.replace(/\/|&gt;|&lt;|br|ksk|������|�m�V|ɼ|[wW���v�m�\s�@]/ig, "");
		if(text.length > settings["SofTalkCommentLimit"]){
			text = text.substr(0, settings["SofTalkCommentLimit"]);
			text += "�ȉ��ȗ�";
		}
		if(!text) return;
		if(settings["SofTalkMode"]==0 || settings["SofTalkMode"]==2) this.TalkFunctions0(text);
		if(settings["SofTalkMode"]==1) this.TalkFunctions1(text);
	},
	// �G���^�����[�h
	TalkFunctions0: function(text){
		var S = GetRandom(100, 140);
		var T = (settings["SofTalkMode"]==0) ? GetRandom(0, 7) : 1;
		try{
			var ProcessSet = Service.ExecQuery("Select * From Win32_Process Where Caption='SofTalk.exe'");
			var e = new Enumerator(ProcessSet);
			for(var count=0; !e.atEnd(); e.moveNext()){
				count++;
				// settings["SofTalkProcessLimit"]�v���Z�X�ȏ�ɂȂ�Ƃ��͍Đ�����SofTalk�������I������
				if(count >= settings["SofTalkProcessLimit"]) e.item().Terminate();
			}
			WshShell.run("softalk\\SofTalk.exe /V:60 /S:"+S+" /T:"+T+" /W:"+text, 7, false);
		}catch(e){
		}
	},
	// ���p���[�h
	TalkFunctions1: function(text){
		this.CommentTasks.push(text);
		// �X�g�b�N���E�𒴂��Ă��狭���I��
		if(this.CommentTasks.length > settings["SofTalkStockLimit"]){
			try{
				var ProcessSet = Service.ExecQuery("Select * From Win32_Process Where Caption='SofTalk.exe'");
				var e = new Enumerator(ProcessSet);
				for(; !e.atEnd(); e.moveNext()){
					e.item().Terminate();
				}
			}catch(e){
			}
			this.CommentFlag = true;
		}
		// �^�X�N�N��
		if(!this.CommentTimer){
			this.CommentFlag = true;
			this.CommentTimer = setInterval(this._doCommentTask, 500);
		}
	},
	_doCommentTask: function(){
		if(SofTalk.CommentTasks.length==0){
			clearInterval(SofTalk.CommentTimer);
			SofTalk.CommentTimer = 0;
			SofTalk.CommentFlag = true;
		// CommentFlag�ŏ��Ԃ�����܂őҋ@
		}else if(SofTalk.CommentFlag){
			SofTalk.CommentFlag = false;
			// �L���[�����o���ē�������擾����
			var text = SofTalk.CommentTasks.shift();
			WshShell.run("softalk\\SofTalk.exe /V:60 /S:90 /T:1 /W:"+text, 7, true);
			SofTalk.CommentFlag = true;
		}
	}
}

var SofTalk = new SofTalk();