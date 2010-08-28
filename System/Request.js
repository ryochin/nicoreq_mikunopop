function Request(){
	this.id     = "";
	this.title  = "";
	this.view   = 0;
	this.comm   = 0;
	this.list   = 0;
	this.length = "0:00";
	this.date   = new Date();
	this.tags   = new Array();
	this.name   = "";

	// �^�C�v����p
	this.oTitle        = "";	// ���̓���^�C�g��
	this.thumbnail_url = "";	// �T���l�C��URL
	this.description   = "";	// �������
	this.type          = "";	// �^�C�v(typeX("typeX")�^����("plural")�^�s��(""))
	this.myri          =  0;	// �}�C���X�g���i�}�C���X�g/�Đ��j
	this.count         =  0;	// �~�N�m�x
	this.requester     = "";	// ���N�G�X�g��
	this.requesterstr  = "";	// ���N�G�X�g�����`�㕶����

	this.initialize.apply(this, arguments);
}
Request.prototype = {
	initialize: function(id, reqCommentNum, xmldom){
		this.id     = id;
		if(!xmldom || xmldom.getElementsByTagName("error").length > 0){
			this.title = xmldom.getElementsByTagName("code")[0].text;
			return this;
		}
		this.title  = this.getTitle(xmldom.getElementsByTagName("title")[0].text);
		this.view   = Number(xmldom.getElementsByTagName("view_counter")[0].text);
		this.comm   = Number(xmldom.getElementsByTagName("comment_num")[0].text);
		this.list   = Number(xmldom.getElementsByTagName("mylist_counter")[0].text);
		this.myri = (100*this.list/this.view).toFixed(1);
		this.length = xmldom.getElementsByTagName("length")[0].text;
		this.date   = new Date(xmldom.getElementsByTagName("first_retrieve")[0].text.replace("-","/").replace("T"," ").replace("+09:00",""));
		this.no_live_play = Number(xmldom.getElementsByTagName("no_live_play")[0].text);
		var xmltags = xmldom.getElementsByTagName("tags")[0].getElementsByTagName("tag");
		var genreTagWhiteList = Zen2Han(settings["genreTagWhiteList"].join(","));    // cached
		this.genre = [];
		for(var i=0,l=xmltags.length; i<l; i++){
			// tags.js �ɍڂ��Ă�����̂����𒊏o������
			if( genreTagWhiteList.indexOf(","+Zen2Han(xmltags[i].text)+",") > -1 ){
				this.genre.push(xmltags[i].text);
			}
			this.tags.push(xmltags[i].text);
		}
		this.genre.sort( function(a,b){ return ( a.length > b.length ) ? 1 : -1 } );    // �Z���ق��������Ɩ{���I���낤
		this.name  = this.getPName(this.tags, this.title);
		this.count = settings["GetMikunopopCount"]
						? getMikunopopCount( id )
						: "-";
		this.requesterstr = reqCommentNum == ""
						? settings["RequesterAdminStr"]
						: settings["RequesterListenerStr"].replace(/{#ReqCommentNum}/g, reqCommentNum);
		this.oTitle  = xmldom.getElementsByTagName("title")[0].text;
		this.thumbnail_url = xmldom.getElementsByTagName("thumbnail_url")[0].text;
		this.description = xmldom.getElementsByTagName("description")[0].text;
//		this.type        = this.getType(this.oTitle, this.description, this.tags);
		this.type        = "";
	},
	getTitle: function(title){
		var T = title;
		if( settings["TitleDeleteTargets"] != null ){
			for(var i=0,l=settings["TitleDeleteTargets"].length; i<l; i++){
				T = T.replace(settings["TitleDeleteTargets"][i], "");
			}
		}
		return T;
	},
	getPName: function(tags, title){
		var P = "";
		// ���܂Ɂ`�ɒ�]�̂���`P�Ƃ����^�O���t���Ă邱�Ƃ�����
		// ���������̂͏��ԓI�Ɍ�낾�낤�Ƃ������ƂŁA��O�ɂ����҃^�O��D�悷��
		var exceptionPTagsVO = Zen2Han(settings["exceptionPTagsVO"].join(","));    // cache
		for(var i=tags.length-1; i>=0; i--){
			var Tag = tags[i];
			// �^�O���̍Ō��P��������q�b�g
			if(Tag.match(/(P|p|�o|��)$/)){
				var _P = P;
				P += Tag + " ";
				// �ł����O���X�g�ɍڂ��Ă��甒����
				if(Zen2Han(settings["NotPTagsVO"].join(",")).indexOf(","+Zen2Han(Tag)+",") > -1) P = _P;
				// �^�C�g���̒��ɏo�Ă�����Ď��͋Ȗ���������Ȃ����Ď��Ŕ�����
				// �Ȗ��̏ꍇ�͐ϋɓI�ɏ��O�o���X�g�������e���邱�Ƃɂ��悤
//				if(title.indexOf(Tag) > -1) P = _P;
			}
			// ��O�I�Ɂ`���Ɓ`��i����҃^�O�ɂȂ��Ă���ꍇ������̂Œ��ׂ�
			// �`���X�y�N�g��i���ă^�O�͏��O
			if(Tag.match(/(��|��i)$/) && !Tag.match(/���X�y�N�g��i/)) P += Tag + " ";
			// ��L�̃��[���ȊO�̍�҃^�O�͗�O���X�g�őΉ�
			if(exceptionPTagsVO.indexOf(","+Zen2Han(Tag)+",") > -1) P += Tag + " ";
		}
		if(P=="") P = settings["NoPName"];
		return P;
	},

//	getType: function(title, description, tags){
//		var T = "";
//		if (settings["typeTITLE"]) T += title+" ";
//		if (settings["typeDESCRIPTION"]) T += description+" ";
//		if (settings["typeTAG"]) T += tags+" ";
//
//		//type1�̃`�F�b�N
//		var i=0;//�P��ԍ�
//		var j=0;//�P��O���[�v�ԍ�
//		var k=0;//�����t���O
//		var l=0;//�P�ꑍ��
//		var m=0;//�Y���O���[�v�ԍ�
//		var typeSTR="";
//		while (j<settings["typeMax"] && k<2){
//			j++;
//			typeSTR="type"+j+"STR";
//			if(settings[typeSTR]){
//				l=settings[typeSTR].length;
//				while (i<l && j>m){
//					if(T.indexOf(settings[typeSTR][i]) > -1){
//						//�Y���O���[�v�ԍ��X�V
//						m=j;
//						k++;
//					}
//					i++;
//				}
//				//�P��ԍ����Z�b�g
//				i=0;
//			}
//		}
//		//�^�C�v����
//		//�����ɊY������ꍇ
//		if(k>1) return "plural";
//		//�P�ƂŊY������ꍇ
//		if(m>0) return "type"+m;
//		return "";
//	},

	getDateString: function(format){
		if(!format) format = "yy/mm/dd hh:nn:ss";
		var YYYY = this.date.getFullYear();
		var YY   = this.fillZero(YYYY<2000?YYYY-1900:YYYY-2000);
		var MM   = this.fillZero(this.date.getMonth() + 1);
		var DD   = this.fillZero(this.date.getDate());
		var DY   = ["��", "��", "��", "��", "��", "��", "�y"][this.date.getDay()];
		var HH   = this.fillZero(this.date.getHours());
		var NN   = this.fillZero(this.date.getMinutes());
		var SS   = this.fillZero(this.date.getSeconds());
		var dateStr = format.replace("yyyy", YYYY)
							.replace("yy", YY)
							.replace("mm", MM)
							.replace("dd", DD)
							.replace("dy", DY)
							.replace("hh", HH)
							.replace("nn", NN)
							.replace("ss", SS)
		;
		return dateStr;
	},
	fillZero: function(num){
		if(num<10) num = "0" + num;
		return num;
	},
	getLengthNumber: function(){
		var temp = this.length.split(":");
		var length = Number(temp[0]) * 60 + Number(temp[1]);
		if(isNaN(length)) length = 0;
		return length;
	}
};

function RequestQueue(){
	this.id  = "";
	this.key = "";
	this.number = 0;
	this.requester = "";    // listener | admin | stock
	this.initialize.apply(this, arguments);
}
RequestQueue.prototype = {
	initialize: function(id, key, number, requester){
		this.id  = id;
		this.key = key;
		this.number = number;
		this.requester = requester;
	}
}
