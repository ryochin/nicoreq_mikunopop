var __Comment__CommentLog = new Array();

SocketManager.attachEvent("receiveComment", __Comment__receiveComment);

function __Comment__receiveComment(Chat){
	__Comment__CommentLog.push(Chat);
	var HTML = settings["CommentLogHTML"]
				.replace(/{#Anonymity}/, Chat.anonymity)
//del				.replace(/{#Date}/g,     Chat.date)
//add start
				.replace(/{#Date}/g,     settings["CommentLogDate"]
											.replace("yyyy",(new Date(new Date().setTime(Chat.date*1000))).getFullYear())
											.replace("yy",  (new Date(new Date().setTime(Chat.date*1000))).getFullYear()<2010
												?("0"+((new Date(new Date().setTime(Chat.date*1000))).getFullYear()-2000))
												:(new Date(new Date().setTime(Chat.date*1000))).getFullYear()-2000
											)
											.replace("mm",  (new Date(new Date().setTime(Chat.date*1000))).getMonth()<9
												?("0"+((new Date(new Date().setTime(Chat.date*1000))).getMonth()+1))
												:(new Date(new Date().setTime(Chat.date*1000))).getMonth()+1
											)
											.replace("dd",  (new Date(new Date().setTime(Chat.date*1000))).getDate()<10
												?("0"+(new Date(new Date().setTime(Chat.date*1000))).getDate())
												:(new Date(new Date().setTime(Chat.date*1000))).getDate()
											)
											.replace("dy",  ["日", "月", "火", "水", "木", "金", "土"][(new Date(new Date().setTime(Chat.date*1000))).getDay()])
											.replace("hh",  (new Date(new Date().setTime(Chat.date*1000))).getHours()<10
												?("0"+(new Date(new Date().setTime(Chat.date*1000))).getHours())
												:(new Date(new Date().setTime(Chat.date*1000))).getHours()
											)
											.replace("mm",  (new Date(new Date().setTime(Chat.date*1000))).getMinutes()<10
												?("0"+(new Date(new Date().setTime(Chat.date*1000))).getMinutes())
												:(new Date(new Date().setTime(Chat.date*1000))).getMinutes()
											)
											.replace("ss",  (new Date(new Date().setTime(Chat.date*1000))).getSeconds()<10
												?("0"+(new Date(new Date().setTime(Chat.date*1000))).getSeconds())
												:(new Date(new Date().setTime(Chat.date*1000))).getSeconds())
											)
				.replace(/{#Mail}/g,     function(){if(Chat.mail!=undefined)return Chat.mail})
//add end
//del				.replace(/{#Mail}/g,     Chat.mail)
				.replace(/{#No}/g,       Chat.no)
				.replace(/{#Thread}/g,   Chat.thread)
//del				.replace(/{#ID}/g,       "<span onclick=\"__Comment__showPopup(event.clientX, event.clientY, '"+Chat.user_id+"')\">" + Chat.user_id + "</span>")
//add start
				.replace(/{#ID}/g,       "<span onclick=\"__Comment__showPopup(event.clientX, event.clientY, '"+Chat.user_id+"')\" oncontextmenu=\"setSelectedUseridToDummyAdmin('" + Chat.user_id + "')\">" + Chat.user_id + "</span>")
//add end
				.replace(/{#Vpos}/g,     Chat.vpos)
//del 				.replace(/{#Text}/g,     Chat.text)
//add start
				.replace(/{#Text}/g,     Chat.text.replace(/\n/g,"<br>").replace(/&lt;/g,"<").replace(/&gt;/g,">"))
//add end
	;
	document.getElementById("CommentHTML").insertAdjacentHTML("AfterBegin", HTML);
}


// 情報ポップアップ
var __Comment__Popup = window.createPopup();
function __Comment__showPopup(x, y, UserID){ 
	var body  = __Comment__Popup.document.body;
	body.style.overflow = "auto";
	body.style.borderStyle = "outset";
    body.style.borderWidth = "2px";
	body.style.backgroundColor = "ThreeDFace";
	body.style.color = "WindowText";
	body.innerHTML = "";
	for(var i=0,l=__Comment__CommentLog.length; i<l; i++){
		var Chat = __Comment__CommentLog[i];
		if(Chat.user_id==UserID){
			var HTML = settings["CommentLogHTML"]
				.replace(/{#Anonymity}/, Chat.anonymity)
//del				.replace(/{#Date}/g,     Chat.date)
//add start
				.replace(/{#Date}/g,     settings["CommentLogDate"]
											.replace("yyyy",(new Date(new Date().setTime(Chat.date*1000))).getFullYear())
											.replace("yy",  (new Date(new Date().setTime(Chat.date*1000))).getFullYear()<2010
												?("0"+((new Date(new Date().setTime(Chat.date*1000))).getFullYear()-2000))
												:(new Date(new Date().setTime(Chat.date*1000))).getFullYear()-2000)
											.replace("mm",  (new Date(new Date().setTime(Chat.date*1000))).getMonth()<9
												?("0"+((new Date(new Date().setTime(Chat.date*1000))).getMonth()+1))
												:(new Date(new Date().setTime(Chat.date*1000))).getMonth()+1)
											.replace("dd",  (new Date(new Date().setTime(Chat.date*1000))).getDate()<10
												?("0"+(new Date(new Date().setTime(Chat.date*1000))).getDate())
												:(new Date(new Date().setTime(Chat.date*1000))).getDate())
											.replace("dy",  ["日", "月", "火", "水", "木", "金", "土"][(new Date(new Date().setTime(Chat.date*1000))).getDay()])
											.replace("hh",  (new Date(new Date().setTime(Chat.date*1000))).getHours()<10
												?("0"+(new Date(new Date().setTime(Chat.date*1000))).getHours())
												:(new Date(new Date().setTime(Chat.date*1000))).getHours())
											.replace("mm",  (new Date(new Date().setTime(Chat.date*1000))).getMinutes()<10
												?("0"+(new Date(new Date().setTime(Chat.date*1000))).getMinutes())
												:(new Date(new Date().setTime(Chat.date*1000))).getMinutes())
											.replace("ss",  (new Date(new Date().setTime(Chat.date*1000))).getSeconds()<10
												?("0"+(new Date(new Date().setTime(Chat.date*1000))).getSeconds())
												:(new Date(new Date().setTime(Chat.date*1000))).getSeconds()))
				.replace(/{#Mail}/g,     function(){if(Chat.mail!=undefined)return Chat.mail})
//add end
//del				.replace(/{#Mail}/g,     Chat.mail)
				.replace(/{#No}/g,       Chat.no)
				.replace(/{#Thread}/g,   Chat.thread)
				.replace(/{#ID}/g,       Chat.user_id)
				.replace(/{#Vpos}/g,     Chat.vpos)
//del 				.replace(/{#Text}/g,     Chat.text)
//add start
				.replace(/{#Text}/g,     Chat.text.replace(/\n/g,"<br>").replace(/&lt;/g,"<").replace(/&gt;/g,">"))
			;
//add end
			body.insertAdjacentHTML("AfterBegin", HTML);
		}
	}
	__Comment__Popup.show(x, y, 314, 178, document.body);
}
