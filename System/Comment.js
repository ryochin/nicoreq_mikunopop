var __Comment__CommentLog = new Array();

SocketManager.attachEvent("receiveComment", __Comment__receiveComment);

function __Comment__receiveComment(Chat){
	__Comment__CommentLog.push(Chat);
	
	// コマンド類なら無視する
	if( Chat.text.match(/^\/(play|perm|clear) */) )
		return;
	
	// remove tags
	var text = stripTags( unescapeHTML( Chat.text ) );
	
	// autolink to videos
	var replaceText = "<span title=\"クリックで動画ページを開く\" class=\"video\" onclick=\"OpenVideo('$1');\">$1</span>";
	if( settings["showCommentTabVideoThumbnail"] == true ){
		replaceText += "<br /><img src=\"http://niconail.info/$1\" /><br />";
	}
	
	// replace
	text = text.replace(/((sm|nm|so)[0-9]{7,})/g, replaceText);
	
	var HTML = settings["CommentLogHTML"]
				.replace(/{#Anonymity}/, Chat.anonymity)
				.replace(/{#Date}/g,     getCommentLogDate( Chat, settings["CommentLogDate"] ) )
				.replace(/{#Mail}/g,     function(){if(Chat.mail!=undefined)return Chat.mail})
				.replace(/{#No}/g,       Chat.no)
				.replace(/{#Thread}/g,   Chat.thread)
				.replace(/{#ID}/g,       "<span title=\"右クリックで副管理者欄にIDコピー\" oncontextmenu=\"setSelectedUseridToDummyAdmin('" + Chat.user_id + "')\">" + Chat.user_id + "</span>")
				.replace(/{#Vpos}/g,     Chat.vpos)
				.replace(/{#Text}/g,     text);
	
	// set
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
			// remove tags
			var text = stripTags( unescapeHTML( Chat.text ) );
			
			var HTML = settings["CommentLogHTML"]
				.replace(/{#Anonymity}/, Chat.anonymity)
				.replace(/{#Date}/g,     getCommentLogDate( Chat, settings["CommentLogDate"] ) )
				.replace(/{#Mail}/g,     function(){if(Chat.mail!=undefined)return Chat.mail})
				.replace(/{#No}/g,       Chat.no)
				.replace(/{#Thread}/g,   Chat.thread)
				.replace(/{#ID}/g,       Chat.user_id)
				.replace(/{#Vpos}/g,     Chat.vpos)
				.replace(/{#Text}/g,     text);
			
			// set
			body.insertAdjacentHTML("AfterBegin", HTML);
		}
	}
	__Comment__Popup.show(x, y, 314, 178, document.body);
}

//コメントNoからID検索
function findNotoID(findNo){
	for(var i=__Comment__CommentLog.length-1;i>=0;i--){
		if(__Comment__CommentLog[i].no==findNo){
			var userID=__Comment__CommentLog[i].user_id;
			if(userID!=undefined) return userID;
		}
	}

	return "";
}

function getCommentLogDate (Chat, str) {
	return str
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
		.replace("nn",  (new Date(new Date().setTime(Chat.date*1000))).getMinutes()<10
			?("0"+(new Date(new Date().setTime(Chat.date*1000))).getMinutes())
			:(new Date(new Date().setTime(Chat.date*1000))).getMinutes())
		.replace("ss",  (new Date(new Date().setTime(Chat.date*1000))).getSeconds()<10
			?("0"+(new Date(new Date().setTime(Chat.date*1000))).getSeconds())
			:(new Date(new Date().setTime(Chat.date*1000))).getSeconds());
}
