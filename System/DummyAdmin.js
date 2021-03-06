//副管理者設定テーブル
function DummyAdmin(){
	this.UserID     = "";		//ユーザーID
	this.Name  	= "";		//名前
	this.CmdFlag   	= 0;		//コマンド権限
	this.CmtFlag   	= 0;		//コメント権限
	this.NGFlag	= 0;		//主NG設定
	this.NameFlag	= 0;		//名前表示
	this.initialize.apply(this, arguments);
}
DummyAdmin.prototype = {
	initialize: function(id, Name, CmdFlag, CmtFlag, NGFlag, NameFlag){
		this.UserID     = id;
		this.Name  	= Name;
		this.CmdFlag   	= CmdFlag;
		this.CmtFlag   	= CmtFlag;
		this.NGFlag	= NGFlag;
		this.NameFlag	= NameFlag;
	}
};

//副管理者設定管理
function DummyAdminManager(){
	this.DummyAdminQueues  = new Array();
	this.Indexes           = new Array();
	this.initialize.apply(this, arguments);
}

DummyAdminManager.prototype = {
	initialize: function(){
	},
	//副管理者情報追加
	addDummyAdminQueue: function(DA){
		//すでに登録されているか確認
		if(this.Indexes[DA.UserID]==undefined){
			this.DummyAdminQueues.push(DA);
			// IDからDummyAdminQueuesにアクセスできるようにIndexesをかませる
			this.Indexes[DA.UserID] = this.DummyAdminQueues.length - 1;

			// 副管理者情報をHTMLに追加
			this.getItemHTML(DA);
		}else{
			alert("ID:"+DA.UserID+"はすでに登録済みです")
		}

		//メッセージ表示
		if (document.getElementById("dummyAdminAddMsgCheck").checked){
			var DummyAdminMsg = "コマンド:"
			if (DA.CmdFlag){DummyAdminMsg+="ON"}else{DummyAdminMsg+="OFF"}
			DummyAdminMsg += "　コメント:"
			if (DA.CmtFlag){DummyAdminMsg+="ON"}else{DummyAdminMsg+="OFF"}

			NicoLive.postComment(DA.Name + "さん、コメントよろしくお願いします！　<br><font color=\"#999999\">" + DummyAdminMsg + "</font>", "");

			if(DA.NGFlag) NicoLive.postComment("/ngadd ID " + DA.UserID + " 0 0", "");
		}

		//副管理者NGリストの書き出し
		dummyAdminNGListPut();
	},
	//副管理者情報編集
	chgDummyAdminQueue: function(id, chgItem){
		//メッセージ表示
		var DA = this.DummyAdminQueues[this.Indexes[id]];

		if (chgItem == 1){
			//コマンド権限変更
			checked = document.getElementById("dummyAdminCmdCheck"+DA.UserID).checked;
			if (document.getElementById("dummyAdminChgMsgCheck").checked){
				if (checked){
					if (DA.Name != ""){
						NicoLive.postComment("（" + DA.Name + "さん<br>にコマンド権限を付加しました）", "");
					}else{
						NicoLive.postComment("（ID:" + DA.UserID + "<br>にコマンド権限を付加しました）", "");
					}
				}else{
					if (DA.Name != ""){
						NicoLive.postComment("（" + DA.Name + "さん<br>のコマンド権限を解除しました）", "");
					}else{
						NicoLive.postComment("（ID:" + DA.UserID + "<br>のコマンド権限を解除しました）", "");
					}
				}
			}
			this.DummyAdminQueues[this.Indexes[id]].CmdFlag = checked;
		}else if(chgItem == 2){
			//コメント権限変更
			checked = document.getElementById("dummyAdminCmtCheck"+DA.UserID).checked;
			if (document.getElementById("dummyAdminChgMsgCheck").checked){
				if (checked){
					NicoLive.postComment(DA.Name + "さん、よろしくお願いします", "");
				}
				else{
					NicoLive.postComment(DA.Name + "さん<br>ありがとうございました", "");
				}
			}
			this.DummyAdminQueues[this.Indexes[id]].CmtFlag = checked;
		}else if(chgItem == 3){
			//NG設定変更
			checked = document.getElementById("dummyAdminNGCheck"+DA.UserID).checked;
			if (checked){
				NicoLive.postComment("/ngadd ID " + DA.UserID + " 0 0", "");
			}else{
				NicoLive.postComment("/ngdel ID " + DA.UserID, "");
			}
			this.DummyAdminQueues[this.Indexes[id]].NGFlag = checked;
		}else{
			//名前表示変更
			checked = document.getElementById("dummyAdminNameCheck"+DA.UserID).checked;
			this.DummyAdminQueues[this.Indexes[id]].NameFlag = checked;
		}
	},
	//副管理者情報削除
	delDummyAdminQueue: function(id){
		//メッセージ表示
		var DA = this.DummyAdminQueues[this.Indexes[id]];
		if (document.getElementById("dummyAdminDelMsgCheck").checked){
			if (DA.Name != ""){
				NicoLive.postComment(DA.Name + "さん、ありがとうございました！", "");
			}else{
				NicoLive.postComment("ID:" + DA.UserID + "<br>さん、ありがとうございました！", "");
			}
		}
		if(DA.NGFlag) NicoLive.postComment("/ngdel ID " + DA.UserID, "");

		var deleteIndex = this.Indexes[id];
		//インデックスの削除
		delete this.Indexes[id];
		//インデックスの更新
		for(var i=deleteIndex+1,l=this.DummyAdminQueues.length; i<l; i++){
			this.Indexes[this.DummyAdminQueues[i].UserID]--;
		}
		//副管理者情報の削除
		this.DummyAdminQueues.splice(deleteIndex, 1);
		document.getElementById("dumyAdminHTML").removeChild(document.getElementById(id));

		//副管理者NGリストの書き出し
		dummyAdminNGListPut();
	},
	//副管理者情報表示
	getItemHTML: function(DA){
		var ItemHTML = "<div id=\""+DA.UserID+"\"><table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\"><tr>";
		ItemHTML += "<td width=\"100%\">";
		ItemHTML += "<b>名前</b>:"+DA.Name+"  ";
		ItemHTML += "<b>ID</b>:"+DA.UserID+"<br>";
//		ItemHTML += "<b>[オプション] </b>:";
		if (DA.CmdFlag == true){
			ItemHTML += "<input type=\"checkbox\" id=\"dummyAdminCmdCheck"+DA.UserID+"\" onclick=\"DummyAdminManager.chgDummyAdminQueue('{DA_UserID}','1')\" checked><label for=\"dummyAdminCmdCheck"+DA.UserID+"\"> コマンドを許可 </label>";
		}else{
			ItemHTML += "<input type=\"checkbox\" id=\"dummyAdminCmdCheck"+DA.UserID+"\" onclick=\"DummyAdminManager.chgDummyAdminQueue('{DA_UserID}','1')\"><label for=\"dummyAdminCmdCheck"+DA.UserID+"\"> コマンドを許可 </label>";
		}
		if (DA.CmtFlag == true){
			ItemHTML += "<input type=\"checkbox\" id=\"dummyAdminCmtCheck"+DA.UserID+"\" onclick=\"DummyAdminManager.chgDummyAdminQueue('{DA_UserID}','2')\" checked><label for=\"dummyAdminCmtCheck"+DA.UserID+"\"> コメントを許可 </label>";
		}else{
			ItemHTML += "<input type=\"checkbox\" id=\"dummyAdminCmtCheck"+DA.UserID+"\" onclick=\"DummyAdminManager.chgDummyAdminQueue('{DA_UserID}','2')\"><label for=\"dummyAdminCmtCheck"+DA.UserID+"\"> コメントを許可 </label>";
		}
//		if (DA.NGFlag == true){
//			ItemHTML += "<input type=\"checkbox\" id=\"dummyAdminNGCheck"+DA.UserID+"\" onclick=\"DummyAdminManager.chgDummyAdminQueue('{DA_UserID}','3')\" checked><label>NG </label>";
//		}else{
//			ItemHTML += "<input type=\"checkbox\" id=\"dummyAdminNGCheck"+DA.UserID+"\" onclick=\"DummyAdminManager.chgDummyAdminQueue('{DA_UserID}','3')\"><label>NG </label>";
//		}
//		if (DA.NameFlag == true){
//			ItemHTML += "<input type=\"checkbox\" id=\"dummyAdminNameCheck"+DA.UserID+"\" onclick=\"DummyAdminManager.chgDummyAdminQueue('{DA_UserID}','4')\" checked><label>名前表示</label>";
//		}else{
//			ItemHTML += "<input type=\"checkbox\" id=\"dummyAdminNameCheck"+DA.UserID+"\" onclick=\"DummyAdminManager.chgDummyAdminQueue('{DA_UserID}','4')\"><label>名前表示</label>";
//		}
		ItemHTML += "<input type=\"checkbox\" id=\"dummyAdminNGCheck"+DA.UserID+"\" style=\"display: none\">";
		ItemHTML += "<input type=\"checkbox\" id=\"dummyAdminNameCheck"+DA.UserID+"\" style=\"display: none\" checked=\"checked\">";

		ItemHTML += "</div></td><td align=\"right\">";
		ItemHTML += "</td>";
		ItemHTML += "<td>";
		ItemHTML += "<input type=\"button\" onclick=\"DummyAdminManager.delDummyAdminQueue('{DA_UserID}')\" value=\"削除\">";
		ItemHTML += "</td>";
		ItemHTML += "</tr></table><hr></div>"
		ItemHTML = ItemHTML.replace(/{DA_UserID}/g, DA.UserID);
		document.getElementById("dumyAdminHTML").insertAdjacentHTML("BeforeEnd", ItemHTML);
	}
}

var DummyAdminManager = new DummyAdminManager();

//副管理者を追加
function dummyAdminAdd(){
	var name = document.getElementById("dummyAdminName").value;
	var id = document.getElementById("dummyAdminID").value;
	var cmd = document.getElementById("dummyAdminCmdCheck").checked;
	var cmt = document.getElementById("dummyAdminCmtCheck").checked;
	var ng = document.getElementById("dummyAdminNGCheck").checked;
	var nameflag = document.getElementById("dummyAdminNameCheck").checked;

	if( name == "" )
		name = "ゲスト";

	if (id != ""){
		DummyAdminManager.addDummyAdminQueue(new DummyAdmin(id, name, cmd, cmt, ng, nameflag));
		document.getElementById("dummyAdminName").value = "";
		document.getElementById("dummyAdminID").value = ""; 
	}
}

//副管理者NGリストの書き出し
function dummyAdminNGListPut(){
	try{
		var fs = new ActiveXObject('Scripting.FileSystemObject');
		var dummyAdminNGList = "dummyAdminNGList.txt";
		if(fs.FileExists(dummyAdminNGList)) fs.DeleteFile(dummyAdminNGList);
		var cf = fs.CreateTextFile(dummyAdminNGList);
		for(var i=0;i<DummyAdminManager.DummyAdminQueues.length;i++){
			cf.WriteLine("/ngdel ID "+DummyAdminManager.DummyAdminQueues[i].UserID);
		}
		cf.Close(); 
	}catch(e){}
}

//コメントNoよりIDを検索
function GetNotoID(){
	var findNo = document.getElementById("dummyAdminNo").value;

	document.getElementById("dummyAdminID").value = findNotoID(findNo);

	document.getElementById("dummyAdminNo").value = "";
}
//IDを右クリック
function setSelectedUseridToDummyAdmin(UserId){
	document.getElementById("Tab").selectedIndex = 5;
	document.getElementById("dummyAdminID").value = UserId;
}
