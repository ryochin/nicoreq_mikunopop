// �C���|�[�g�ԍ�
var ImportNumber = 0;

// ���b�Z�[�W�T�[�o�[�ɐڑ�����_�C�A���O
function connectDialog(){
	if(SocketManager.connected) return;
	var _PS = window.showModalDialog("./System/Connect.hta","","status:no;help:no;resizable:yes");
	connect(_PS);
}

// ���b�Z�[�W�T�[�o�[����ؒf
function disconnect(){
	SocketManager.disconnect();
	if(timeLeftTimer!=0){
		clearInterval(timeLeftTimer);
		timeLeftTimer = 0;
	}
	if(document.getElementById("loginCheck").checked) checkloginCheck();
}

// �e�L�X�g���̓���ID����荞��
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

// �}�C���X�g�̓���ID����荞��
function importMylist(){
	var url = prompt("�j�R�j�R����̌��J�}�C���X�g���w�肵�Ă�������","http://www.nicovideo.jp/mylist/");
	if(!url || url=="") return;
	url = "http://www.nicovideo.jp/mylist/" + url.match(/\d+/) + "?rss=2.0";
	NicoLive.getXML(url, function(xmldom){
		if(!xmldom) return;
		// ����͂Ђǂ��u���R�[�h�I
		var title = xmldom.getElementsByTagName("title")[0].text.replace("�}�C���X�g ","").replace("�]�j�R�j�R����(����)","");
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

// �������o��
function exportIDs(logName){
	var text = window.showModalDialog("./System/Export.hta",window[logName],"status:no;help:no;resizable:yes;");
	if(text) window[logName] = text;
}