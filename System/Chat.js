function Chat(){
	this.anonymity;
	this.date;
	this.mail;
	this.no;
	this.thread;
	this.user_id;
	this.vpos;
	this.text;
	this.premium;
	this.initialize.apply(this, arguments);
}

Chat.prototype = {
	initialize: function(str){
		this.text = str.replace(/<\/?[^>]+>/ig, "");
		var temp = str.split(" ");
		for(var i=0,l=temp.length; i<l; i++){
			var data = temp[i].split("=");
			if(data.length==2){
				this[data[0]] = data[1].split("\"")[1];
			}
		}
	}
}