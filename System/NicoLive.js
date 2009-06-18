function NicoLive(){
	this.initialize.apply(this, arguments);
}

NicoLive.prototype = {
	initialize: function(){
	},
	login: function(mail, password){
		try{
			var xmlhttp = createXMLHttpRequest();
			xmlhttp.Open("POST", "https://secure.nicovideo.jp/secure/login?site=niconico", false);
			xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xmlhttp.Send("mail="+mail+"&password="+password);
		}catch(e){
		}
	},
	getXML: function(url, callback){
		var xmlhttp = createXMLHttpRequest();
		xmlhttp.onreadystatechange = function(){
			if(xmlhttp.readyState==4){
				clearTimeout(timer);
				callback(xmlhttp.responseXML);
			}
		}
		var timer = setTimeout(function(){
			callback();
			xmlhttp.abort();
		}, 5000);
		xmlhttp.open("GET", url, true);
		xmlhttp.send();
	},
	getPlayerStatus: function(lv, callback, errorAlert){
		if(settings["UseIE"]){
			this.getXML("http://watch.live.nicovideo.jp/api/getplayerstatus?v=lv" + lv, function(xmldom){
				if(xmldom){
					if(xmldom.getElementsByTagName("error").length > 0){
						var ErrMSG = {
							"closed": "���̃j�R���͏I�����܂����B",
							"notlogin": "���O�C�����Ă��܂���B\nIE�Ńj�R�j�R����Ƀ��O�C�����Ă��������B",
							"notfound": "�ԑg��񂪎擾�ł��܂���B\n�j�R��ID���m�F���Ă��������B",
							"unknown_error": "�j�R��ID������������܂���B\n�j�R��ID���m�F���Ă��������B",
							"unknown": "�A�N�Z�X���W�����Ă��܂��B\n���Ԃ������Ă�����x�ڑ������݂Ă��������B",
							"maintenance": "�����e�i���X���ł��B\n�j�R�j�R����̃A�i�E���X���m�F���Ă��������B"
						};
						if(!errorAlert) alert(ErrMSG[xmldom.getElementsByTagName("code")[0].text]);
						callback();
					}else{
						callback(new PlayerStatus(lv, xmldom));
					}
				}else{
					callback();
				}
			});
		}else{
			try{
				var WshShell = new ActiveXObject("WScript.Shell");
				WshShell.run("http://watch.live.nicovideo.jp/api/getplayerstatus/lv" + lv);
			}catch(e){
				window.open("http://watch.live.nicovideo.jp/api/getplayerstatus/lv" + lv);
				//alert("NicoLive.js:WshShell�̐����Ɏ��s���܂���")
			}
		}
	},
	getThumbInfo: function(id, callback){
		this.getXML("http://ext.nicovideo.jp/api/getthumbinfo/" + id, function(xmldom){
			if(xmldom){
				callback(new Request(id, xmldom));
			}else{
				callback();
			}
		});
	},
	postComment: function(body, mail){
		if(!SocketManager.connected) return;
		var lv = SocketManager.playerStatus.lv;
		if(!lv || body=="") return;
		if(!mail) mail = "";
		var xmlhttp = createXMLHttpRequest();
		xmlhttp.Open("GET", "http://watch.live.nicovideo.jp/api/broadcast/lv"+lv+"?body="+encodeURIComponent(body)+"&mail="+encodeURIComponent(mail), true);
		xmlhttp.send();
	}
}

var NicoLive = new NicoLive();