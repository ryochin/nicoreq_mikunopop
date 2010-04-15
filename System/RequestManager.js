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
	this.status            = {};    // request status container { id => { requester: 'listener', number: 31 }, ...
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
			var afterValue  = prompt("������"+type+"��ҏW���Ă�������\n[ctrl]+[Z]�ň�O�̏�Ԃɖ߂�A[�L�����Z��]���󔒂ɂ���[OK]�Ŗ��C���̂܂܏I��", beforeValue);
			if(afterValue && afterValue!=beforeValue){
				RequestManager.Requests[id][type] = afterValue;
				element.innerHTML  = afterValue;
			}
		}
	},
	addRequestQueue: function(RQ){
		if(!(RQ instanceof RequestQueue) || arguments.length==3){
			RQ = new RequestQueue(arguments[0], arguments[1], arguments[2], 'listener');
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

		// [1/1] nm7804321 L-0001
		ItemHTML += "<tr><td colspan=2>";
		ItemHTML += "[ <span id=\"RNO{#ID}\" title=\"���N���b�N�œ�����P���R�s�[\n�E�N���b�N�œ�����Q���R�s�[\" onclick=\"RequestManager.setClipboard('IF', '{#ID}')\" oncontextmenu=\"RequestManager.setClipboard('IF2', '{#ID}');return false;\">"+(this.Indexes[RQ.id]+1)+"/"+this.RequestQueues.length+"</span>]&nbsp;";
		ItemHTML += "<u class=\"vid\" ondblclick=\"RequestManager.Events['Play']('{#ID}')\" onclick=\"showVideoInfo('{#ID}')\" oncontextmenu=\"OpenVideo('{#ID}')\" title=\"�N���b�N�œ�����\��\"><b>{#ID}</b>&nbsp;";
		ItemHTML += "<span id=\"RID{#ID}\">"+RequestID+"</span></u></td>";

		// ���X�i�[����̃��N�G�X�g�Ȃ�A�C�R���\��
		ItemHTML += '<td align="right" valign="top">';
		var reqtypeDisplay = 'none';
		if( RQ.requester == "listener" ){
			reqtypeDisplay = 'inline';
		}
		ItemHTML += '<img id="req-by-listener-{#ID}" src="./System/assets/request.png" class="requester-icon" title="' + this.getRequestStatusStr( RQ.number ) + '" align="top" style="display: ' + reqtypeDisplay  + '"';
		ItemHTML += ' oncontextmenu="RequestManager.changeRequestStatusToAdminSelect(\'{#ID}\');" />';    // �E�N���b�N�ŃA�C�R����������悤��
		ItemHTML += '</td>';

		// title
		ItemHTML += "<tr><td colspan=3 class=\"title-container\">&nbsp;";
		ItemHTML += "<span id=\"TITLE{#ID}\" class=\"title\"></span></td>";    // ���ƂŃZ�b�g���邽�߂̃R���e�i

		ItemHTML += "<tr><td width=\"100%\">";
		ItemHTML += "<div id=\"INF{#ID}\">";
		// �����񂪎擾�ς݂Ȃ�����o�͂���
		if(this.Requests[RQ.id]){
			ItemHTML += settings["ItemHTML"];
		}else{
			ItemHTML += "������擾��...";
		}
		ItemHTML += "</div></td><td align=\"right\">";
		var buttonName = settings["UseIE"]
			? '�Đ�'
			: '����';
		ItemHTML += "<input type=\"image\" src=\"./System/assets/play.png\" id=\"PLY{#ID}\" class=\"control-button-up\" onclick=\"RequestManager.Events['Play']('{#ID}')\" value=\"" + buttonName + "\">";
		ItemHTML += "<br><input type=\"image\" src=\"./System/assets/remove.png\" class=\"control-button-down\" onclick=\"RequestManager.deleteRequestQueueById('{#ID}')\" value=\"�폜\"></td>";
		ItemHTML += "</td><td>";
		ItemHTML += "<input type=\"image\" src=\"./System/assets/up.png\" class=\"control-button-up\" onclick=\"RequestManager.upRequest('{#ID}')\" oncontextmenu=\"RequestManager.upRequestFirst('{#ID}');return false;\" value=\"��\" title=\"�E�N���b�N�ň�ԏ�Ɉړ�\">";
		ItemHTML += "<br><input type=\"image\" src=\"./System/assets/down.png\" class=\"control-button-down\" onclick=\"RequestManager.downRequest('{#ID}')\" oncontextmenu=\"RequestManager.downRequestLast('{#ID}');return false;\" value=\"��\" title=\"�E�N���b�N�ň�ԉ��Ɉړ�\">";
		ItemHTML += "</td></tr></table>";
		ItemHTML += "<div id=\"info-{#ID}\" style=\"display: none\"></div>";
		ItemHTML += "<input type=hidden id=\"info-status-{#ID}\" value=0 />";
		ItemHTML += "<input type=hidden id=\"info-flag-{#ID}\" value=0 />";
		ItemHTML += "<hr></div>";
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
			RequestManager.typeHTML(R.id);
		}else{
			setTimeout(function(){RequestManager.replaceHTML(R);}, 50);
		}
	},
	// �����̕������Request�̏��Œu������
	// PName��JASCode�͑O��ɕ�������܂߂邱�Ƃ��ł����肷��
	_replaceHTML: function(str, R){
		if(!R || !R instanceof Request) return str;
		// sm|nm ������������ԍ��𓾂�
		var idno = R.id.replace(/^(sm|nm)/, "");

		// �T���l�C���摜�̎�ނ𕪂���
		var thumb_url;
		var thumb_title = "���N���b�N�œ�����u���E�U�ŊJ��\n�E�N���b�N�œ���ԍ����R�s�[";
		var oncontextmenu = "RequestManager.setClipboard('IDONLY','" + R.id + "')";
		if( R.no_live_play == 1 ){
			// ������
			var thumb_dummy_path = location.href.toString().replace(/NicoRequest\.hta$/,"")
				+ settings["ThumbnailNoLiveImagePath"];
			thumb_url = "<img src=\"" + thumb_dummy_path + "\" width=65 height=50 align=left title=\"" + thumb_title + "\" oncontextmenu=\"" + oncontextmenu + "\" />";
		}
		else if( settings["ShowThumbnailType"] == 1 ){
			// dummy
			var thumb_dummy_path = location.href.toString().replace(/NicoRequest\.hta$/,"")
				+ settings["ThumbnailDummyImagePath"];
			thumb_url = "<img src=\"" + thumb_dummy_path + "\" width=65 height=50 align=left title=\"" + thumb_title + "\" oncontextmenu=\"" + oncontextmenu + "\" />";
		}
		else if( settings["ShowThumbnailType"] == 2 ){
			// thumbnail
			var thumb_url = "<img src=\"http://tn-skr" + getNaturalRandomInt(4) + ".smilevideo.jp/smile?i="
				+ idno + "\" width=65 height=50 title=\"" + thumb_title + "\" align=left class=\"thumb\""
				+ " onclick=\"OpenVideo('" + R.id + "')\""
				+ " oncontextmenu=\"" + oncontextmenu + "\" />";
		}

		// title �������ɏ���������
		rewriteTitle(R);

		return str
				.replace(/{#ID}/g,    R.id)
				.replace(/{#IDNO}/g,    idno)
				.replace(/{#ThumbURL}/g,    thumb_url)
				.replace(/{#Title}/g, "<label ondblclick=\"RequestManager.Events['Edit'](this, 'title','"+R.id+"')\">"+R.title+"</label>")
				.replace(/{([^}]*?)#PName([^{]*?)}/g, function(match,$1,$2){return $1+"<label ondblclick=\"RequestManager.Events['Edit'](this, 'name','"+R.id+"')\">"+R.name+"</label>"+$2;})
				.replace(/{#View}/g,  comma(R.view))
				.replace(/{#Comm}/g,  comma(R.comm))
				.replace(/{#List}/g,  comma(R.list))
				.replace(/{#Count}/g,  comma(R.count))
				.replace(/{#Myri}/g,  R.myri)
				.replace(/{#Time}/g,  R.length)
				.replace(/{#CTime}/g, "<label id=\"CT"+R.id+"\">"+this.getCumulativeTime(R.id)+"</label>")
				.replace(/{#Date}/g,  R.getDateString(settings["ItemHTMLDate"]))
				.replace(/{#Tags}/g, "<div title=\""+R.tags+"\">[tag]</div>")
				.replace(/{#Genre}/g, R.genre.join(" "))
				.replace(/{#Type}/g, "<span id=\"TYP"+R.id+"\" onclick=\"RequestManager.setAlert('"+R.id+"')\" title=\"�N���b�N�ŏڍ׏���\��\"></span>")
		;
	},

	//�^�C�v�\��
	typeHTML: function(id){
		var R = this.Requests[id];
		var objIndex = "TYP"+id;
		if(document.getElementById(objIndex)){
			if(R.type=="plural"){
				document.getElementById(objIndex).style.backgroundColor="yellow";
				document.getElementById(objIndex).style.color="#000000";
			} else if(R.type==""){
				document.getElementById(objIndex).style.backgroundColor="gray";
				document.getElementById(objIndex).style.color="#ffffff";
			} else {
				document.getElementById(objIndex).innerHTML += settings[R.type+"Text"];
				document.getElementById(objIndex).style.backgroundColor=settings[R.type+"backgroundColor"];
				document.getElementById(objIndex).style.color=settings[R.type+"color"];
			}
		}
	},

	// ������̎擾�^�X�N
	doThumbInfoTask: function(RQ, method){
		if(!method) method = "push";
		this.ThumbInfoTasks[method](RQ);
		// ��������擾����^�X�N�������ĂȂ�������N��
		var wait = settings["UseVideoInfoCache"]
			? settings["ThumbInfoTaskWaitCached"]
			: settings["ThumbInfoTaskWait"];
		if(!this.ThumbInfoTimer) this.ThumbInfoTimer = setInterval(this._doThumbInfoTask, wait);
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
			NicoLive.getThumbInfo(RQ.id, ( RQ.requester == 'listener' ? RQ.number : "" ), function (R){
				if(!R){
					// �^�C���A�E�g�����ꍇ�̓^�X�N�ɗD��I�ɒǉ�
					RequestManager.doThumbInfoTask(RQ, "unshift");
				}else{
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
				
				// ���łɃX�g�b�N�ɂ���|�̃��b�Z�[�W��\��
				if( settings["showStockDuplicatedAlert"] == true ){

					// 
					if( RQ.requester == 'listener' ){
						// ���X�i�[����̃��N�G�X�g
						var msg = [];
						msg.push("�I�@���łɃX�g�b�N�ɂ���Ȃ����N�G�X�g����܂����@�I");
						msg.push("");
						msg.push( "�@" + RQ.id + ": " + $('#TITLE' + RQ.id).text() );
						msg.push("");
						
						var imageID = "#req-by-listener-" + RQ.id;
						
						// ���X�i�[����̃��N�G�X�g�ɂ��邩��Z���̂܂܂ɂ��邩�I��ł��炤
						if( $(imageID).css('display') == "none" ){
							// ���A��Z���̏ꍇ
							msg.push("���X�i�[����̃��N�G�X�g�Ƃ��Ĉ����܂����H");
							msg.push("");
							msg.push("�@�@�� �͂��@�F�@" + RQ.number + "����̃��N�G�X�g�ɂȂ�܂�");
							msg.push("�@�@�� �������F�@��Z���̂܂܂ɂȂ�܂�");
						}
						else{
							// ���A���łɃ��N�G�X�g�̏ꍇ
							msg.push("���łɕʂ̌Â����X�i�[����̃��N�G�X�g�ƂȂ��Ă��܂����A");
							msg.push("�V�������X�i�[����̃��N�G�X�g�Ƃ��ď㏑�����܂����H");
						}
						
						if( window.confirm( msg.join("\n") ) ){
							// �i�V�����j���X�i�[����̃��N�G�X�g�ɐ؂�ւ���
							var origRQ = RequestManager.Requests[RQ.id];
							origRQ.requester = 'listener';
							origRQ.requesterstr = settings["RequesterListenerStr"].replace(/{#ReqCommentNum}/g, RQ.number);
							
							// �\�[�g���ɕ��A���邽�߂� status ���Z�b�g
							RequestManager.setRequestStatus(RQ);
								
							// ���N�G�X�g�A�C�R�����Z�b�g
							RequestManager.writebackRequestStatus(RQ);
						}
						else{
							// ��Z���A���邢�͌Â����X�i�[����̃��N�G�X�g�̂܂܁i�������Ȃ��j
						}
					}
					else{
						// �傪�����ŃX�g�b�N�ɒǉ�����ꍇ�Ȃ�
						var msg = [];
						msg.push("�I�@���łɃX�g�b�N�ɂ���Ȃ��w�肳��܂����@�I");
						msg.push("");
						msg.push( "�@" + RQ.id + ": " + $('#TITLE' + RQ.id).text() );
						window.alert( msg.join("\n") );
					}
				}
			}else{
				// 	���X�g�ɒǉ�����ʒu�����߂�
				var pos = 'BeforeEnd';
				if( RQ.requester == 'admin' && settings["RequestListOrderAdmin"] == 'top' ){
					pos = 'AfterBegin';
				}
				if( RQ.requester == 'stock' && settings["RequestListOrderStock"] == 'top' ){
					pos = 'AfterBegin';
				}
				if( RQ.requester == 'listener' && settings["RequestListOrderListener"] == 'top' ){
					pos = 'AfterBegin';
				}
				// 	�ǉ�
				document.getElementById("RequestHTML").insertAdjacentHTML(pos, RequestManager.getItemHTML(RQ));
				
				// -> sort ��
				if( RequestManager.Requests[RQ.id] != null ){
					// title �������ɏ���������
					rewriteTitle( RequestManager.Requests[RQ.id] );
					
					// ���N�G�X�g�A�C�R�����Z�b�g
					if( RequestManager.status[RQ.id] ){
						RequestManager.writebackRequestStatus(RQ, RequestManager.status[RQ.id]);
					}
				}
				
				RequestManager.typeHTML(RQ.id);
				RequestManager.setCumulativeTime(RQ.id);
			}
		}
	},
	// ���N�G�X�g�̏�Ԃ��L���b�V������i�\�[�g��ɏ����߂����߁j
	setRequestStatus: function (RQ) {
		if( ! RQ ) return;
		
		if( RequestManager.status[RQ.id] == null )
			RequestManager.status[RQ.id] = {};
							
		RequestManager.status[RQ.id].requester = 'listener';
		RequestManager.status[RQ.id].number    =  RQ.number;
	},
	// ���N�G�X�g�̏�Ԃ������߂��i�A�C�R���{�R�����g�ԍ��j
	writebackRequestStatus: function (RQ, status) {
		if( ! RQ ) return;
		
		var imageID = "#req-by-listener-" + RQ.id;
		$(imageID).show();
		$(imageID).attr( { title: this.getRequestStatusStr( status ? status.number : RQ.number ) } );
	},
	// 
	changeRequestStatusToAdminSelect: function(id) {
		// requester ��߂�
		var RQ = RequestManager.Requests[id];
		RQ.requester = 'admin';
		RQ.requesterstr = settings["RequesterAdminStr"];
		
		// �A�C�R�����I�t�ɂ���
		var imageID = "#req-by-listener-" + id;
		$(imageID).hide();
	},
	// >>31 ����̃��N�G�X�g�@�̕�����𐶐�����
	getRequestStatusStr: function (number) {
		return ">>" + number + " ����̃��N�G�X�g (�E�N���b�N�Ŏ�Z���ɖ߂�)";
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
	// ���e�L�X�g�u������
	replaceInfoStr: function(str, id, R){
		return str
					.replace(/{#ID}/g, id)
					.replace(/{#Title}/g, R.title)
					.replace(/{#PName}/g, R.name)
					.replace(/{#View}/g,  comma(R.view))
					.replace(/{#Comm}/g,  comma(R.comm))
					.replace(/{#List}/g,  comma(R.list))
					.replace(/{#Count}/g,  comma(R.count))
					.replace(/{#Myri}/g,  R.myri)
					.replace(/{#ReqInfo}/g,  R.requesterstr)
					.replace(/{#Time}/g,  R.length)
					.replace(/{#Date}/g,  R.getDateString(settings["InfoCommentDate"]))
		;
	},
	// �Đ����̉^�c�҃R�����g
	getInfoComment: function(id){
		var R = this.Requests[id];
		if(!R) return "";
		return this.replaceInfoStr( settings["InfoComment"], id, R );
	},
	// �Đ����̉^�c�҃R�����g2
	getInfoComment2: function(id){
		var R = this.Requests[id];
		if(!R) return "";
		return this.replaceInfoStr( settings["InfoComment2"], id, R );
	},
	// �i���I�ɏo���^�c�҃R�����g
	getPermComment: function(id){
		var R = this.Requests[id];
		if(!R) return "";
		return this.replaceInfoStr( settings["PermComment"], id, R );
	},
	getPlayLog: function(id){
		var R = this.Requests[id];
		if(!R) return "";
		return this.replaceInfoStr( settings["PlayLog"], id, R );
	},

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
			ItemHTML += "<b>����R�����g</b><br>"+this.replaceSettings(R.description).replace(/&lt;/g,"��").replace(/&gt;/g,"��")+"<br><hr>";
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
			case "IDONLY":
				// GUI�̐ݒ�����ɍs���Ă�͔̂������Ȃ��c
				str = id;
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
		}else if(mode=="length"){
			this.RequestQueues.sort(function(a, b){
				var LENA = length_str2sec( RequestManager.Requests[a.id].length );
				var LENB = length_str2sec( RequestManager.Requests[b.id].length );
				return updown*(LENB-LENA);
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
			this.typeHTML(this.RequestQueues[i].id);
		}
	}
}

var RequestManager = new RequestManager();

function OpenURL(url){
	var WshShell = new ActiveXObject("WScript.Shell");
	WshShell.run("rundll32.exe url.dll,FileProtocolHandler " + url, 4, false);
}
function OpenVideo(id){
	var url = "http://www.nicovideo.jp/watch/" + id;
	OpenURL( url );
}
function comma ( from ){
	var to = String( from );
	var tmp = "";
	while (to != (tmp = to.replace(/^([+-]?\d+)(\d\d\d)/,"$1,$2"))){
		to = tmp;
	}
	return to;
}

// ���\��
function showVideoInfo (id) { 
	var ic = '#info-' + id;

	// ��Ԃ�����
	var status_id = '#info-status-' + id;
	if( $(status_id).val() == 1 ){
		// �J���Ă���̂ŕ���
		_closeInfo(id);
		
		$(status_id).val(0);
	}
	else{
		// ���g���p�ӂ���ĂȂ�������p�ӂ���
		var flag_id = '#info-flag-' + id;
		if( $(flag_id).val() != 1 ){
			_createInfo(id);
			$(flag_id).val(1);
		}
		
		// �J��
		$(ic).slideDown();
		
		$(status_id).val(1);
	}
}

function _createInfo (id) {
	var ic = '#info-' + id;

	// �摜
	$("<img />")
		.appendTo(ic)
		.attr( { src: "http://niconail.info/" + id } )
		.attr( { alt: id } );

	// ���鏀��
	$(ic).click( function () {
		_closeInfo(id);
	} );
}

function _closeInfo (id) {
	var ic = '#info-' + id;

	$(ic).slideUp();
//	$(ic).css( { display: 'none' } );
}

function rewriteTitle (R) {
	$('#TITLE' + R.id).html( R.title );    // dirty hack :(
	$('#TITLE' + R.id).attr( { title: R.tags.join("�@") } );    // �^�O
}

function length_str2sec (str) {
	var min = str.replace(/\:[0-9]+$/,"");
	if( min == "" )
		min = 0;
	var sec = str.replace(/^[0-9]+\:/,"");
	if( sec == "" )
		sec = 0;
	
	return ( min * 60 ) + sec;
}
