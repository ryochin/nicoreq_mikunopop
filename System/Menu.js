// インポート番号
var ImportNumber = 0;

// メッセージサーバーに接続するダイアログ
function connectDialog(){
	if(SocketManager.connected) return;
	var _PS = window.showModalDialog("./System/Connect.hta","","status:no;help:no;resizable:yes");
	connect(_PS);
}

// メッセージサーバーから切断
function disconnect(){
	SocketManager.disconnect();
	if(timeLeftTimer!=0){
		clearInterval(timeLeftTimer);
		timeLeftTimer = 0;
	}
	if(document.getElementById("loginCheck").checked) checkloginCheck();
}

// テキスト内の動画IDを取り込み
function importText(){
	var text = window.showModalDialog("./System/Import.hta","","status:no;help:no;resizable:yes");
	if(!text || text=="") return;
	checkJASCode(text);
	var sms  = text.match(/(sm|nm)\d+/ig);
	if(!sms) return;
	for(var i=0,l=sms.length; i<l; i++){
		ImportNumber++;
		RequestManager.addRequestQueue(new RequestQueue(sms[i], "I", ImportNumber));
	}
}

// マイリストの動画IDを取り込み
function importMylist(){
	var url = prompt("ニコニコ動画の公開マイリストを指定してください","http://www.nicovideo.jp/mylist/");
	if(!url || url=="") return;
	url = "http://www.nicovideo.jp/mylist/" + url.match(/\d+/) + "?rss=2.0";
	NicoLive.getXML(url, function(xmldom){
		if(!xmldom) return;
		// これはひどい置換コード！
		var title = xmldom.getElementsByTagName("title")[0].text.replace("マイリスト ","").replace("‐ニコニコ動画(ββ)","");
		var items = xmldom.getElementsByTagName("item");
		var MylistImportNumber = 0;
		for(var i=0,l=items.length; i<l; i++){
			var link = items[i].getElementsByTagName("link")[0].text;
			var sms = link.match(/(sm|nm)\d+/ig);
			if(!sms){
				continue;
			}else{
				MylistImportNumber++;
				RequestManager.addRequestQueue(new RequestQueue(sms[0], title, MylistImportNumber));
			}
		}
	});
}

// 履歴を出力
function exportIDs(logName){
	var text = window.showModalDialog("./System/Export.hta",window[logName],"status:no;help:no;resizable:yes;");
	if(text) window[logName] = text;
}