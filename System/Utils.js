// �E�B���h�E���T�C�Y
function setWindowSize(width, height){
	try{
		window.moveTo(screen.availWidth, screen.availHeight);
		window.resizeTo(width, height);
		var marginWidth = width - document.body.clientWidth;
		var marginHeight = height - document.body.clientHeight;
		window.resizeTo(width + marginWidth, height + marginHeight);
		var x = settings["WindowX"];
		var y = settings["WindowY"];
		if(x==-1) x = (screen.width-width-marginWidth)/2;
		if(y==-1) y = (screen.height-height-marginHeight)/2;
		window.moveTo(x, y);
	}catch(e){
		setTimeout("setWindowSize("+width+","+height+");", 100);
		return;
	}
}

// �_�C�A���O���T�C�Y
function setDialogSize(width, height){
	try{
		window.dialogWidth	= width+"px";
		window.dialogHeight = height+"px";
		
		var marginWidth = width - document.body.clientWidth;
		var marginHeight = height - document.body.clientHeight;
		
		window.dialogWidth	= (width+marginWidth)+"px";
		window.dialogHeight = (height+marginHeight)+"px";
	}catch(e){
		setTimeout("setDialogSize("+width+","+height+");", 100);
		return;
	}
}

// �\���v�f�̐؂�ւ�
function changeShowItem(Id){
	var element = document.getElementById(Id);
	if(element.style.display == "none"){
		element.style.display = "block";
	}else{
		element.style.display = "none";
	}
}

// �S�p�𔼊p��
function Zen2Han(src){
	var str = new String;
	for(var i=0,l=src.length; i<l; i++){
		var c = src.charCodeAt(i);
		if(c >= 65281 && c <= 65374 && c != 65340){
			str += String.fromCharCode(c - 65248);
		}else if(c == 8217){
			str += String.fromCharCode(39);
		}else if(c == 8221){
			str += String.fromCharCode(34);
		}else if(c == 12288){
			str += String.fromCharCode(32);
		}else if(c == 65507){
			str += String.fromCharCode(126);
		}else if(c == 65509){
			str += String.fromCharCode(92);
		}else{
			str += src.charAt(i);
		} 
	}
	str = str.toLowerCase();
	var arrZ = new Array("�P","�Q","�R","�S","�T","�U","�V","�W","�X","�O","��","��","��","�i","�j");	//�S�p�z��
	var arrH = new Array("1","2","3","4","5","6","7","8","9","0","s","n","m","(",")");					//���p�z��
	while(str.match(/([�O-�X]|��|��|��)/ig)){     	//���̓f�[�^�ɑS�p�p��������ꍇ
		for(var i=0,l=arrZ.length; i<l; i++){	//���̓f�[�^��S�p�p�����甼�p�p���ɒu������
			str = str.replace(arrZ[i], arrH[i]);
		}
	}
	return str;
}

// XMLHttpRequest�̐���
function createXMLHttpRequest(){
	var progIDs = [
		"Msxml2.XMLHTTP.6.0",
		"Msxml2.XMLHTTP.5.0",
		"Msxml2.XMLHTTP.4.0",
		"Msxml2.XMLHTTP.3.0",
		"Msxml2.XMLHTTP",
		"Microsoft.XMLHTTP"
	]; 
	for(var i=0,l=progIDs.length; i<l; i++){
		try{
			return new ActiveXObject(progIDs[i]);
		}catch(e){
			if(i==l-1){
				throw e;
			}
		}
	}
}

// �͈͂��w�肵�ă����_���ɐ����擾
function GetRandom(s, e){
	if(s>e){
		var c = s;
		s = e;
		e = c;
	}
	var t = e - s;
	return Math.floor(Math.random()*(t+1))+s;
}

// �őO�ʂɕ\��
function TopMost(){
	try{
		var Excel = new ActiveXObject("Excel.Application");
		var hwnd  = Excel.ExecuteExcel4Macro("CALL(\"user32\",\"FindWindowA\",\"JCC\",\"HTML Application Host Window Class\",\""+document.title+"\")");
		Excel.ExecuteExcel4Macro("CALL(\"user32\",\"SetWindowPos\",\"JJJJJJJJ\"," + hwnd + ",-1,0,0,0,0,3)");
	}catch(e){try{
		new ActiveXObject("WScript.Shell").run("./System/htaEx.exe /t", 1, true);
	}catch(e){
//add start
			try{
				topmost("/t");
			}catch(e){
//add end
		alert("Utils.js: TopMost"+e.description);
//add start
			}
//add end
	}}
}
//add start

//��ʂ��őO�ʂɓ\�t(���̊�[ie7+vista]���Ƃ��ꂶ��Ȃ��Ƃ���ς蓮���Ȃ��݂���)
//�Q�Ɛ�:http://code.nanigac.com/source/view/671
function topmost(arg){///t: �őO�ʕ\�� /a: �����x�� /c: �����F /t /a:80 /c:FF00FF
	dat="TVqQAAM@4E@4//8AALg@9Q@47y@4A4fug4AtAnNIbgBTM0hVGhpcyBwcm9ncmFtIGNhbm5vdCBiZSBydW4gaW4gRE9TIG1vZGUuDQ0KJ@9DP2/1qi7qTOYu6kzmLupM5SLXOOYy6kzmLupI5hLqTOax84TmJupM5rHzrOYq6kzlSaWNoi7qTOQ@20BQRQAATAEDAMM330U@10O@3wELAQg@3Q@4G@9B@5Q@4I@5B@4Q@5gAAB@10E@10B@5B@9I@3QAAB@3B@6E@3E@8B@15CQhAABQ@112I@3S@36C50ZXh0@4dgM@4Q@4B@5Q@18C@3GAucmRhdGE@3YD@4I@5Q@4I@18B@3BALmRhdGE@4E@5D@30Q@3w@608FGNBCRQ/xUYIEAAUP8VICBAAIsMJFBR6BQ@3CDxAhQ/xUAIEAAzMzMzMzMzMzMzIPsFFNVVjP2vQE@3CAy/85bCQkV4l0JBiIXCQQiXQkFIv9D46k@4jaQk@5ItEJCyLBLhmgzgvD4UfAQAAD7dIAoPBv4P5Mw+HDwE@3+2icQRQAD/JI20EUAAiWwkGOtYZoN4BDp1UY1QBugcAgAAD7bIacn/@4uB+F61H36cH6BYvawesfA9rrLWaDeAQ6dSaNUAaJbCQU6C0CAACL8A+20MHuEIHm/w@3MHiEAvyJQD/@3L8AP9O3wkKA+MZ////4hcJBAz7ej8@4hcAPhJw@3CJRCQcjUQkHFBokBJAAMdEJCj//////xUwIEAAOWwkFIt8JCB0Bb0B@4gPv/cwODzQKF7XQmauxX/xU8IEAADQAACABQauxX/xU4IEAAi0wkEFVRVlf/FUAgQACDfCQYAHQWaAN@3BqAGoAagBqAGr/V/8VKCBAAF9eXTPAW4PEFMNqAGhIIEAAaFggQABqAIhcJCD/FSwgQABfXl2DyP9bg8QUw5CVEEAAwBBAAI8QQACQEU@4MBAwMDAwMDAwMDAwMDAwMDAwIDAwMDAwMDAwMDAwMAAwEDAwMDAwMDAwMDAwMDAwMDAszMzMzMzMzMgewsAgAAU1ZXM9vHRCQMLAIAAP8VBCBAAIv4V2oC6EEBAACL8IP+/3UMX14zwFuBxCwCAADDjUQkDFBW6CkBAACFwHQsOXwkFHQijUwkDFFW6BoBAACFwHXrVv8VFCBAAF9ei8NbgcQsAgAAw4tcJCRW/xUUIEAAX16Lw1uBxCwCAADDzMzMzMzMzMzMzMzMVot0JAiNRCQIUFb/FTQgQACLRCQMiwg7TCQIdQmJcAQzwF7CCAC4AQ@3F7CCADMD7cKM8Bmhcl0KI2b@5GaD+TByEGaD+Tl3Cg+3yY0EgI1EQdAPt0oCg8ICZoXJdd7DzMzMzMzMzMzMzMzMzA+3CjPAZoXJdFmNmw@4Bmg/kwchNmg/k5dw2DwP0Pt8nB4AQDwesuZoP5QXISZoP5RncMD7fJweAEjUQIyesWZoP5YXIQZoP5ZncKD7fJweAEjUQIqQ+3SgKDwgJmhcl1rcP/JQggQAD/JQwgQAD/JRAgQ@185DOIQAA3CEAAPIh@3OIgAAICIAADIiAAC8IQ@7OQi@8kCIAAKAiAACuIgAAvCIAAE4iAABgIgAAciI@7BoAHQAYQBFAHg@9dQBzAGEAZwBlADoAIABoAHQAYQBFAHgAIAAvAHQAIAAvAGEAOgAxADAAMAAgAC8AYwA6AFIAUgBHAEcAQgBCAAoACgAgAC8AdAA6ACAAVABvAHAATQBvAHMAdABXAGkAbgBkAG8AdwAKACAALwBhADoAIABBAGwAcABoAGEAIABCAGwAZQBuAGQAIAAoADAALQAxADAAMAApAAoAIAAvAGMAOgAgAFQAcgBhAG4AcwBwAGEAcgBlAG4AdAAgAEMAbwBsAG8Acg@6dCE@13QCI@4gAACcIQ@12DYIgAAKC@3JQh@13Poi@3gI@29DOIQAA3CEAAPIh@3OIgAAICIAADIiAAC8IQ@7OQi@8kCIAAKAiAACuIgAAvCIAAE4iAABgIgAAciI@8RAUdldENvbW1hbmRMaW5lVwC5AEV4aXRQcm9jZXNzAEMBR2V0Q3VycmVudFByb2Nlc3NJZAByAENyZWF0ZVRvb2xoZWxwMzJTbmFwc2hvd@3lwJQcm9jZXNzMzJGaXJzdFcAmQJQcm9jZXNzMzJOZXh0VwAANABDbG9zZUhhbmRsZQBLRVJORUwzMi5kbGwAAIECU2V0V2luZG93TG9uZ1cAAG8BR2V0V2luZG93TG9uZ1cAAFsCU2V0TGF5ZXJlZFdpbmRvd0F0dHJpYnV0ZXMAAIMCU2V0V2luZG93UG9zAADmAU1lc3NhZ2VCb3hXAN4ARW51bVdpbmRvd3MAewFHZXRXaW5kb3dUaHJlYWRQcm9jZXNzSWQAAFVTRVIzMi5kbGw@3cAQ29tbWFuZExpbmVUb0FyZ3ZXAABTSEVMTDMyLmRsb@334A"
	var fp,xd,bs,fs=new ActiveXObject("Scripting.FileSystemObject");
	fp=fs.GetSpecialFolder(2)+"\\htaEx.exe";
	xd=new ActiveXObject("Microsoft.XMLDOM").createElement("x");
	xd.dataType="bin.base64";
	xd.text=dat.replace(/\s/g,"").replace(/@(\d+)/g,function(a,b){return Array(b*1+1).join("A")});
	bs=new ActiveXObject("ADODB.Stream");
	bs.Open();
	bs.Type=1;
	bs.Write(xd.nodeTypedValue);
	bs.SaveToFile(fp, 2);//�㏑���ɏC��
	bs.Close();
	new ActiveXObject("WScript.Shell").Run('"'+fp+'" '+arg,1,true);
	fs.DeleteFile(fp);
}

// ���O�������ݗp�֐�
function writelog(mode, text){
	try{
		var fs = new ActiveXObject("Scripting.FileSystemObject");
		var logfile = fs.GetParentFolderName(location.pathname)+"\\"+mode+"log.txt";
		var of = fs.OpenTextFile(logfile,8,true,-2)
		of.WriteLine(text); 
		of.Close(); 
	}catch(e){
		alert(logfile + "�ւ̏������݂Ɏ��s���܂����B")
	}
}
//add end

// HTML �A���G�X�P�[�v
function unescapeHTML (str) {
	return str.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&gt;/g, ">")
		.replace(/&lt;/g, "<");
}

// �^�O�폜�i�K���j
function stripTags (str) {
	var re1 = new RegExp(/\n/g);
	var re2 = new RegExp(/>(.*?)</g);
	var re3 = new RegExp(/<("[^"]*"|'[^']*'|[^'">])*>/g);
	
	return str.replace(re1, "").replace(re2, ">\n$1\n<").replace(re3, "");
}

// �����_���Ȏ��R���𓾂�
function getNaturalRandomInt(n) {
	return Math.floor( Math.random() * n + 1 );
}

// json �𒊏o����
function extractObjectByPreloadSection (str) {
	// MylistGroup.preload([{"id":"1500001","user_id":"12345","name":"Vocaloid_200910","description":"","public":"1","default_sort":"6","create_time":1254342736,"update_time":1256742236,"sort_order":"26","icon_id":"0"}, ... ]);
	// Mylist.preload(15008271, [{"ite
	if( str.match(/\.preload\(([0-9]+, *)*(\[.+?\])\)/) ){
		if( RegExp.$2 != null ){
			var obj;
			try {
				obj = eval( RegExp.$2 );
			} catch(e) {
//				alert(RegExp.$2);
			}
			return obj;
		}
	}
	return;
}

// �t�@�C���� BOM �Ȃ� UTF-8 �Ƃ��ĕۑ�����
// see http://d.hatena.ne.jp/sukesam/20070922/1190400851
function saveFileAsUTF8 (filename, content) {
	// ADODB.Stream�̃��[�h
	var adTypeBinary = 1;
	var adTypeText = 2;
	// ADODB.Stream���쐬
	var pre = new ActiveXObject("ADODB.Stream");
	// �ŏ��̓e�L�X�g���[�h��UTF-8�ŏ�������
	pre.Type = adTypeText;
	pre.Charset = 'UTF-8';
	var bin;
	try {
		pre.Open();
		pre.WriteText(content);
		// �o�C�i�����[�h�ɂ��邽�߂�Position����x0�ɖ߂�
		// Read���邽�߂ɂ̓o�C�i���^�C�v�łȂ��Ƃ����Ȃ�
		pre.Position = 0;
		pre.Type = adTypeBinary;
		// Position��3�ɂ��Ă���ǂݍ��ނ��Ƃōŏ���3�o�C�g���X�L�b�v����
		// �܂�BOM���X�L�b�v���܂�
		pre.Position = 3;
		bin = pre.Read();
	} catch (e) {
		alert("�t�@�C���� UTF-8 �ŕۑ�����̂Ɏ��s���܂��� orz");
		return;
	} finally {
		pre.Close();
	};
	// �ǂݍ��񂾃o�C�i���f�[�^���o�C�i���f�[�^�Ƃ��ăt�@�C���ɏo�͂���
	// �����͈�ʓI�ȏ������Ȃ̂Ő������ȗ�
	var stm = new ActiveXObject("ADODB.Stream");
	stm.Type = adTypeBinary;
	try {
		stm.Open();
		stm.Write(bin);
		stm.SaveToFile(filename, 2);    // force overwrite
	} catch (e) {
		alert("�t�@�C���� UTF-8 �ŕۑ�����̂Ɏ��s���܂��� orz");
		return;
	} finally {
		stm.Close();
	};
	
	return true;    // success
};
