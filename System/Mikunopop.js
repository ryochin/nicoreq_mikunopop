// Mikunopop
// ref: http://d.hatena.ne.jp/nacookan/20080221/

var version = '1.18';    // ME version
var countFile = '\\count.json';    // relative path to NicoRequest.hta
var countFileURL = 'http://mikunopop.info/play/count.json?' + version;    // make sure ct is test/javascript
var cacheTime = 6 * 60 * 60;    // sec - please set it at least every 1 hr
var MikunopopCount = new Object();    // as a hash container

// main
if( settings["GetMikunopopCount"] == 1 ){
	// get via net
	if( checkMikunopopCountFileDateLastModified() ){
		retrieveMikunopopCountFile();
//		alert("最新のミクノ度情報をネットから取得しました。");
	}
	
	// load
	loadMikunopopCountFile();
}

function getMikunopopCount (id) {
	if( MikunopopCount[id] != undefined && MikunopopCount[id] > 0 ){
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
			alert("ミクノ度ファイルの更新に失敗しました orz");
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
		
		MikunopopCount = eval("("+content+")");    // load as json
	} catch(e) {
		alert("ミクノ度ファイルの読み込みに失敗しました orz");
	}
}

// EOF
