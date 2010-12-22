// ActiveXObjectの用意
try{
	var WshShell = new ActiveXObject("WScript.Shell");
	var Locator = new ActiveXObject("WbemScripting.SWbemLocator");
	var Service = Locator.ConnectServer();
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var __SofTalk__softalk = fso.FileExists("softalk\\SofTalk.exe");
}catch(e){
	var __SofTalk__softalk = false;
}

// SofTalk動作モードが無効ならオプションを隠す
window.attachEvent("onload", function(){
	if(!__SofTalk__softalk || settings["SofTalkMode"] == -1)
		document.getElementById("divSofTalk").style.display = "none";
});

// SocketManagerにイベント登録
SocketManager.attachEvent("receiveComment", function(Chat){
	// リクエストコメントは読まない
	var sms  = Chat.text.match(/(sm|nm|so)\d+/g);
	if(softalk && document.getElementById("softalk").checked && !sms){
		SofTalk.Talk(Chat.text);
	}
});

// SofTalkクラス
// 実用モードではRequestManagerと同じタスク処理を行っている
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
		// コマンドっぽいコメントはスルー
		if(/^\//.test(text)) return;
		// 読む必要がないコメントを除去する
		text = text.replace(/\/|&gt;|&lt;|br|ksk|ｋｓｋ|ノシ|ﾉｼ|[wWｗＷノﾉ\s　]/ig, "");
		if(text.length > settings["SofTalkCommentLimit"]){
			text = text.substr(0, settings["SofTalkCommentLimit"]);
			text += "以下省略";
		}
		if(!text) return;
		if(settings["SofTalkMode"]==0 || settings["SofTalkMode"]==2) this.TalkFunctions0(text);
		if(settings["SofTalkMode"]==1) this.TalkFunctions1(text);
	},
	// エンタメモード
	TalkFunctions0: function(text){
		var S = GetRandom(100, 140);
		var T = (settings["SofTalkMode"]==0) ? GetRandom(0, 7) : 1;
		try{
			var ProcessSet = Service.ExecQuery("Select * From Win32_Process Where Caption='SofTalk.exe'");
			var e = new Enumerator(ProcessSet);
			for(var count=0; !e.atEnd(); e.moveNext()){
				count++;
				// settings["SofTalkProcessLimit"]プロセス以上になるときは再生中のSofTalkを強制終了する
				if(count >= settings["SofTalkProcessLimit"]) e.item().Terminate();
			}
			WshShell.run("softalk\\SofTalk.exe /V:60 /S:"+S+" /T:"+T+" /W:"+text, 7, false);
		}catch(e){
		}
	},
	// 実用モード
	TalkFunctions1: function(text){
		this.CommentTasks.push(text);
		// ストック限界を超えてたら強制終了
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
		// タスク起動
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
		// CommentFlagで順番が来るまで待機
		}else if(SofTalk.CommentFlag){
			SofTalk.CommentFlag = false;
			// キューを取り出して動画情報を取得する
			var text = SofTalk.CommentTasks.shift();
			WshShell.run("softalk\\SofTalk.exe /V:60 /S:90 /T:1 /W:"+text, 7, true);
			SofTalk.CommentFlag = true;
		}
	}
}

var SofTalk = new SofTalk();