// 汎用ファイル操作ライブラリ by saihane

/*
	var f = new File;
	f.file = '\\System\\caches\\count.json';    // 基準ディレクトリからの相対パス
	
	var value = f.getAbsolutePath()
	var value = f.getAbsoluteDir()

	var content = f.read()
	var content = f.readAsJSON()

	save(content)
	saveAsJSON(object)
	saveAsUTF8(content)

	var bool = isExists()
	var value = f.getLastModified()
	var value = f.getSize()

	createDir()
	createParentDir()

	remove()
*/

function File(){
	var fs = new ActiveXObject('Scripting.FileSystemObject');
	this.base	= fs.GetParentFolderName(location.pathname);
	this.file	= "";
	this.dir	= "";
}

File.prototype = {
	initialize: function () { },
	
	// 絶対パスを返す
	getAbsolutePath: function () {
		return this.file.match(/^[A-Z]+:\\/)
			? this.file
			: this.base + this.file;
	},
	getAbsoluteDir: function () {
		return this.dir.match(/^[A-Z]+:\\/)
			? this.dir
			: this.base + this.dir;
	},
	
	// 指定されたファイルの中身を返す。基準ディレクトリからの相対パスを指定すること
	read: function () {
		// check
		if( this.file == "" ){
			Status.postStatus("ファイルが指定されていません。", 3000 );
			return;
		}
		
		var fs = new ActiveXObject('Scripting.FileSystemObject');
		var path = this.getAbsolutePath();
		var content;
		try {
			var st = fs.OpenTextFile(path, 1, false, -2);
			content = st.ReadAll();
			st.Close();
		} catch(e) {
			Status.postStatus("ファイル " + path + " の読み込みに失敗しました orz " + e.description, 3000 );
		}
		
		return content;
	},
	
	// ファイルを JSON とみなして読み、オブジェクトを返す
	readAsJSON: function () {
		var json;
		try {
			json = $.evalJSON( this.read() );
		} catch(e) {
			Status.postStatus("JSON ファイル " + this.file + " の読み込みに失敗しました orz " + e.description, 3000 );
		}
		
		return json;
	},
	
	// ファイルを保存する（sjis）
	save: function (conent) {
		// check
		if( this.file == "" ){
			Status.postStatus("ファイルが指定されていません。", 3000 );
			return;
		}
		if( conent == "" ){
			Status.postStatus("内容が指定されていません。", 3000 );
			return;
		}
		
		var fs = new ActiveXObject('Scripting.FileSystemObject');
		var path = this.getAbsolutePath();
		var st = fs.OpenTextFile(path, 2, true, -2);
		
		try {
			st.writeLine(conent);
			st.Close();
		} catch(e) {
			Status.postStatus("ファイル " + path + " の保存に失敗しました orz " + e.description, 3000 );
		}
	},
	
	// ファイルを JSON として保存する（sjis）
	saveAsJSON: function (obj) {
		this.save( $.toJSON( obj ) );
	},
	
	// ファイルを BOM なし UTF-8 として保存する
	// see http://d.hatena.ne.jp/sukesam/20070922/1190400851
	saveAsUTF8: function (content) {
		// check
		if( this.file == "" ){
			Status.postStatus("ファイルが指定されていません。", 3000 );
			return;
		}
		if( content == "" ){
			Status.postStatus("内容が指定されていません。", 3000 );
			return;
		}
		
		// ADODB.Streamのモード
		var adTypeBinary = 1;
		var adTypeText = 2;
		// ADODB.Streamを作成
		var pre = new ActiveXObject("ADODB.Stream");
		// 最初はテキストモードでUTF-8で書き込む
		pre.Type = adTypeText;
		pre.Charset = 'UTF-8';
		var bin;
		try {
			pre.Open();
			pre.WriteText(content);
			// バイナリモードにするためにPositionを一度0に戻す
			// Readするためにはバイナリタイプでないといけない
			pre.Position = 0;
			pre.Type = adTypeBinary;
			// Positionを3にしてから読み込むことで最初の3バイトをスキップする
			// つまりBOMをスキップします
			pre.Position = 3;
			bin = pre.Read();
		} catch (e) {
			Status.postStatus("ファイル " + path + " の保存に失敗しました orz " + e.description, 3000 );
			return;
		} finally {
			pre.Close();
		};
		// 読み込んだバイナリデータをバイナリデータとしてファイルに出力する
		var stm = new ActiveXObject("ADODB.Stream");
		stm.Type = adTypeBinary;
		try {
			stm.Open();
			stm.Write(bin);
			stm.SaveToFile(this.file, 2);    // force overwrite
		} catch (e) {
			Status.postStatus("ファイル " + path + " の保存に失敗しました orz " + e.description, 3000 );
			return;
		} finally {
			stm.Close();
		};
		
		return true;    // success
	},
	
	// ファイルが存在するかどうか
	isExists: function () {
		// check
		if( this.file == "" ){
			Status.postStatus("ファイルが指定されていません。", 3000 );
			return;
		}
		
		var fs = new ActiveXObject('Scripting.FileSystemObject');
		var path = this.getAbsolutePath();
		
		return ( fs.FileExists(path) == true );
	},
	
	// 最終更新時刻を得る（秒単位）
	getLastModified: function () {
		// check
		if( this.file == "" ){
			Status.postStatus("ファイルが指定されていません。", 3000 );
			return;
		}
		
		var fs = new ActiveXObject('Scripting.FileSystemObject');
		var path = this.getAbsolutePath();
		
		var epoch = 0;
		try {
			var f = fs.GetFile(path);
			var s = f.DateLastModified;
			epoch = parseInt( Date.parse(s), 10 ) / 1000;
		} catch(e) {
			Status.postStatus("ファイル " + path + " の更新時刻の取得に失敗しました orz", 3000 );
		}
		
		return epoch;
	},
	
	// ファイルサイズを得る
	getSize: function () {
		// check
		if( this.file == "" ){
			Status.postStatus("ファイルが指定されていません。", 3000 );
			return;
		}
		
		var fs = new ActiveXObject('Scripting.FileSystemObject');
		var path = this.getAbsolutePath();
		
		var size = 0;
		try {
			var f = fs.GetFile(path);
			var size = f.Size;
		} catch(e) {
			Status.postStatus("ファイル " + path + " のサイズの取得に失敗しました orz", 3000 );
		}
		
		return size;
	},
	
	// ディレクトリを作る
	createDir: function () {
		// check
		if( this.dir == "" ){
			Status.postStatus("ディレクトリが指定されていません。", 3000 );
			return;
		}
		
		var fs = new ActiveXObject('Scripting.FileSystemObject');
		var path = this.getAbsoluteDir();
		
		if( ! fs.FolderExists( path ) ){
			try {
				fs.CreateFolder( path );
			} catch (e) {
				Status.postStatus("ディレクトリ" + path + " の作成に失敗しました orz", 3000 );
			}
		}
	},
	
	// 自分（ファイル）の親ディレクトリを作る
	createParentDir: function () {
		// check
		if( this.file == "" ){
			Status.postStatus("ファイルが指定されていません。", 3000 );
			return;
		}
		
		var fs = new ActiveXObject('Scripting.FileSystemObject');
		var path = this.getAbsolutePath();
		
		var dir = fs.GetParentFolderName( path );
		if( ! fs.FolderExists( dir ) ){
			this.dir = dir;
			this.createDir();
		}
	},
	
	// ファイルを消す
	remove: function () {
		// check
		if( this.file == "" ){
			Status.postStatus("ファイルが指定されていません。", 3000 );
			return;
		}
		
		var fs = new ActiveXObject('Scripting.FileSystemObject');
		var path = this.getAbsolutePath();
		
		try {
			fs.deleteFile(path);
		} catch(e) {}
	}
}

