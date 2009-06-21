function RequestManager(){
	this.RequestQueues     = new Array();
	this.Requests          = new Array();
	this.Indexes           = new Array();
	this.ThumbInfoTasks    = new Array();
	this.ThumbInfoTimer    = 0;
	this.RequestDOMTasks   = new Array();
	this.RequestDOMTimer   = 0;
	this.Events            = new Array();
	this.initialize.apply(this, arguments);
}

RequestManager.prototype = {
	initialize: function(){
		this.Events["Play"] = function(id){
			alert("Play:"+id)
		};
		this.Events["Edit"] = function(element, type, id){
			var beforeValue = element.innerHTML;
			if(beforeValue==settings["NoPName"]){
				beforeValue = "[" + RequestManager.Requests[id].tags.join("][") + "]";
			}
//add start JASコードなしの場合
			if(beforeValue==settings["NoJASCode"]){
				beforeValue = "";
			}
//add end
			var afterValue  = prompt("正しい"+type+"を編集してください\n[ctrl]+[Z]で一つ前の状態に戻る、[キャンセル]か空白にして[OK]で未修正のまま終了", beforeValue);
			if(afterValue && afterValue!=beforeValue){
//del				RequestManager.Requests[id][type] = afterValue;
//add start
				if(type!="JASCode") RequestManager.Requests[id][type] = afterValue;
//add end
				element.innerHTML  = afterValue;
			}
		}
	},
	addRequestQueue: function(RQ){
		if(!(RQ instanceof RequestQueue) || arguments.length==3){
			RQ = new RequestQueue(arguments[0], arguments[1], arguments[2]);
		}
		// キャッシュが存在してそのIDが無効だった場合はスルー
		var R = this.Requests[RQ.id];
		if(R && R.view==0&&R.comm==0&&R.list==0) return;
		// 重複リクエストの場合はスキップ
		if(this.Indexes[RQ.id]==undefined){
			// RequestQueuesを基準としてRequestsを動画情報のハッシュとして扱う
			this.RequestQueues.push(RQ);
			// IDからRequestQueuesにアクセスできるようにIndexesをかませる
			this.Indexes[RQ.id] = this.RequestQueues.length - 1;
			// 動画情報を取得するタスクに登録
			if(!this.Requests[RQ.id]) this.doThumbInfoTask(RQ);
		}
		// 動画情報をHTMLに追加するタスクに登録
		this.doRequestDOMTask(RQ);
	},
	getItemHTML: function(RQ){
		var RequestID = RQ.key+"-"+("0000"+RQ.number).slice(-4);
		var ItemHTML = "<div id=\"{#ID}\"><table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\">"
		ItemHTML += "<tr><td width=\"100%\"><u ondblclick=\"RequestManager.Events['Play']('{#ID}')\" onclick=\"__RequestManager__showPopup(event.clientX, event.clientY, '{#ID}')\" oncontextmenu=\"OpenVideo('{#ID}')\" title=\"クリックで動画情報表示\">";
		ItemHTML += "[<span id=\"RNO{#ID}\">"+(this.Indexes[RQ.id]+1)+"/"+this.RequestQueues.length+"</span>]&nbsp;";
		ItemHTML += "<b>{#ID}</b>&nbsp;"
		ItemHTML += "<span id=\"RID{#ID}\">"+RequestID+"</span></u><br>";
		ItemHTML += "<div id=\"INF{#ID}\">";
		// 動画情報が取得済みなら情報を出力する
		if(this.Requests[RQ.id]){
			ItemHTML += settings["ItemHTML"];
		}else{
			ItemHTML += "動画情報取得中...";
		}
		ItemHTML += "</div></td><td align=\"right\">";
		ItemHTML += "<input type=\"button\" onclick=\"RequestManager.setClipboard('ID', '{#ID}')\" value=\"動\">";
//add start
		//近いと押し間違えやすいらしいので1行挿入
		ItemHTML += "<br> ";
//add end
		ItemHTML += "<br><input type=\"button\" onclick=\"RequestManager.setClipboard('IF', '{#ID}')\" value=\"情\" title=\"右クリックで動画情報2をコピー\" oncontextmenu=\"RequestManager.setClipboard('IF2', '{#ID}');return false;\">";
		ItemHTML += "</td><td>";
		if(settings["UseIE"]){
			ItemHTML += "<input type=\"button\" id=\"PLY{#ID}\" onclick=\"RequestManager.Events['Play']('{#ID}')\" value=\"再生\">";
		}else{
			ItemHTML += "<input type=\"button\" id=\"PLY{#ID}\" onclick=\"RequestManager.Events['Play']('{#ID}')\" value=\"履歴\">";
		}
//add start
		//近いと押し間違えやすいらしいので1行挿入
		ItemHTML += "<br> ";
//add end
		ItemHTML += "<br><input type=\"button\" onclick=\"RequestManager.deleteRequestQueueById('{#ID}')\" value=\"削除\"></td>";
		ItemHTML += "</td><td>";
		ItemHTML += "<input type=\"button\" onclick=\"RequestManager.upRequest('{#ID}')\" oncontextmenu=\"RequestManager.upRequestFirst('{#ID}');return false;\" value=\"↑\" title=\"右クリックで一番上に移動\">";
//add start
		//近いと押し間違えやすいらしいので1行挿入
		ItemHTML += "<br> ";
//add end
		ItemHTML += "<br><input type=\"button\" onclick=\"RequestManager.downRequest('{#ID}')\" oncontextmenu=\"RequestManager.downRequestLast('{#ID}');return false;\" value=\"↓\" title=\"右クリックで一番下に移動\">";
		ItemHTML += "</td></tr></table><hr></div>";
		if(this.Requests[RQ.id]){
			return this._replaceHTML(ItemHTML, this.Requests[RQ.id]);
		}else{
			return ItemHTML.replace(/{#ID}/g, RQ.id);
		}
	},
	// Requestを指定すると対象の要素を整形する
	replaceHTML: function(R){
		var info = document.getElementById("INF"+R.id);
		if(info){
			info.innerHTML = this._replaceHTML(settings["ItemHTML"], R);
//add start	タイプ判定
			RequestManager.typeHTML(R.id);
//add end
		}else{
			setTimeout(function(){RequestManager.replaceHTML(R);}, 50);
		}
	},
	// 引数の文字列をRequestの情報で置換する
	// PNameとJASCodeは前後に文字列を含めることができたりする
	_replaceHTML: function(str, R){
		if(!R || !R instanceof Request) return str;
//add start JASコードなしの場合
		if(!JASCodes[R.id]) JASCodes[R.id]=settings["NoJASCode"];
//add end
		var idno = R.id.replace(/^(sm|nm)/, "");
		return str
				.replace(/{#ID}/g,    R.id)
				.replace(/{#IDNO}/g,    idno)
				.replace(/{#Title}/g, "<label ondblclick=\"RequestManager.Events['Edit'](this, 'title','"+R.id+"')\">"+R.title+"</label>")
				.replace(/{([^}]*?)#PName([^{]*?)}/g, function(match,$1,$2){return $1+"<label ondblclick=\"RequestManager.Events['Edit'](this, 'name','"+R.id+"')\">"+R.name+"</label>"+$2;})
				.replace(/{#View}/g,  comma(R.view))
				.replace(/{#Comm}/g,  comma(R.comm))
				.replace(/{#List}/g,  comma(R.list))
				.replace(/{#Count}/g,  comma(R.count))
//add start
				.replace(/{#Kiki}/g,  R.kiki)
				.replace(/{#Myri}/g,  R.myri)
				.replace(/{#Hiky}/g,  R.hiky)
//add end
				.replace(/{#Time}/g,  R.length)
				.replace(/{#CTime}/g, "<label id=\"CT"+R.id+"\">"+this.getCumulativeTime(R.id)+"</label>")
				.replace(/{#Date}/g,  R.getDateString(settings["ItemHTMLDate"]))
//del				.replace(/{([^}]*?)#JASCode([^{]*?)}/g, JASCodes[R.id] ? function(match,$1,$2){return $1+JASCodes[R.id]+$2;} : "")
//add start JASコードの編集を可能に
				.replace(/{([^}]*?)#JASCode([^{]*?)}/g, RegExp.$1+"<label ondblclick=\"RequestManager.Events['Edit'](this, 'JASCode','"+R.id+"')\">"+JASCodes[R.id]+"</label>"+RegExp.$2)
//add end
				.replace(/{#Tags}/g, "<div title=\""+R.tags+"\">[tag]</div>")
//add start タイプ表示箇所を追加
				.replace(/{#Type}/g, "<span id=\"TYP"+R.id+"\" onclick=\"RequestManager.setAlert('"+R.id+"')\" title=\"クリックで詳細情報を表示\"></span>")
//add end
		;
	},
//add start
	//タイプ表示
	typeHTML: function(id){
		var R = this.Requests[id];
		var objIndex = "TYP"+id;
		if(document.getElementById(objIndex)){
			if(R.type=="plural"){
//				document.getElementById(objIndex).innerHTML += "複数該当";
				document.getElementById(objIndex).style.backgroundColor="yellow";
				document.getElementById(objIndex).style.color="#000000";
			} else if(R.type==""){
//				document.getElementById(objIndex).innerHTML += "該当無し";
				document.getElementById(objIndex).style.backgroundColor="gray";
				document.getElementById(objIndex).style.color="#ffffff";
			} else {
				document.getElementById(objIndex).innerHTML += settings[R.type+"Text"];
				document.getElementById(objIndex).style.backgroundColor=settings[R.type+"backgroundColor"];
				document.getElementById(objIndex).style.color=settings[R.type+"color"];
			}
		}
	},
//add end
	// 動画情報の取得タスク
	doThumbInfoTask: function(RQ, method){
		if(!method) method = "push";
		this.ThumbInfoTasks[method](RQ);
		// 動画情報を取得するタスクが動いてなかったら起動
		if(!this.ThumbInfoTimer) this.ThumbInfoTimer = setInterval(this._doThumbInfoTask, settings["ThumbInfoTaskWait"]);
	},
	// setIntervalで起動しているのでthisが使えない
	_doThumbInfoTask: function(){
		if(RequestManager.ThumbInfoTasks.length==0){
			clearInterval(RequestManager.ThumbInfoTimer);
			RequestManager.ThumbInfoTimer = 0;
			RequestManager.resetCumulativeTime();
		}else{
			// キューを取り出して動画情報を取得する
			var RQ = RequestManager.ThumbInfoTasks.shift();
			NicoLive.getThumbInfo(RQ.id, function (R){
				if(!R){
					// タイムアウトした場合はタスクに優先的に追加
					RequestManager.doThumbInfoTask(RQ, "unshift");
				}else{
					// ミクノポップ再生回数の取得を試みる
					R.count = getMikunopopCount( R.id );
					// 動画情報を格納してHTMLを整形
					RequestManager.Requests[RQ.id] = R;
					RequestManager.replaceHTML(R);
					RequestManager.setCumulativeTime(RQ.id);
					// 無効なリクエストだった場合は削除
					if(R.view==0&&R.comm==0&&R.list==0) RequestManager.deleteRequestQueueById(RQ.id);
				}
			});
		}
	},
	// 動画情報の追加タスク
	doRequestDOMTask: function(RQ){
		this.RequestDOMTasks.push(RQ);
		// 動画情報をHTMLに追加するタスクが動いてなかったら起動
		if(!this.RequestDOMTimer) this.RequestDOMTimer = setInterval(this._doRequestDOMTask, 1);
	},
	// setIntervalで起動しているのでthisが使えない
	_doRequestDOMTask: function(){
		if(RequestManager.RequestDOMTasks.length==0){
			clearInterval(RequestManager.RequestDOMTimer);
			RequestManager.RequestDOMTimer = 0;
			//RequestManager.resetCumulativeTime();
		}else{
			// キューを取り出して動画情報をHTMLに追加する
			var RQ = RequestManager.RequestDOMTasks.shift();
			// リクエストが重複した場合
			if(document.getElementById(RQ.id)){
				var RequestID = RQ.key+"-"+("0000"+RQ.number).slice(-4);
				document.getElementById("RID"+RQ.id).innerText += ", " + RequestID;
			}else{
				document.getElementById("RequestHTML").insertAdjacentHTML("BeforeEnd", RequestManager.getItemHTML(RQ));
//add start	タイプ判定
				RequestManager.typeHTML(RQ.id);
//add end
				RequestManager.setCumulativeTime(RQ.id);
			}
		}
	},
	// 累積時間の設定
	setCumulativeTime: function(id){
		var CT = document.getElementById("CT"+id);
		if(CT) CT.innerText = this.getCumulativeTime(id);
		// ついでにリクエストナンバーも更新しちゃう
		var RNO = document.getElementById("RNO"+id);
		if(RNO) RNO.innerText = (this.Indexes[id]+1)+"/"+this.RequestQueues.length;
	},
	// 累積時間の再設定
	resetCumulativeTime: function(){
		for(var i=0,l=this.RequestQueues.length; i<l; i++){
			this.setCumulativeTime(this.RequestQueues[i].id);
		}
	},
	// 累積時間の取得
	getCumulativeTime: function(id){
		var CTime = 0;
		for(var i=0,l=this.RequestQueues.length; i<l; i++){
			var RQ_id = this.RequestQueues[i].id
			var R = this.Requests[RQ_id];
			if(!R) return "??:??";// 手前の動画の情報がまだ取れてなかったらあきらめる
			CTime += R.getLengthNumber();
			if(RQ_id==id) break;
		}
		var mm = parseInt(CTime/60);
		var ss = CTime%60;
		if(ss<10) ss = "0"+ss;
		return mm+":"+ss;
	},
	// 再生時の運営者コメント
	getInfoComment: function(id){
		var R = this.Requests[id];
		if(!R) return "";
//add start JASコードなしの場合
		if(!JASCodes[R.id]) JASCodes[R.id]=settings["NoJASCode"];
//add end
		return settings["InfoComment"]
					.replace(/{#ID}/g, id)
					.replace(/{#Title}/g, R.title)
					.replace(/{#PName}/g, R.name)
					.replace(/{#View}/g,  comma(R.view))
					.replace(/{#Comm}/g,  comma(R.comm))
					.replace(/{#List}/g,  comma(R.list))
					.replace(/{#Count}/g,  comma(R.count))
//add start
					.replace(/{#Kiki}/g,  R.kiki)
					.replace(/{#Myri}/g,  R.myri)
					.replace(/{#Hiky}/g,  R.hiky)
//add end
					.replace(/{#Time}/g,  R.length)
					.replace(/{#Date}/g,  R.getDateString(settings["InfoCommentDate"]))
//del					.replace(/{([^}]*?)#JASCode([^{]*?)}/g, JASCodes[R.id] ? function(match,$1,$2){return $1+JASCodes[R.id]+$2;} : "")
//add start JASコード関連の修正
					.replace(/{([^}]*?)#JASCode([^{]*?)}/g, RegExp.$1+JASCodes[R.id]+RegExp.$2)
//add end
		;
	},
	// 再生時の運営者コメント2
	getInfoComment2: function(id){
		var R = this.Requests[id];
		if(!R) return "";
//add start JASコードなしの場合
		if(!JASCodes[R.id]) JASCodes[R.id]=settings["NoJASCode"];
//add end
		return settings["InfoComment2"]
					.replace(/{#ID}/g, id)
					.replace(/{#Title}/g, R.title)
					.replace(/{#PName}/g, R.name)
					.replace(/{#View}/g,  comma(R.view))
					.replace(/{#Comm}/g,  comma(R.comm))
					.replace(/{#List}/g,  comma(R.list))
					.replace(/{#Count}/g,  comma(R.count))
//add start
					.replace(/{#Kiki}/g,  R.kiki)
					.replace(/{#Myri}/g,  R.myri)
					.replace(/{#Hiky}/g,  R.hiky)
//add end
					.replace(/{#Time}/g,  R.length)
					.replace(/{#Date}/g,  R.getDateString(settings["InfoCommentDate"]))
//del					.replace(/{([^}]*?)#JASCode([^{]*?)}/g, JASCodes[R.id] ? function(match,$1,$2){return $1+JASCodes[R.id]+$2;} : "")
//add start JASコード関連の修正
					.replace(/{([^}]*?)#JASCode([^{]*?)}/g, RegExp.$1+JASCodes[R.id]+RegExp.$2)
//add end
		;
	},	// 再生履歴用のテキスト
	getPlayLog: function(id){
		var R = this.Requests[id];
		if(!R) return "";
//add start JASコードなしの場合
		if(!JASCodes[R.id]) JASCodes[R.id]=settings["NoJASCode"];
//add end
		return settings["PlayLog"]
					.replace(/{#ID}/g, id)
					.replace(/{#Title}/g, R.title)
					.replace(/{#PName}/g, R.name)
					.replace(/{#View}/g,  comma(R.view))
					.replace(/{#Comm}/g,  comma(R.comm))
					.replace(/{#List}/g,  comma(R.list))
					.replace(/{#Count}/g,  comma(R.count))
//add start
					.replace(/{#Kiki}/g,  R.kiki)
					.replace(/{#Myri}/g,  R.myri)
					.replace(/{#Hiky}/g,  R.hiky)
//add end
					.replace(/{#Time}/g,  R.length)
					.replace(/{#Date}/g,  R.getDateString(settings["InfoCommentDate"]))
//del					.replace(/{([^}]*?)#JASCode([^{]*?)}/g, JASCodes[R.id] ? function(match,$1,$2){return $1+JASCodes[R.id]+$2;} : "")
//add start JASコード関連の修正
					.replace(/{([^}]*?)#JASCode([^{]*?)}/g, RegExp.$1+JASCodes[R.id]+RegExp.$2)
//add end
		;
	},
//add start　各種動画情報を取得保存し、タイプ判定に使用
	// アラート表示
	setAlert: function(id){
		var R = this.Requests[id];
		if(!R) return;
		if (!(settings["typeTITLE"] || settings["typeDESCRIPTION"] || settings["typeTAG"])) return;
		var ItemHTML = "";
		if (settings["typeTITLE"]) {
			ItemHTML += "<b>動画タイトル</b><br>"+this.replaceSettings(R.oTitle)+"<br><hr>";
		}
		if (settings["typeDESCRIPTION"]) {
			ItemHTML += "<b>動画コメント</b><br>"+this.replaceSettings(R.description).replace(/&lt;/g,"<").replace(/&gt;/g,">")+"<br><hr>";
		}
		if (settings["typeTAG"]) {
			ItemHTML += "<b>動画タグ一覧</b><br>"+this.replaceSettings(R.tags.join("<br>"))+"<br>";
		}
		ItemHTML += "</table>";
		var windowopen=window.showModalDialog("./System/Alert.hta",ItemHTML,"status:no;help:no;resizable:yes;");
	},
	// 引数の文字列をSettingsの情報で置換する
	replaceSettings: function(str){
		if(str=="") return str;
		var strSettings="";
		var strColor="";

		for(var j=1,k=settings["typeMax"]; j<=k; j++){
			if(settings["type"+j+"STR"]){
				strSettings=settings["type"+j+"STR"];
				strColor=settings["type"+j+"backgroundColor"];
				for(var i=0,l=strSettings.length; i<l; i++){
					if(str.indexOf(strSettings[i]) > -1){
						str = str.replace(strSettings[i], "<font color=\""+strColor+"\"><b>"+strSettings[i]+"</b></font>");
					}
				}
			}
		}

		return str;
	},
//add end
	// ID指定による削除
	deleteRequestQueueById: function(id){
		document.getElementById("RequestHTML").removeChild(document.getElementById(id));
		var deleteIndex = this.Indexes[id];
		// インデックスの削除
		delete this.Indexes[id];
		// インデックスの更新
		for(var i=deleteIndex+1,l=this.RequestQueues.length; i<l; i++){
			this.Indexes[this.RequestQueues[i].id]--;
		}
		// リクエストの削除
		this.RequestQueues.splice(deleteIndex, 1);
		// 動画情報はキャッシュとして残しておくのでコメントアウト
		// delete this.Requests[id];
		this.resetCumulativeTime();
	},
	// Index指定による削除
	deleteRequestQueueByIndex: function(index){
		this.deleteRequestQueueById(this.RequestQueues[index].id);
	},
	// 要素の入れ替え
	swapRequest: function(a, b){
		// 現在のインデックスを取得
		var indexA = this.Indexes[a];
		var indexB = this.Indexes[b];
		// インデックスを入れ替える
		var tempIndex = this.Indexes[a];
		this.Indexes[a] = this.Indexes[b];
		this.Indexes[b] = tempIndex;
		// リクエストを入れ替える
		var tempRequest  = this.RequestQueues[indexA];
		this.RequestQueues[indexA] = this.RequestQueues[indexB];
		this.RequestQueues[indexB] = tempRequest;
		// 要素を入れ替える
		var elementA = document.getElementById(a);
		var elementB = document.getElementById(b);
		var swapElementA = elementA.cloneNode(true);
		var swapElementB = elementB.cloneNode(true);
		elementA.parentNode.replaceChild(swapElementB, elementA);
		elementB.parentNode.replaceChild(swapElementA, elementB);
		this.setCumulativeTime(a);
		this.setCumulativeTime(b);
	},
	// 上へ移動
	upRequest: function(id){
		var elementA = document.getElementById(id);
		var elementB = elementA.previousSibling;
		if(elementB) this.swapRequest(elementA.id, elementB.id);
	},
	// 下へ移動
	downRequest: function(id){
		var elementA = document.getElementById(id);
		var elementB = elementA.nextSibling;
		// 下へ移動は次の要素が上へ移動と置き換えられる
		if(elementB) this.upRequest(elementB.id);
	},
	// 一番上へ移動
	upRequestFirst: function(id){
		var elementA = document.getElementById(id);
		for(var i=0, l=this.Indexes[elementA.id]; i<l; i++){
			this.swapRequest(elementA.id, this.RequestQueues[l-i-1].id);
		}
	},
	// 一番下へ移動
	downRequestLast: function(id){
		var elementA = document.getElementById(id);
		for(var i=this.Indexes[elementA.id], l=this.RequestQueues.length; i<l; i++){
			this.swapRequest(elementA.id, this.RequestQueues[i].id);
		}
	},
	// クリップボードにコピー
	setClipboard: function(type, id){
		if(id==""||type=="") return;
		var str = "";
		switch(type){
			case "ID":
				// GUIの設定を見に行ってるのは美しくない…
				str = (document.getElementById("playSound").checked?"/playsound ":"/play ")+id+(document.getElementById("playSub").checked?" sub":"");
			break;
			case "IF":
				str = this.getInfoComment(id);
			break;
			case "IF2"://InfoComment2から取得
				str = this.getInfoComment2(id);
			break;
			default:
		}
		document.parentWindow.clipboardData.setData("Text", str);
	},
	// ソート
	sort: function(mode, updown){
		if(mode=="shuffle"){
			var i = this.RequestQueues.length;
			while(i){
				var j = Math.floor(Math.random()*i);
				var t = this.RequestQueues[--i];
				this.RequestQueues[i] = this.RequestQueues[j];
				this.RequestQueues[j] = t;
			}
		}else if(mode=="request"){
			this.RequestQueues.sort(function(a, b){
				var NA = Number(a.number);
				var NB = Number(b.number);
				return updown*(NB-NA);
			});
		}else if(mode=="id"){
			this.RequestQueues.sort(function(a, b){
				var IDA = Number(a.id.slice(2));
				var IDB = Number(b.id.slice(2));
				return updown*(IDB-IDA);
			});
		}else{
			if(this.ThumbInfoTimer){
				alert("動画情報取得中はソートできません");
				return;
			}
			this.RequestQueues.sort(function(a, b){
				var RA = RequestManager.Requests[a.id];
				var RB = RequestManager.Requests[b.id];
				return updown*(RB[mode]-RA[mode]);
			});
		}
		// インデックス・HTMLの再構築
		document.getElementById("RequestHTML").innerHTML = "";
		for(var i=0,l=this.RequestQueues.length; i<l; i++){
			this.Indexes[this.RequestQueues[i].id] = i;
			this.doRequestDOMTask(this.RequestQueues[i]);
//add start	タイプ判定
			this.typeHTML(this.RequestQueues[i].id);
//add end
		}
	}
}

var RequestManager = new RequestManager();


// 情報ポップアップ
var __RequestManager__Popup = window.createPopup();
function __RequestManager__showPopup(x, y, VideoID){ 
	var body  = __RequestManager__Popup.document.body;
	body.innerHTML = "<img src=\"http://niconail.info/"+VideoID+"\" alt=\""+VideoID+"\" width=\"314\" height=\"178\" onclick=\"top.__RequestManager__Popup.hide();\" onmousewheel=\"top.__RequestManager__Popup.hide();\">";
	__RequestManager__Popup.show(x, y, 314, 178, document.body);
}

function OpenVideo(id){
	var WshShell = new ActiveXObject("WScript.Shell");
	WshShell.run("http://www.nicovideo.jp/watch/"+id,1,false);
}
function comma ( from ){
	var to = String( from );
	var tmp = "";
	while (to != (tmp = to.replace(/^([+-]?\d+)(\d\d\d)/,"$1,$2"))){
		to = tmp;
	}
	return to;
}
function getMikunopopCount (vid) {
	var count;
	$.ajax( {
		url: "http://mikunopop.info/count/" + vid,
		async: 0,
		dataType: "json",
		success: function (result, status) {
			if( result.count && result.count.match(/^[0-9]+$/) ){
				count = parseInt( result.count, 10 );
			}
			else{
				count = '0';
			}
		},
		error: function (req, status, error) {
			count = '?';
		}
	} );
	return count;
}
