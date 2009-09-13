//���Ǘ��Ґݒ�e�[�u��
function DummyAdmin(){
	this.UserID     = "";		//���[�U�[ID
	this.Name  	= "";		//���O
	this.CmdFlag   	= 0;		//�R�}���h����
	this.CmtFlag   	= 0;		//�R�����g����
	this.NGFlag	= 0;		//��NG�ݒ�
	this.NameFlag	= 0;		//���O�\��
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

//���Ǘ��Ґݒ�Ǘ�
function DummyAdminManager(){
	this.DummyAdminQueues  = new Array();
	this.Indexes           = new Array();
	this.initialize.apply(this, arguments);
}

DummyAdminManager.prototype = {
	initialize: function(){
	},
	//���Ǘ��ҏ��ǉ�
	addDummyAdminQueue: function(DA){
		//���łɓo�^����Ă��邩�m�F
		if(this.Indexes[DA.UserID]==undefined){
			this.DummyAdminQueues.push(DA);
			// ID����DummyAdminQueues�ɃA�N�Z�X�ł���悤��Indexes�����܂���
			this.Indexes[DA.UserID] = this.DummyAdminQueues.length - 1;

			// ���Ǘ��ҏ���HTML�ɒǉ�
			this.getItemHTML(DA);
		}else{
			alert("ID:"+DA.UserID+"�͂��łɓo�^�ς݂ł�")
		}

		//���b�Z�[�W�\��
		if (document.getElementById("dummyAdminAddMsgCheck").checked){
			var DummyAdminMsg = "�R�}���h:"
			if (DA.CmdFlag){DummyAdminMsg+="ON"}else{DummyAdminMsg+="OFF"}
			DummyAdminMsg += "�@�R�����g:"
			if (DA.CmtFlag){DummyAdminMsg+="ON"}else{DummyAdminMsg+="OFF"}

			if (DA.Name != ""){
				NicoLive.postComment(DA.Name + "����ɕ��Ǘ��ҋ@�\��ݒ肵�܂���<br>"+DummyAdminMsg, "");
			}else{
				NicoLive.postComment("ID:" + DA.UserID + "<br>�ɕ��Ǘ��ҋ@�\��ݒ肵�܂��� "+DummyAdminMsg, "");
			}
			if(DA.NGFlag) NicoLive.postComment("/ngadd ID " + DA.UserID + " 0 0", "");
		}

		//���Ǘ���NG���X�g�̏����o��
		dummyAdminNGListPut();
	},
	//���Ǘ��ҏ��ҏW
	chgDummyAdminQueue: function(id, chgItem){
		//���b�Z�[�W�\��
		var DA = this.DummyAdminQueues[this.Indexes[id]];

		if (chgItem == 1){
			//�R�}���h�����ύX
			checked = document.getElementById("dummyAdminCmdCheck"+DA.UserID).checked;
			if (document.getElementById("dummyAdminChgMsgCheck").checked){
				if (checked){
					if (DA.Name != ""){
						NicoLive.postComment(DA.Name + "����<br>�ɃR�}���h������t�����܂���", "");
					}else{
						NicoLive.postComment("ID:" + DA.UserID + "<br>�ɃR�}���h������t�����܂��� ", "");
					}
				}else{
					if (DA.Name != ""){
						NicoLive.postComment(DA.Name + "����<br>�̃R�}���h�������������܂���", "");
					}else{
						NicoLive.postComment("ID:" + DA.UserID + "<br>�̃R�}���h�������������܂��� ", "");
					}
				}
			}
			this.DummyAdminQueues[this.Indexes[id]].CmdFlag = checked;
		}else if(chgItem == 2){
			//�R�����g�����ύX
			checked = document.getElementById("dummyAdminCmtCheck"+DA.UserID).checked;
			if (document.getElementById("dummyAdminChgMsgCheck").checked){
				if (checked){
					if (DA.Name != ""){
						NicoLive.postComment(DA.Name + "����<br>�ɃR�����g������t�����܂���", "");
					}else{
						NicoLive.postComment("ID:" + DA.UserID + "<br>�ɃR�����g������t�����܂��� ", "");
					}
				}else{
					if (DA.Name != ""){
						NicoLive.postComment(DA.Name + "����<br>�̃R�����g�������������܂���", "");
					}else{
						NicoLive.postComment("ID:" + DA.UserID + "<br>�̃R�����g�������������܂��� ", "");
					}
				}
			}
			this.DummyAdminQueues[this.Indexes[id]].CmtFlag = checked;
		}else if(chgItem == 3){
			//NG�ݒ�ύX
			checked = document.getElementById("dummyAdminNGCheck"+DA.UserID).checked;
			if (checked){
				NicoLive.postComment("/ngadd ID " + DA.UserID + " 0 0", "");
			}else{
				NicoLive.postComment("/ngdel ID " + DA.UserID, "");
			}
			this.DummyAdminQueues[this.Indexes[id]].NGFlag = checked;
		}else{
			//���O�\���ύX
			checked = document.getElementById("dummyAdminNameCheck"+DA.UserID).checked;
			this.DummyAdminQueues[this.Indexes[id]].NameFlag = checked;
		}
	},
	//���Ǘ��ҏ��폜
	delDummyAdminQueue: function(id){
		//���b�Z�[�W�\��
		var DA = this.DummyAdminQueues[this.Indexes[id]];
		if (document.getElementById("dummyAdminDelMsgCheck").checked){
			if (DA.Name != ""){
				NicoLive.postComment(DA.Name + "����̕��Ǘ��ҋ@�\���������܂���", "");
			}else{
				NicoLive.postComment("ID:" + DA.UserID + "<br>�̕��Ǘ��ҋ@�\���������܂��� ", "");
			}
		}
		if(DA.NGFlag) NicoLive.postComment("/ngdel ID " + DA.UserID, "");

		var deleteIndex = this.Indexes[id];
		//�C���f�b�N�X�̍폜
		delete this.Indexes[id];
		//�C���f�b�N�X�̍X�V
		for(var i=deleteIndex+1,l=this.DummyAdminQueues.length; i<l; i++){
			this.Indexes[this.DummyAdminQueues[i].UserID]--;
		}
		//���Ǘ��ҏ��̍폜
		this.DummyAdminQueues.splice(deleteIndex, 1);
		document.getElementById("dumyAdminHTML").removeChild(document.getElementById(id));

		//���Ǘ���NG���X�g�̏����o��
		dummyAdminNGListPut();
	},
	//���Ǘ��ҏ��\��
	getItemHTML: function(DA){
		var ItemHTML = "<div id=\""+DA.UserID+"\"><table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\"><tr>";
		ItemHTML += "<td width=\"100%\">";
		ItemHTML += "<b>���O</b>:"+DA.Name+"  ";
		ItemHTML += "<b>ID</b>:"+DA.UserID+"<br>";
		ItemHTML += "<b>[�I�v�V����] </b>:";
		if (DA.CmdFlag == true){
			ItemHTML += "<input type=\"checkbox\" id=\"dummyAdminCmdCheck"+DA.UserID+"\" onclick=\"DummyAdminManager.chgDummyAdminQueue('{DA_UserID}','1')\" checked><label>�R�}���h </label>";
		}else{
			ItemHTML += "<input type=\"checkbox\" id=\"dummyAdminCmdCheck"+DA.UserID+"\" onclick=\"DummyAdminManager.chgDummyAdminQueue('{DA_UserID}','1')\"><label>�R�}���h </label>";
		}
		if (DA.CmtFlag == true){
			ItemHTML += "<input type=\"checkbox\" id=\"dummyAdminCmtCheck"+DA.UserID+"\" onclick=\"DummyAdminManager.chgDummyAdminQueue('{DA_UserID}','2')\" checked><label>�R�����g </label>";
		}else{
			ItemHTML += "<input type=\"checkbox\" id=\"dummyAdminCmtCheck"+DA.UserID+"\" onclick=\"DummyAdminManager.chgDummyAdminQueue('{DA_UserID}','2')\"><label>�R�����g </label>";
		}
		if (DA.NGFlag == true){
			ItemHTML += "<input type=\"checkbox\" id=\"dummyAdminNGCheck"+DA.UserID+"\" onclick=\"DummyAdminManager.chgDummyAdminQueue('{DA_UserID}','3')\" checked><label>NG </label>";
		}else{
			ItemHTML += "<input type=\"checkbox\" id=\"dummyAdminNGCheck"+DA.UserID+"\" onclick=\"DummyAdminManager.chgDummyAdminQueue('{DA_UserID}','3')\"><label>NG </label>";
		}
		if (DA.NameFlag == true){
			ItemHTML += "<input type=\"checkbox\" id=\"dummyAdminNameCheck"+DA.UserID+"\" onclick=\"DummyAdminManager.chgDummyAdminQueue('{DA_UserID}','4')\" checked><label>���O�\��</label>";
		}else{
			ItemHTML += "<input type=\"checkbox\" id=\"dummyAdminNameCheck"+DA.UserID+"\" onclick=\"DummyAdminManager.chgDummyAdminQueue('{DA_UserID}','4')\"><label>���O�\��</label>";
		}
		ItemHTML += "</div></td><td align=\"right\">";
		ItemHTML += "</td>";
		ItemHTML += "<td>";
		ItemHTML += "<input type=\"button\" onclick=\"DummyAdminManager.delDummyAdminQueue('{DA_UserID}')\" value=\"�폜\">";
		ItemHTML += "</td>";
		ItemHTML += "</tr></table><hr></div>"
		ItemHTML = ItemHTML.replace(/{DA_UserID}/g, DA.UserID);
		document.getElementById("dumyAdminHTML").insertAdjacentHTML("BeforeEnd", ItemHTML);
	}
}

var DummyAdminManager = new DummyAdminManager();

//���Ǘ��҂�ǉ�
function dummyAdminAdd(){
	var name = document.getElementById("dummyAdminName").value;
	var id = document.getElementById("dummyAdminID").value;
	var cmd = document.getElementById("dummyAdminCmdCheck").checked;
	var cmt = document.getElementById("dummyAdminCmtCheck").checked;
	var ng = document.getElementById("dummyAdminNGCheck").checked;
	var nameflag = document.getElementById("dummyAdminNameCheck").checked;

	if (id != ""){
		DummyAdminManager.addDummyAdminQueue(new DummyAdmin(id, name, cmd, cmt, ng, nameflag));
		document.getElementById("dummyAdminName").value = "";
		document.getElementById("dummyAdminID").value = ""; 
	}
}

//���Ǘ���NG���X�g�̏����o��
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

//�R�����gNo���ID������
function GetNotoID(){
	var findNo = document.getElementById("dummyAdminNo").value;

	document.getElementById("dummyAdminID").value = findNotoID(findNo);

	document.getElementById("dummyAdminNo").value = "";
}
//ID���E�N���b�N
function setSelectedUseridToDummyAdmin(UserId){
	document.getElementById("Tab").selectedIndex = 5;
	document.getElementById("dummyAdminID").value = UserId;
}
