// Mikunopop
// ref: http://d.hatena.ne.jp/nacookan/20080221/

var version = '1.48';    // ME version
var countFileURL = 'http://mikunopop.info/play/count.json?' + version;    // make sure ct is test/javascript
var cacheTime = 4 * 60 * 60;    // sec - please set it at least every 1 hr
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
		Status.postStatus("最新のミクノ度情報をネットから取得しました（" + comma( getVideoNum() ) + "曲）。", 5000, 1000);
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
	var f = new File;
	f.file = countFile;
	var epoch = f.getLastModified();
	var now = parseInt( (new Date).getTime() / 1000, 10 );
	
	return now - epoch > cacheTime
		? 1
		: 0;
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
			Status.postStatus("ミクノ度ファイルの更新に失敗しました orz", 5000 );
		}
	} );
}

function saveMikunopopCountFile (count) {
	var f = new File;
	f.file = countFile;
	f.save(count);
}

function loadMikunopopCountFile () {
	var f = new File;
	f.file = countFile;
	MikunopopCount = f.readAsJSON();
}

// EOF
