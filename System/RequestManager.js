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
//add start JAS�R�[�h�Ȃ��̏ꍇ
			if(beforeValue==settings["NoJASCode"]){
				beforeValue = "";
			}
//add end
			var afterValue  = prompt("������"+type+"��ҏW���Ă�������\n[ctrl]+[Z]�ň�O�̏�Ԃɖ߂�A[�L�����Z��]���󔒂ɂ���[OK]�Ŗ��C���̂܂܏I��", beforeValue);
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
		// �L���b�V�������݂��Ă���ID�������������ꍇ�̓X���[
		var R = this.Requests[RQ.id];
		if(R && R.view==0&&R.comm==0&&R.list==0) return;
		// �d�����N�G�X�g�̏ꍇ�̓X�L�b�v
		if(this.Indexes[RQ.id]==undefined){
			// RequestQueues����Ƃ���Requests�𓮉���̃n�b�V���Ƃ��Ĉ���
			this.RequestQueues.push(RQ);
			// ID����RequestQueues�ɃA�N�Z�X�ł���悤��Indexes�����܂���
			this.Indexes[RQ.id] = this.RequestQueues.length - 1;
			// ��������擾����^�X�N�ɓo�^
			if(!this.Requests[RQ.id]) this.doThumbInfoTask(RQ);
		}
		// �������HTML�ɒǉ�����^�X�N�ɓo�^
		this.doRequestDOMTask(RQ);
	},
	getItemHTML: function(RQ){
		var RequestID = RQ.key+"-"+("0000"+RQ.number).slice(-4);
		var ItemHTML = "<div id=\"{#ID}\"><table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\">"
		ItemHTML += "<tr><td width=\"100%\"><u ondblclick=\"RequestManager.Events['Play']('{#ID}')\" onclick=\"__RequestManager__showPopup(event.clientX, event.clientY, '{#ID}')\" oncontextmenu=\"OpenVideo('{#ID}')\" title=\"�N���b�N�œ�����\��\">";
		ItemHTML += "[<span id=\"RNO{#ID}\">"+(this.Indexes[RQ.id]+1)+"/"+this.RequestQueues.length+"</span>]&nbsp;";
		ItemHTML += "<b>{#ID}</b>&nbsp;"
		ItemHTML += "<span id=\"RID{#ID}\">"+RequestID+"</span></u><br>";
		ItemHTML += "<div id=\"INF{#ID}\">";
		// �����񂪎擾�ς݂Ȃ�����o�͂���
		if(this.Requests[RQ.id]){
			ItemHTML += settings["ItemHTML"];
		}else{
			ItemHTML += "������擾��...";
		}
		ItemHTML += "</div></td><td align=\"right\">";
		ItemHTML += "<input type=\"button\" onclick=\"RequestManager.setClipboard('ID', '{#ID}')\" value=\"��\">";
//add start
		//�߂��Ɖ����ԈႦ�₷���炵���̂�1�s�}��
		ItemHTML += "<br> ";
//add end
		ItemHTML += "<br><input type=\"button\" onclick=\"RequestManager.setClipboard('IF', '{#ID}')\" value=\"��\" title=\"�E�N���b�N�œ�����2���R�s�[\" oncontextmenu=\"RequestManager.setClipboard('IF2', '{#ID}');return false;\">";
		ItemHTML += "</td><td>";
		if(settings["UseIE"]){
			ItemHTML += "<input type=\"button\" id=\"PLY{#ID}\" onclick=\"RequestManager.Events['Play']('{#ID}')\" value=\"�Đ�\">";
		}else{
			ItemHTML += "<input type=\"button\" id=\"PLY{#ID}\" onclick=\"RequestManager.Events['Play']('{#ID}')\" value=\"����\">";
		}
//add start
		//�߂��Ɖ����ԈႦ�₷���炵���̂�1�s�}��
		ItemHTML += "<br> ";
//add end
		ItemHTML += "<br><input type=\"button\" onclick=\"RequestManager.deleteRequestQueueById('{#ID}')\" value=\"�폜\"></td>";
		ItemHTML += "</td><td>";
		ItemHTML += "<input type=\"button\" onclick=\"RequestManager.upRequest('{#ID}')\" oncontextmenu=\"RequestManager.upRequestFirst('{#ID}');return false;\" value=\"��\" title=\"�E�N���b�N�ň�ԏ�Ɉړ�\">";
//add start
		//�߂��Ɖ����ԈႦ�₷���炵���̂�1�s�}��
		ItemHTML += "<br> ";
//add end
		ItemHTML += "<br><input type=\"button\" onclick=\"RequestManager.downRequest('{#ID}')\" oncontextmenu=\"RequestManager.downRequestLast('{#ID}');return false;\" value=\"��\" title=\"�E�N���b�N�ň�ԉ��Ɉړ�\">";
		ItemHTML += "</td></tr></table><hr></div>";
		if(this.Requests[RQ.id]){
			return this._replaceHTML(ItemHTML, this.Requests[RQ.id]);
		}else{
			return ItemHTML.replace(/{#ID}/g, RQ.id);
		}
	},
	// Request���w�肷��ƑΏۂ̗v�f�𐮌`����
	replaceHTML: function(R){
		var info = document.getElementById("INF"+R.id);
		if(info){
			info.innerHTML = this._replaceHTML(settings["ItemHTML"], R);
//add start	�^�C�v����
			RequestManager.typeHTML(R.id);
//add end
		}else{
			setTimeout(function(){RequestManager.replaceHTML(R);}, 50);
		}
	},
	// �����̕������Request�̏��Œu������
	// PName��JASCode�͑O��ɕ�������܂߂邱�Ƃ��ł����肷��
	_replaceHTML: function(str, R){
		if(!R || !R instanceof Request) return str;
//add start JAS�R�[�h�Ȃ��̏ꍇ
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
//add start JAS�R�[�h�̕ҏW���\��
				.replace(/{([^}]*?)#JASCode([^{]*?)}/g, RegExp.$1+"<label ondblclick=\"RequestManager.Events['Edit'](this, 'JASCode','"+R.id+"')\">"+JASCodes[R.id]+"</label>"+RegExp.$2)
//add end
				.replace(/{#Tags}/g, "<div title=\""+R.tags+"\">[tag]</div>")
//add start �^�C�v�\���ӏ���ǉ�
				.replace(/{#Type}/g, "<span id=\"TYP"+R.id+"\" onclick=\"RequestManager.setAlert('"+R.id+"')\" title=\"�N���b�N�ŏڍ׏���\��\"></span>")
//add end
		;
	},
//add start
	//�^�C�v�\��
	typeHTML: function(id){
		var R = this.Requests[id];
		var objIndex = "TYP"+id;
		if(document.getElementById(objIndex)){
			if(R.type=="plural"){
//				document.getElementById(objIndex).innerHTML += "�����Y��";
				document.getElementById(objIndex).style.backgroundColor="yellow";
				document.getElementById(objIndex).style.color="#000000";
			} else if(R.type==""){
//				document.getElementById(objIndex).innerHTML += "�Y������";
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
	// ������̎擾�^�X�N
	doThumbInfoTask: function(RQ, method){
		if(!method) method = "push";
		this.ThumbInfoTasks[method](RQ);
		// ��������擾����^�X�N�������ĂȂ�������N��
		if(!this.ThumbInfoTimer) this.ThumbInfoTimer = setInterval(this._doThumbInfoTask, settings["ThumbInfoTaskWait"]);
	},
	// setInterval�ŋN�����Ă���̂�this���g���Ȃ�
	_doThumbInfoTask: function(){
		if(RequestManager.ThumbInfoTasks.length==0){
			clearInterval(RequestManager.ThumbInfoTimer);
			RequestManager.ThumbInfoTimer = 0;
			RequestManager.resetCumulativeTime();
		}else{
			// �L���[�����o���ē�������擾����
			var RQ = RequestManager.ThumbInfoTasks.shift();
			NicoLive.getThumbInfo(RQ.id, function (R){
				if(!R){
					// �^�C���A�E�g�����ꍇ�̓^�X�N�ɗD��I�ɒǉ�
					RequestManager.doThumbInfoTask(RQ, "unshift");
				}else{
					// �~�N�m�|�b�v�Đ��񐔂̎擾�����݂�
					R.count = getMikunopopCount( R.id );
					// ��������i�[����HTML�𐮌`
					RequestManager.Requests[RQ.id] = R;
					RequestManager.replaceHTML(R);
					RequestManager.setCumulativeTime(RQ.id);
					// �����ȃ��N�G�X�g�������ꍇ�͍폜
					if(R.view==0&&R.comm==0&&R.list==0) RequestManager.deleteRequestQueueById(RQ.id);
				}
			});
		}
	},
	// ������̒ǉ��^�X�N
	doRequestDOMTask: function(RQ){
		this.RequestDOMTasks.push(RQ);
		// �������HTML�ɒǉ�����^�X�N�������ĂȂ�������N��
		if(!this.RequestDOMTimer) this.RequestDOMTimer = setInterval(this._doRequestDOMTask, 1);
	},
	// setInterval�ŋN�����Ă���̂�this���g���Ȃ�
	_doRequestDOMTask: function(){
		if(RequestManager.RequestDOMTasks.length==0){
			clearInterval(RequestManager.RequestDOMTimer);
			RequestManager.RequestDOMTimer = 0;
			//RequestManager.resetCumulativeTime();
		}else{
			// �L���[�����o���ē������HTML�ɒǉ�����
			var RQ = RequestManager.RequestDOMTasks.shift();
			// ���N�G�X�g���d�������ꍇ
			if(document.getElementById(RQ.id)){
				var RequestID = RQ.key+"-"+("0000"+RQ.number).slice(-4);
				document.getElementById("RID"+RQ.id).innerText += ", " + RequestID;
			}else{
				document.getElementById("RequestHTML").insertAdjacentHTML("BeforeEnd", RequestManager.getItemHTML(RQ));
//add start	�^�C�v����
				RequestManager.typeHTML(RQ.id);
//add end
				RequestManager.setCumulativeTime(RQ.id);
			}
		}
	},
	// �ݐώ��Ԃ̐ݒ�
	setCumulativeTime: function(id){
		var CT = document.getElementById("CT"+id);
		if(CT) CT.innerText = this.getCumulativeTime(id);
		// ���łɃ��N�G�X�g�i���o�[���X�V�����Ⴄ
		var RNO = document.getElementById("RNO"+id);
		if(RNO) RNO.innerText = (this.Indexes[id]+1)+"/"+this.RequestQueues.length;
	},
	// �ݐώ��Ԃ̍Đݒ�
	resetCumulativeTime: function(){
		for(var i=0,l=this.RequestQueues.length; i<l; i++){
			this.setCumulativeTime(this.RequestQueues[i].id);
		}
	},
	// �ݐώ��Ԃ̎擾
	getCumulativeTime: function(id){
		var CTime = 0;
		for(var i=0,l=this.RequestQueues.length; i<l; i++){
			var RQ_id = this.RequestQueues[i].id
			var R = this.Requests[RQ_id];
			if(!R) return "??:??";// ��O�̓���̏�񂪂܂����ĂȂ������炠����߂�
			CTime += R.getLengthNumber();
			if(RQ_id==id) break;
		}
		var mm = parseInt(CTime/60);
		var ss = CTime%60;
		if(ss<10) ss = "0"+ss;
		return mm+":"+ss;
	},
	// �Đ����̉^�c�҃R�����g
	getInfoComment: function(id){
		var R = this.Requests[id];
		if(!R) return "";
//add start JAS�R�[�h�Ȃ��̏ꍇ
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
//add start JAS�R�[�h�֘A�̏C��
					.replace(/{([^}]*?)#JASCode([^{]*?)}/g, RegExp.$1+JASCodes[R.id]+RegExp.$2)
//add end
		;
	},
	// �Đ����̉^�c�҃R�����g2
	getInfoComment2: function(id){
		var R = this.Requests[id];
		if(!R) return "";
//add start JAS�R�[�h�Ȃ��̏ꍇ
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
//add start JAS�R�[�h�֘A�̏C��
					.replace(/{([^}]*?)#JASCode([^{]*?)}/g, RegExp.$1+JASCodes[R.id]+RegExp.$2)
//add end
		;
	},	// �Đ�����p�̃e�L�X�g
	getPlayLog: function(id){
		var R = this.Requests[id];
		if(!R) return "";
//add start JAS�R�[�h�Ȃ��̏ꍇ
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
//add start JAS�R�[�h�֘A�̏C��
					.replace(/{([^}]*?)#JASCode([^{]*?)}/g, RegExp.$1+JASCodes[R.id]+RegExp.$2)
//add end
		;
	},
//add start�@�e�퓮������擾�ۑ����A�^�C�v����Ɏg�p
	// �A���[�g�\��
	setAlert: function(id){
		var R = this.Requests[id];
		if(!R) return;
		if (!(settings["typeTITLE"] || settings["typeDESCRIPTION"] || settings["typeTAG"])) return;
		var ItemHTML = "";
		if (settings["typeTITLE"]) {
			ItemHTML += "<b>����^�C�g��</b><br>"+this.replaceSettings(R.oTitle)+"<br><hr>";
		}
		if (settings["typeDESCRIPTION"]) {
			ItemHTML += "<b>����R�����g</b><br>"+this.replaceSettings(R.description).replace(/&lt;/g,"<").replace(/&gt;/g,">")+"<br><hr>";
		}
		if (settings["typeTAG"]) {
			ItemHTML += "<b>����^�O�ꗗ</b><br>"+this.replaceSettings(R.tags.join("<br>"))+"<br>";
		}
		ItemHTML += "</table>";
		var windowopen=window.showModalDialog("./System/Alert.hta",ItemHTML,"status:no;help:no;resizable:yes;");
	},
	// �����̕������Settings�̏��Œu������
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
	// ID�w��ɂ��폜
	deleteRequestQueueById: function(id){
		document.getElementById("RequestHTML").removeChild(document.getElementById(id));
		var deleteIndex = this.Indexes[id];
		// �C���f�b�N�X�̍폜
		delete this.Indexes[id];
		// �C���f�b�N�X�̍X�V
		for(var i=deleteIndex+1,l=this.RequestQueues.length; i<l; i++){
			this.Indexes[this.RequestQueues[i].id]--;
		}
		// ���N�G�X�g�̍폜
		this.RequestQueues.splice(deleteIndex, 1);
		// ������̓L���b�V���Ƃ��Ďc���Ă����̂ŃR�����g�A�E�g
		// delete this.Requests[id];
		this.resetCumulativeTime();
	},
	// Index�w��ɂ��폜
	deleteRequestQueueByIndex: function(index){
		this.deleteRequestQueueById(this.RequestQueues[index].id);
	},
	// �v�f�̓���ւ�
	swapRequest: function(a, b){
		// ���݂̃C���f�b�N�X���擾
		var indexA = this.Indexes[a];
		var indexB = this.Indexes[b];
		// �C���f�b�N�X�����ւ���
		var tempIndex = this.Indexes[a];
		this.Indexes[a] = this.Indexes[b];
		this.Indexes[b] = tempIndex;
		// ���N�G�X�g�����ւ���
		var tempRequest  = this.RequestQueues[indexA];
		this.RequestQueues[indexA] = this.RequestQueues[indexB];
		this.RequestQueues[indexB] = tempRequest;
		// �v�f�����ւ���
		var elementA = document.getElementById(a);
		var elementB = document.getElementById(b);
		var swapElementA = elementA.cloneNode(true);
		var swapElementB = elementB.cloneNode(true);
		elementA.parentNode.replaceChild(swapElementB, elementA);
		elementB.parentNode.replaceChild(swapElementA, elementB);
		this.setCumulativeTime(a);
		this.setCumulativeTime(b);
	},
	// ��ֈړ�
	upRequest: function(id){
		var elementA = document.getElementById(id);
		var elementB = elementA.previousSibling;
		if(elementB) this.swapRequest(elementA.id, elementB.id);
	},
	// ���ֈړ�
	downRequest: function(id){
		var elementA = document.getElementById(id);
		var elementB = elementA.nextSibling;
		// ���ֈړ��͎��̗v�f����ֈړ��ƒu����������
		if(elementB) this.upRequest(elementB.id);
	},
	// ��ԏ�ֈړ�
	upRequestFirst: function(id){
		var elementA = document.getElementById(id);
		for(var i=0, l=this.Indexes[elementA.id]; i<l; i++){
			this.swapRequest(elementA.id, this.RequestQueues[l-i-1].id);
		}
	},
	// ��ԉ��ֈړ�
	downRequestLast: function(id){
		var elementA = document.getElementById(id);
		for(var i=this.Indexes[elementA.id], l=this.RequestQueues.length; i<l; i++){
			this.swapRequest(elementA.id, this.RequestQueues[i].id);
		}
	},
	// �N���b�v�{�[�h�ɃR�s�[
	setClipboard: function(type, id){
		if(id==""||type=="") return;
		var str = "";
		switch(type){
			case "ID":
				// GUI�̐ݒ�����ɍs���Ă�͔̂������Ȃ��c
				str = (document.getElementById("playSound").checked?"/playsound ":"/play ")+id+(document.getElementById("playSub").checked?" sub":"");
			break;
			case "IF":
				str = this.getInfoComment(id);
			break;
			case "IF2"://InfoComment2����擾
				str = this.getInfoComment2(id);
			break;
			default:
		}
		document.parentWindow.clipboardData.setData("Text", str);
	},
	// �\�[�g
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
				alert("������擾���̓\�[�g�ł��܂���");
				return;
			}
			this.RequestQueues.sort(function(a, b){
				var RA = RequestManager.Requests[a.id];
				var RB = RequestManager.Requests[b.id];
				return updown*(RB[mode]-RA[mode]);
			});
		}
		// �C���f�b�N�X�EHTML�̍č\�z
		document.getElementById("RequestHTML").innerHTML = "";
		for(var i=0,l=this.RequestQueues.length; i<l; i++){
			this.Indexes[this.RequestQueues[i].id] = i;
			this.doRequestDOMTask(this.RequestQueues[i]);
//add start	�^�C�v����
			this.typeHTML(this.RequestQueues[i].id);
//add end
		}
	}
}

var RequestManager = new RequestManager();


// ���|�b�v�A�b�v
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
