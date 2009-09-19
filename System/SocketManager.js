// FLASH側から呼び出されるメソッド
function receiveComment(str){
	SocketManager.receiveComment(str);
}

function SocketManager(){
	this.playerStatus;
	this.connected = false;
	this.receiveCommentFunctions = new Array();
	this.initialize.apply(this, arguments);
}

SocketManager.prototype = {
	initialize: function(){
	},
	setFlash: function(flash){
		this.flash = flash;
	},
	attachEvent: function(name, func){
		if(name=="receiveComment") this.receiveCommentFunctions.push(func);
	},
	// detachは動くかどうか微妙…まぁ当分使う予定ないし！
	detachEvent: function(name, func){
		if(name!="receiveComment") return;
		for(i=this.receiveCommentFunctions.length; i>=0; i--){
			if(this.receiveCommentFunctions[i]==func){
				this.receiveCommentFunctions.splice(i,1);
			}
		}
	},
	receiveComment: function(str){
		if(str.match(/<thread/)) return;
		for(var i=0,l=this.receiveCommentFunctions.length; i<l; i++){
			try{
				// Chatオブジェクトを引数としてイベント発火
				this.receiveCommentFunctions[i](new Chat(str));
			}catch(e){
				if( settings["Debug"] )
					alert("SocketManager.receiveComment/"+i+":"+e.number+"\n"+e.description);
			}
		}
	},
	connect: function(lv, server, port, thread, baseTime){
		if(this.connected) return;
		if(arguments.length==1){
			this.playerStatus = lv;
		}else{
			this.playerStatus = new PlayerStatus(lv, server, port, thread, baseTime);
			
		}
		this.flash.setServer(this.playerStatus.server, this.playerStatus.port, this.playerStatus.thread);
		this.connected = true;
	},
	disconnect: function(){
		if(!this.connected) return;
		this.flash.close();
		this.connected = false;
	}
}

var SocketManager = new SocketManager();
