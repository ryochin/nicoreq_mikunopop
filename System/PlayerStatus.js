function PlayerStatus(){
	this.lv       = 0;
	this.server     = "";
	this.port     = "";
	this.thread   = "";
	this.baseTime = "";
	this.initialize.apply(this, arguments);
}
PlayerStatus.prototype = {
	initialize: function(){
		// xmlが渡された場合
		if(arguments.length==2){
			if(arguments[1].getElementsByTagName("error").length > 0) return false;
			this.lv       = arguments[0];
			this.server   = arguments[1].getElementsByTagName("addr")[0].text;
			this.port     = arguments[1].getElementsByTagName("port")[0].text;
			this.thread   = arguments[1].getElementsByTagName("thread")[0].text;
			this.baseTime = arguments[1].getElementsByTagName("base_time")[0].text;
		// 引数で渡された場合
		}else if(arguments.length==5){
			this.lv       = arguments[0];
			this.server   = arguments[1];
			this.port     = arguments[2];
			this.thread   = arguments[3];
			this.baseTime = arguments[4];
		}
	}
}