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
	// ログファイルの削除
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
		document.title += "(制限モード)";
	}
	if(acceptRequest) openRequest(); else closeRequest();
	if(settings["PlayMode"]==1) document.getElementById("divPlaySub").style.display = "none";
	// SocketManagerにFLASHオブジェクトを登録
	// FLASHがExternalInterfaceを登録する関係上onload以降でないといけない
	SocketManager.setFlash(Socket);
	SocketManager.attachEvent("receiveComment", receiveComment_Request);
	if(settings["TopMost"]) TopMost();
//	loadJASCode();
//add start ログオフチェック
	if(settings["logoffCheck"]) document.getElementById("loginCheck").checked=true;
	checklogoffCheck();
	// NGIDList.txtからNG動画一覧を取得
	loadNGIDs();
	// ストックのロード
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
	// 終了時にログ保存
	if(settings["SaveLogTiming"]=="AtEnd") {
		writelog("play",PlayLog);
		writelog("watch",__VideoInformation__PlayLog);
	}
	// ウィンドウの位置・サイズをsettings.jsに反映
	if(settings["AutoSaveWindowParams"]) saveWindowSize();
	NicoCookieImporter("disconnect");
});
//add end

function connect(PS){
	if(!PS || PS.lv=="" || PS.addr=="" || PS.port=="" || PS.thread==""){
		//ログオフ時強制ログインのチェックを外す
		document.getElementById("loginCheck").checked = false;
	}else{
		SocketManager.connect(PS);
		PlayLog += getLiveTitle( PS.lv ) + "\n";
		__VideoInformation__PlayLog += getLiveTitle( PS.lv ) + "\n";
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

// リクエストのチェック
function receiveComment_Request(Chat){
//del	if(!acceptRequest) return;
	var text = Zen2Han(Chat.text);
//	checkJASCode(text);
	var sms  = text.match(/(sm|nm)\d+/g);
//add start
	//副管理者機能
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
							NicoLive.postComment("<font size=\"-8\">★"+dummyAdminName+"さん★</font><br />"+Chat.text.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\//g,"／").replace(/\n/g,"<br>").replace(/\r/g,""), Chat.mail!=undefined?Chat.mail.replace("184",""):Chat.mail,"big");
						}else{
							NicoLive.postComment(Chat.text.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\//g,"／").replace(/\n/g,"<br>").replace(/\r/g,""), Chat.mail!=undefined?Chat.mail.replace("184",""):Chat.mail);
						}
					}else{
						NicoLive.postComment(Chat.text.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\//g,"／").replace(/\n/g,"<br>").replace(/\r/g,""), Chat.mail!=undefined?Chat.mail.replace("184",""):Chat.mail);
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
			NicoLive.postComment(">>"+Chat.no+"さん、今はリク受け付けてないので・・・ｻｰｾﾝ", "big");
		}else if(sms[1]){
			NicoLive.postComment(">>"+Chat.no+"さん、1コメ1リクでお願いします。", "big");
		}else if(NGIDs[sms[0]]) {
			NicoLive.postComment(">>"+Chat.no+"さん、その動画は主のNG動画リストに<br />登録済みなので流せないんです、ごめんなさい", "big");
		}else if(settings["AddPlayedVideoId2NGIDs"]&&PlayedVideoIds[sms[0]]) {
			NicoLive.postComment(">>"+Chat.no+"さん、その動画は流したばかりなので・・・すみません。", "");
		}else if(settings["CheckNew"]){
			// 新着かどうか確認し、新着だった場合は運営コメで通達
			NicoLive.getXML("http://ext.nicovideo.jp/api/getthumbinfo/" + sms[0], 'video', function(xmldom){
				if(!xmldom.getElementsByTagName("first_retrieve")[0]) {
					NicoLive.postComment(">>"+Chat.no+"さん　<br />その動画は物理的理由で放送できません。", "big");
				}else{
					// 現在
					var today = Math.floor(new Date(new Date().getTime())/1000);
					
					// アップ時刻 e.g. 2009-09-03T23:45:56+09:00
					var first_retrieve = xmldom.getElementsByTagName("first_retrieve")[0].text
						.replace(/T/," ").replace(/\+.+$/,"").replace(/-/g,"/");
					var uploadedDay = Math.floor(new Date(new Date(first_retrieve)/1000));
					
					// １６８時間以内なら弾く
					var limit = ( 7 * 24 * 60 * 60 ) - ( today - uploadedDay );
					if( limit > 0 ){
						// 残り時間を表示する
						var msg = getTimeLeftMessage( limit );
						
						NicoLive.postComment("＞"+Chat.no+"さん、その曲はあと"+ msg + "経たないと<br>流せないのです m(_ _)m", "big");
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

// JASコード定義済み動画IDをロード
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

// JASコード付きリクエストをチェック
//function checkJASCode(text){
//	var smJAS = text.match(/(sm|nm)\d+.+?[0-9a-zA-Z]{3}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]/ig);
//	if(!smJAS) return;
//	for(var i=0,l=smJAS.length; i<l; i++){
//		var sm = smJAS[i].match(/(sm|nm)\d+/);
//		var jc = smJAS[i].match(/[0-9a-zA-Z]{3}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]/);
//		JASCodes[sm[0]] = jc;
//	}
//}

// 通常モードの再生
RequestManager.Events["Play"] = function(id){
	// 制限モード
	if(!settings["UseIE"]){
		// 再生履歴取得
		PlayLog += RequestManager.getPlayLog(id);
		PlayLog += "\n";
//add start
		if(settings["SaveLogTiming"]=="AtPlay") {
			writelog("play",PlayLog);
		}
//add end
		// 履歴ボタンを無効に
		document.getElementById("PLY"+id).disabled = true;
	}
//add start
	if(settings["AddPlayedVideoId2NGIDs"]) PlayedVideoIds[id] = true;
//add end
	if(!SocketManager.connected) return;
	// PlayModeによって処理を分岐
	if(settings["PlayMode"]==0){
		NicoLive.postComment((document.getElementById("playSound").checked?"/playsound ":"/play ")+id+(document.getElementById("playSub").checked?" sub":""));
	}else if(settings["PlayMode"]==1){
		NicoLive.postComment("/swapandplay "+id);
		setTimeout(function(){
			NicoLive.postComment("/stop sub", "big");
		}, 5000);
	}
	PlayLog += RequestManager.getPlayLog(id)+"\n";
	// 動画情報が取得できていなかったら終了
	if(!RequestManager.Requests[id]) return;
	// InfoCommentの投稿
	NicoLive.postComment(RequestManager.getInfoComment(id), "big");
	// InfoComment2が設定されていたら時間差投稿
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
	// キューの削除
	RequestManager.deleteRequestQueueById(id);
	// 再生情報タスクの準備
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
	// 2度押しを防ぐための処理
	document.getElementById("btnPF").disabled = true;
	// 5秒後に復活
	setTimeout(function(){
		document.getElementById("btnPF").disabled = false;
	}, 5000);
}

// リクエストリストの最初を再生
function playFirst(){
	var cd = document.getElementById("RequestHTML").firstChild;
	if(cd) RequestManager.Events["Play"](cd.id);
}

// ランダム再生
function playRandom(){
	var index = GetRandom(0, RequestManager.RequestQueues.length-1);
	var RQ = RequestManager.RequestQueues[index];
	if(RQ) RequestManager.Events["Play"](RQ.id);
}

// リクエストリストの最初を削除
function delFirst(){
	var cd = document.getElementById("RequestHTML").firstChild;
	if(cd) RequestManager.deleteRequestQueueById(cd.id);
}

// リクエストの募集切り替え
function changeRequest(){
	if(acceptRequest){
		closeRequest();
	}else{
		openRequest();
	}
}

// リクエストの募集開始
function openRequest(){
	acceptRequest = true;
	document.getElementById("btnCR").value="締切";
	if(SocketManager.connected && document.getElementById("extraComment").checked) NicoLive.postComment("募集開始！", "big");
}

// リクエストの募集停止
function closeRequest(){
	acceptRequest = false;
	document.getElementById("btnCR").value="募集";
	if(SocketManager.connected && document.getElementById("extraComment").checked) NicoLive.postComment("募集締切！", "big");
}

//残り時間を計算
function getTimeLeft(){
	if(!SocketManager.connected) return;
	var tagF = "", tagT = "";
//del	//30[分]-(-開始時間[秒]+現在時間[秒])
//del	var timeLeft = 1800 - (0-SocketManager.playerStatus.baseTime+new Date().getTime()/1000);
//add start
	//settings["LimitTime"][秒]-(-開始時間[秒]+現在時間[秒])
	//開始時間は日本時間固定だが、現在時間は日本時間とは限らないのでそれぞれUTC標準時に変換
	//ただし、サマータイムが導入されてる場合にはさらに補正が必要
	var timeLeft = settings["LimitTime"] - (0-(SocketManager.playerStatus.baseTime-9*60*60)+(new Date().getTime()/1000 + new Date().getTimezoneOffset()*60));
//add end
	if(timeLeft<600){
		tagF="<font color=red>";
		tagT="</font>";
	}
//	document.getElementById("timeleft").innerHTML = "残り時間/" + tagF + convertTimeString(timeLeft) + tagT;
	document.getElementById("timeleft").innerHTML = "残 " + tagF + convertTimeString(timeLeft) + tagT;
	if(timeLeft<=0){
		if(timeLeftTimer!=0){
			clearInterval(timeLeftTimer);
			timeLeftTimer = 0;
		}
		//30分強制ログオフ
		if(document.getElementById("logoffCheck").checked){
			disconnect();
		}
		document.getElementById("timeleft").innerHTML = "放送終了";
	}
}

// 自動再生
function checkAutoPlay(flag){
	document.getElementById("autoPlayInterval").disabled = flag;
	document.getElementById("autoPlayRandom").disabled = flag;
	document.getElementById("autoPlayStanby").disabled = flag;
}

// 再生情報の表示と自動再生のチェック
// getTimeLeftとは時間の扱い方が逆なのに注意
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
	// 再生中
	if(min-timeLeft>0){
		var residue;
		if( settings["TimeLeftCountdown"] == 1 ){
			// カウントダウン
			residue = PlayTime - timeLeft;
			if( residue < 0 ){
				residue = 0;
			}
		}
		else{
			// カウントアップ（デフォルト）
			residue = timeLeft;
		}
		document.getElementById("playState").innerHTML = tagF+convertTimeString(residue)+"/"+convertTimeString(PlayTime)+tagT;
	// 再生終了
	}else{
		// 自動再生がONでありリクエストキューが0の場合は
		if(autoPlay && RequestManager.RequestQueues.length==0){
			if(document.getElementById("autoPlayStanby").checked){
				document.getElementById("playState").innerHTML = "待機中";
			}else{
				document.getElementById("autoPlay").checked = false;
				checkAutoPlay(false);
			}
			return;
		}
		// 再生情報の停止
		if(playStateTimer!=0){
			clearInterval(playStateTimer);
			playStateTimer = 0;
		}
		// 自動再生がONなら次の動画を再生
		if(autoPlay){
			if(document.getElementById("autoPlayRandom").checked){
				var l = RequestManager.RequestQueues.length;
				var index = GetRandom(0, l-1);
				RequestManager.Events["Play"](RequestManager.RequestQueues[index].id);
			}else{
				clearInterval(playStateTimer);
				playFirst();
			}
		// 自動再生がOFFなら再生終了して待機
		}else{
			document.getElementById("playState").innerHTML = "再生終了";
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

// 強制ログイン機能
function checkloginCheck(){
	//チェックがないか接続がある場合は処理終了
	if(!document.getElementById("loginCheck").checked || SocketManager.connected) return;
	//ログオフ時強制ログインにチェックが入ってる、かつ、接続がなければ接続画面を表示
	connectDialog();
}

// 強制ログオフ機能
function checklogoffCheck(){
	if(!document.getElementById("loginCheck").checked || (SocketManager.connected && document.getElementById("timeleft").innerHTML!="放送終了")) return;
	disconnect();
}
//add start

// ウィンドウの位置・サイズをsettings.jsに反映
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

// stock.txtからストックをロード
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

// 現在のストックリストを保存
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

// NG動画IDをロード
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
		if(browserType!=0 && flag=="connect") alert("接続には NicoCookieImporter が必要です。");
		return;
	}
	if(browserType!=0){
		if(flag=="connect"){
			var NicoCookieImportResult = WshShell.run("\"" + NicoCookieFilePath + "\" " + cookieLifeSpan + " " + browserType , 0, true);
		}
		if(flag=="disconnect"){
			var NicoCookieImportResult = WshShell.run("\"" + NicoCookieFilePath + "\" -1" , 0, true);
		}
		if(NicoCookieImportResult!=0) alert("ブラウザのCookieの共有に失敗しました。ニコニコと接続できません。");
	}
}

var AutoCmtAllMode = 0;
var AutoCmtTimerID;

//複数コメント出力
function AutoCmtOnePut(){
	var TargetCmtText;
	var AutoTimerInterval;

	if (document.getElementById("AutoCmtText").value == "") return;

	//改行がなければ付加
	if (document.getElementById("AutoCmtText").value.match("\n") != "\n"){
		document.getElementById("AutoCmtText").value += "\n";
	}

	//1行文字列抽出&出力
	TargetCmtText = document.getElementById("AutoCmtText").value.match("^.*\n");
	NicoLive.postComment(TargetCmtText, "");

	//出力文字列削除
	document.getElementById("AutoCmtText").value = document.getElementById("AutoCmtText").value.replace(TargetCmtText,"");

	if (AutoCmtAllMode == 1){
		//未送信コメントが有ればタイマー後に再度実行
		if (document.getElementById("AutoCmtText").value != ""){
			AutoTimerInterval = document.getElementById("AutoCmtInterval").value * 1000;
			AutoCmtTimerID = setTimeout(AutoCmtOnePut, AutoTimerInterval);
		}else{
			AutoCmtAllMode = 0;
			document.getElementById("AutoCmAlltBtn").value="連続出力"
			document.getElementById("AutoCmtInterval").disabled = "";
		}
	}
}

//複数コメント出力(全行)
function AutoCmtAllPut(){
	if (AutoCmtAllMode == 0){
		AutoCmtAllMode = 1;
		document.getElementById("AutoCmAlltBtn").value="出力停止"
		document.getElementById("AutoCmtInterval").disabled = "true";
		AutoCmtOnePut();
	}else{
		AutoCmtAllMode = 0;
		document.getElementById("AutoCmAlltBtn").value="連続出力"
		document.getElementById("AutoCmtInterval").disabled = "";
		clearTimeout(AutoCmtTimerID);
	}
}

// 元動画の最新コメントを取得(テスト中)
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
		// ２日以上
		var day = parseInt( sec / ( 24 * 60 * 60 ) );
		msg = day + "日";
	}
	else if( sec > 24 * 60 * 60 ){
		// ２日以下
		var day = parseInt( sec / ( 24 * 60 * 60 ) );
		var hour = parseInt( ( sec - ( day * 24 * 60 * 60 ) ) / ( 60 * 60 ) );
		if( hour == 0 ){
			msg = day + "日";
		}
		else{
			msg = day + "日" + hour + "時間";
		}
	}
	else if( sec > 60 * 60 ){
		// １日以下
		var hour = parseInt( sec / ( 60 * 60 ) );
		var min = parseInt( ( sec - ( hour * 60 * 60 ) ) / 60 );
		
		if( hour < 12 && min != 0 ){
			msg = hour + "時間" + min + "分";
		}
		else{
			msg = hour + "時間";
		}
	}
	else if( sec > 60 ){
		// １時間以下
		var min = parseInt( sec / 60 );
		msg = min + "分";
	}
	else{
		// １分以内
		msg = sec + "秒";
	}
	
	return msg;
}

// lv1234567 の頭にパート番号を付ける
// api で取れないのかな
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
	xmlhttp.responseText.match(/<h2[^<>]*?>(.+?)<\/h2>/);
	if( RegExp.$1 != "" ){
		var title = RegExp.$1;
		
		// パート部分を得る
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

// ホットキーをセット
$(document).bind('keydown', 'c', function(){
	// 接続 connect
	top.connectDialog();
});
$(document).bind('keydown', 'i', function(){
	// テキストの取り込み import
	top.importText();
});
$(document).bind('keydown', 'e', function(){
	// 再生履歴の出力 export
	top.exportIDs('PlayLog');
});
$(document).bind('keydown', 'f', function(){
	// マイリストから検索 find
	top.findMylist();
});

