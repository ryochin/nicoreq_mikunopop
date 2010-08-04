var acceptRequest = true;
var timeLeftTimer  = 0;
var playStateTimer = 0;
var PlayLog = "";
var NGIDs = new Array();
var PlayedVideoIds = new Array();
var lastPlayedID = "";    // 直近に流した動画
var apiToken = "";    // API token

setWindowSize(settings["WindowWidth"], settings["WindowHeight"]);

window.attachEvent("onload", function(){
	NicoCookieImporter("connect", settings["browserType"], settings["cookieLifeSpan"]);
	// ログファイルの削除
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
		document.title += "(制限モード)";
	}
	if(acceptRequest) openRequest(); else closeRequest();
	if(settings["PlayMode"]==1) document.getElementById("divPlaySub").style.display = "none";
	// SocketManagerにFLASHオブジェクトを登録
	// FLASHがExternalInterfaceを登録する関係上onload以降でないといけない
	SocketManager.setFlash(Socket);
	SocketManager.attachEvent("receiveComment", receiveComment_Request);
	if(settings["TopMost"]) TopMost();
	if(settings["logoffCheck"]) document.getElementById("loginCheck").checked=true;
	checklogoffCheck();
	// NGIDList.txtからNG動画一覧を取得
	loadNGIDs();
	// ストックのロード
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
	// 終了時にログ保存
	if(settings["SaveLogTiming"]=="AtEnd") {
		writelog("play",PlayLog);
		writelog("watch",__VideoInformation__PlayLog);
	}
	// ウィンドウの位置・サイズをsettings.jsに反映
	if(settings["AutoSaveWindowParams"]) saveWindowSize();
	NicoCookieImporter("disconnect");
});

var liveID = null;

function connect(PS){
	if(!PS || PS.lv=="" || PS.addr=="" || PS.port=="" || PS.thread==""){
		//ログオフ時強制ログインのチェックを外す
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
	
	// 枠の時間を自動的にリセット
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

// リクエストのチェック
function receiveComment_Request(Chat){
	// 自分（主）の通常発言なら、常に拾わない
	if( Chat.premium == 3 )
		return;
	var text = Zen2Han(Chat.text);
	var sms  = text.match(/(sm|nm)\d+/g);

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
							NicoLive.postComment("<font size=\"-8\" color=\"#acacec\">★"+dummyAdminName+"さん★</font><br /> "+Chat.text.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\//g,"／").replace(/\n/g,"<br>").replace(/\r/g,""), Chat.mail!=undefined?Chat.mail.replace("184",""):Chat.mail,"big");
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

	if(sms && !(/^\/(play|playsound|swapandplay) smile:/.test(text))){
		if(!acceptRequest){
			// リク〆中
			NicoLive.postComment(">>"+Chat.no+"さん、今はリク受け付けてないので・・・ｻｰｾﾝ", "big");
		}
		else if(sms[1]){
			// １コメに複数の動画番号がある
			NicoLive.postComment(">>"+Chat.no+"さん、1コメ1リクでお願いします。", "big");
		}
		else if(NGIDs[sms[0]]) {
			// NG 動画
			NicoLive.postComment(">>"+Chat.no+"さん、その動画は主のNG動画リストに<br />登録済みなので流せないんです、ごめんなさい", "big");
		}
		else if(settings["AddPlayedVideoId2NGIDs"]&&PlayedVideoIds[sms[0]]) {
			// 最近流れた動画
			NicoLive.postComment(">>"+Chat.no+"さん、その動画は流したばかりなので・・・すみません。", "");
		}
		else if( settings["multiRequestLimit"] > 0 && ! checkReqIDs( liveID, Chat.user_id ) ){
			// １人による複数回リクのチェック
			NicoLive.postComment(">>"+Chat.no+"さん、お一人" + settings["multiRequestLimit"] +  "リクまでとさせてくださいませ m(_ _)m", "");
		}
		else if(settings["CheckNew"]){
			// 新着かどうか確認し、新着だった場合は運営コメで通達
			NicoLive.getXML("http://ext.nicovideo.jp/api/getthumbinfo/" + sms[0], 'video', function(xmldom){
				if(!xmldom.getElementsByTagName("first_retrieve")[0]) {
					NicoLive.postComment(">>"+Chat.no+"さん　<br />その動画は情報が取得できなかったので流せません・・。", "big");
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
						
						// 複数リクエストのチェックのために user id を登録する
						addReqIDs( liveID, Chat.user_id );
					}
				}
			});
		}
		else{
			RequestManager.addRequestQueue(new RequestQueue(sms[0], "C", Chat.no, 'listener'));
			
			// 複数リクエストのチェックのために user id を登録する
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

// 通常モードの再生
var lastPlayVideoTime = 0;
RequestManager.Events["Play"] = function(id){
	// 制限モード
	if(!settings["UseIE"]){
		// 再生履歴取得
		PlayLog += RequestManager.getPlayLog(id);
		PlayLog += "\n";

		if(settings["SaveLogTiming"]=="AtPlay") {
			writelog("play",PlayLog);
		}

		// 履歴ボタンを無効に
		document.getElementById("PLY"+id).disabled = true;
	}

	if(settings["AddPlayedVideoId2NGIDs"]) PlayedVideoIds[id] = true;

	if(!SocketManager.connected) return;

	// ２度押しチェック
	if( thisTime() - lastPlayVideoTime < 10 * 1000 ){
		Status.postStatus("連続再生を検知しました！　１度目以降の再生をキャンセルしました。", 5000);
		return;
	}
	
	// play コマンドを発行
	postPlayCommand( id );
	
	// 時刻を記録
	lastPlayVideoTime = thisTime();
	
	// 再度コマンド発行のために id を控えておく
	lastPlayedID = id;
	
	PlayLog += RequestManager.getPlayLog(id)+"\n";
	// 動画情報が取得できていなかったら終了
	if(!RequestManager.Requests[id]) return;
	// clear
	NicoLive.postComment("/clear", "");
	// InfoCommentの投稿
	NicoLive.postComment(RequestManager.getInfoComment(id), "big");
	// InfoComment2が設定されていたら時間差投稿
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
		showPlayState(startTime, PlayTime, id);
	}, 500);
	// 2度押しを防ぐための処理
	document.getElementById("btnPF").disabled = true;
	// 5秒後に復活
	setTimeout(function(){
		document.getElementById("btnPF").disabled = false;
	}, 5000);
}

// play コマンドを発行
function postPlayCommand (id) {
	if( settings["PlayMode"] == 0 ){
//		var cmd = (document.getElementById("playSound").checked?"/playsound ":"/play ")+id+(document.getElementById("playSub").checked?" sub":"");
		var cmd = $("#playSound").attr('checked') ? "/playsound " : "/play ";
		cmd += id;
		cmd += $('#playSub').attr('checked') ? " sub" : "";
		NicoLive.postComment( cmd );
		
		// ストックリスト自動保存
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

// 直前の再生コマンドを再発行する
function postLastIDPlayCommand () {
	if( lastPlayedID == "" ){
		// まだ１つも再生していない場合
		Status.postStatus('まだ１つも再生していません。', 5000);
	}
	else{
		// 再発行
		postPlayCommand( lastPlayedID );
		Status.postStatus('動画 ' + lastPlayedID + ' の再生コマンドを発行しました。', 10000);
	}
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

function calcTimeLeft () {
	return settings["LimitTime"]
		- (0-(SocketManager.playerStatus.baseTime-9*60*60)
		+ (new Date().getTime()/1000 + new Date().getTimezoneOffset()*60));
}

//残り時間を計算
function getTimeLeft(){
	if(!SocketManager.connected) return;
	var tagF = "", tagT = "";
	//settings["LimitTime"][秒]-(-開始時間[秒]+現在時間[秒])
	//開始時間は日本時間固定だが、現在時間は日本時間とは限らないのでそれぞれUTC標準時に変換
	//ただし、サマータイムが導入されてる場合にはさらに補正が必要
	var timeLeft = calcTimeLeft();

	if(timeLeft < 60 * 5){
		tagF="<font color=red>";
		tagT="</font>";
	}
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
		$('#timeleft').html("放送終了");
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

	// 再生中
	if(min-timeLeft>0){
		var residue;
		if( settings["TimeLeftCountdown"] == 1 ){
			// カウントダウン
			residue = PlayTime - timeLeft;
			if( residue < 0 ){
				residue = 0;
			}
			
			// 再生マージンをセット
			var t = parseInt( calcTimeLeft() - residue );
			var str = "空 " + convertTimeString( t );
			if( last_t == 0 || Math.abs( last_t - t ) > 5 ){    // trying to suppress annoying flip-flop flickers :(
				$('#timemargin').html( str );
				last_t = t;
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
			$("#playState").html("再生終了");
			$("#timemargin").html("再生終了");
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
			if(!settings["AutoSaveStock"]||fs.FileExists(stockfile)){
//				fs.DeleteFile(stockfile,true);
				try {
					// ファイルを空にする（なにも書き込まずにクローズ）
					var cf = fs.CreateTextFile(stockfile);
					cf.Close(); 
				} catch(e) {
					alert("ストックリストファイルの操作に失敗しました orz");
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

// ストックリストの自動保存
var autoSaveStockListRequest = 0;
var autoSaveStockListLastRun = thisTime();

// 保存リクエストがあったら時刻を記録する
function autoSaveStockList(){
	autoSaveStockListRequest = thisTime();
}

// タイマーを仕掛ける
function autoSaveStockListTimer () {
	// もし最後に保存した時刻よりあたらしいリクエストがあったら起動する
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
	// 万が一プログラムにミスがあった場合に消えてしまうのを防ぐ
	if(RequestManager.RequestQueues.length>0)
		saveStockList();
//	Status.postStatus("ストックリストを保存しました。", 3000);
}

function thisTime () {
	var d = new Date;
	return parseInt( d.getTime(), 10 );    // epoch の 10^3 倍の値であることに注意
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
	xmlhttp.responseText.match(/<title[^<>]*?>(.+?)</);
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
$(document).bind('keydown', 'c', createHotkeyFunc( function(){

	// 接続 connect
	if( SocketManager.connected ){
//		alert("すでに接続しています。");
	}
	else{
		top.connectDialog();
	}
}));
$(document).bind('keydown', 'd', createHotkeyFunc( function(){
	// 切断  disconnect
	if( SocketManager.connected ){
		// connected
		if( window.confirm("サーバから切断します。よろしいですか？") ){
			top.disconnect();
		}
	}
	else{
//		alert("まだ接続されていません。");
	}
}));
$(document).bind('keydown', 'i', createHotkeyFunc( function(){
	// テキストの取り込み import
	top.importText();
}));
$(document).bind('keydown', 'e', createHotkeyFunc( function(){
	// 再生履歴の出力 export
	top.exportIDs('PlayLog');
}));
$(document).bind('keydown', 'f', createHotkeyFunc( function(){
	// マイリストから検索 find
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

