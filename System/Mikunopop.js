// Mikunopop
// ref: http://d.hatena.ne.jp/nacookan/20080221/

var version = '1.43';    // ME version
var countFileURL = 'http://mikunopop.info/play/count.json?' + version;    // make sure ct is test/javascript
var cacheTime = 6 * 60 * 60;    // sec - please set it at least every 1 hr
var MikunopopCount = new Object();    // as a hash container

// check main or not
var isMain = 1;
$('script').each( function () {
	if( $(this).attr('src').match(/Mikunopop\.js\?(.+)/) ){
		if( RegExp.$1 == 'sub' ){
			isMain = 0;
		}
	}
} );

var countFile = isMain
	? '\\System\\caches\\count.json'    // relative path to NicoRequest.hta
	: '\\caches\\count.json';

// main
if( settings["GetMikunopopCount"] == 1 ){
	// get via net
	if( checkMikunopopCountFileDateLastModified() ){
		retrieveMikunopopCountFile();
		
		// load
		loadMikunopopCountFile();
		
		// status
		Status.postStatus("�ŐV�̃~�N�m�x�����l�b�g����擾���܂����i" + comma( getVideoNum() ) + "�ȁj�B", 5000, 1000);
	}
	else{
		// load
		loadMikunopopCountFile();
	}
}

function getVideoNum () {
	var len = 0;
	$.each( MikunopopCount, function () { len++ } );
	return len;
}

function getMikunopopCount (id) {
	if( MikunopopCount[id] != undefined && MikunopopCount[id] !== '0' ){
		return MikunopopCount[id];
	}
	else{
		return 0;
	}
}

function checkMikunopopCountFileDateLastModified () {
	var fs = new ActiveXObject('Scripting.FileSystemObject');
	var path = fs.GetParentFolderName(location.pathname) + countFile;
	var expired = 0;
	try {
		var f = fs.GetFile(path);
		var s = f.DateLastModified;
		var epoch = parseInt( Date.parse(s), 10 ) / 1000;
		var now = parseInt( (new Date).getTime() / 1000, 10 );
		
		// check
		expired = now - epoch > cacheTime
			? 1
			: 0;
	} catch(e) {
		// not found
		expired = 1;
	}
	return expired;
}

function retrieveMikunopopCountFile () {
	var count;
	$.ajax( {
		url: countFileURL,
		async: 0,
		timeout: 5000,
//		dataType: "json",
		success: function (result, status) {
			count = result;
			// save to local
			saveMikunopopCountFile(count);
		},
		error: function (req, status, error) {
			alert("�~�N�m�x�t�@�C���̍X�V�Ɏ��s���܂��� orz");
		}
	} );
}

function saveMikunopopCountFile (count) {
	var fs = new ActiveXObject('Scripting.FileSystemObject');
	var path = fs.GetParentFolderName(location.pathname) + countFile;
	var st = fs.OpenTextFile(path, 2, true, -2);

	// simply write down all the content as-is :)
	st.writeLine(count);
	st.Close();
}

function loadMikunopopCountFile () {
	var fs = new ActiveXObject('Scripting.FileSystemObject');
	var path = fs.GetParentFolderName(location.pathname) + countFile;
	try {
		var st = fs.OpenTextFile(path, 1, false, -2);
		var content = st.ReadAll();
		st.Close();
		
		MikunopopCount = $.evalJSON( content );
	} catch(e) {
		alert("�~�N�m�x�t�@�C���̓ǂݍ��݂Ɏ��s���܂��� orz");
	}
}

// EOF
