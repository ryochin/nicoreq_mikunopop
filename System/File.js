// �ėp�t�@�C�����색�C�u���� by saihane

/*
	var f = new File;
	f.file = '\\System\\caches\\count.json';    // ��f�B���N�g������̑��΃p�X
	
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
	
	// ��΃p�X��Ԃ�
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
	
	// �w�肳�ꂽ�t�@�C���̒��g��Ԃ��B��f�B���N�g������̑��΃p�X���w�肷�邱��
	read: function () {
		// check
		if( this.file == "" ){
			Status.postStatus("�t�@�C�����w�肳��Ă��܂���B", 3000 );
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
			Status.postStatus("�t�@�C�� " + path + " �̓ǂݍ��݂Ɏ��s���܂��� orz " + e.description, 3000 );
		}
		
		return content;
	},
	
	// �t�@�C���� JSON �Ƃ݂Ȃ��ēǂ݁A�I�u�W�F�N�g��Ԃ�
	readAsJSON: function () {
		var json;
		try {
			json = $.evalJSON( this.read() );
		} catch(e) {
			Status.postStatus("JSON �t�@�C�� " + this.file + " �̓ǂݍ��݂Ɏ��s���܂��� orz " + e.description, 3000 );
		}
		
		return json;
	},
	
	// �t�@�C����ۑ�����isjis�j
	save: function (conent) {
		// check
		if( this.file == "" ){
			Status.postStatus("�t�@�C�����w�肳��Ă��܂���B", 3000 );
			return;
		}
		if( conent == "" ){
			Status.postStatus("���e���w�肳��Ă��܂���B", 3000 );
			return;
		}
		
		var fs = new ActiveXObject('Scripting.FileSystemObject');
		var path = this.getAbsolutePath();
		var st = fs.OpenTextFile(path, 2, true, -2);
		
		try {
			st.writeLine(conent);
			st.Close();
		} catch(e) {
			Status.postStatus("�t�@�C�� " + path + " �̕ۑ��Ɏ��s���܂��� orz " + e.description, 3000 );
		}
	},
	
	// �t�@�C���� JSON �Ƃ��ĕۑ�����isjis�j
	saveAsJSON: function (obj) {
		this.save( $.toJSON( obj ) );
	},
	
	// �t�@�C���� BOM �Ȃ� UTF-8 �Ƃ��ĕۑ�����
	// see http://d.hatena.ne.jp/sukesam/20070922/1190400851
	saveAsUTF8: function (content) {
		// check
		if( this.file == "" ){
			Status.postStatus("�t�@�C�����w�肳��Ă��܂���B", 3000 );
			return;
		}
		if( content == "" ){
			Status.postStatus("���e���w�肳��Ă��܂���B", 3000 );
			return;
		}
		
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
			Status.postStatus("�t�@�C�� " + path + " �̕ۑ��Ɏ��s���܂��� orz " + e.description, 3000 );
			return;
		} finally {
			pre.Close();
		};
		// �ǂݍ��񂾃o�C�i���f�[�^���o�C�i���f�[�^�Ƃ��ăt�@�C���ɏo�͂���
		var stm = new ActiveXObject("ADODB.Stream");
		stm.Type = adTypeBinary;
		try {
			stm.Open();
			stm.Write(bin);
			stm.SaveToFile(this.file, 2);    // force overwrite
		} catch (e) {
			Status.postStatus("�t�@�C�� " + path + " �̕ۑ��Ɏ��s���܂��� orz " + e.description, 3000 );
			return;
		} finally {
			stm.Close();
		};
		
		return true;    // success
	},
	
	// �t�@�C�������݂��邩�ǂ���
	isExists: function () {
		// check
		if( this.file == "" ){
			Status.postStatus("�t�@�C�����w�肳��Ă��܂���B", 3000 );
			return;
		}
		
		var fs = new ActiveXObject('Scripting.FileSystemObject');
		var path = this.getAbsolutePath();
		
		return ( fs.FileExists(path) == true );
	},
	
	// �ŏI�X�V�����𓾂�i�b�P�ʁj
	getLastModified: function () {
		// check
		if( this.file == "" ){
			Status.postStatus("�t�@�C�����w�肳��Ă��܂���B", 3000 );
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
			Status.postStatus("�t�@�C�� " + path + " �̍X�V�����̎擾�Ɏ��s���܂��� orz", 3000 );
		}
		
		return epoch;
	},
	
	// �t�@�C���T�C�Y�𓾂�
	getSize: function () {
		// check
		if( this.file == "" ){
			Status.postStatus("�t�@�C�����w�肳��Ă��܂���B", 3000 );
			return;
		}
		
		var fs = new ActiveXObject('Scripting.FileSystemObject');
		var path = this.getAbsolutePath();
		
		var size = 0;
		try {
			var f = fs.GetFile(path);
			var size = f.Size;
		} catch(e) {
			Status.postStatus("�t�@�C�� " + path + " �̃T�C�Y�̎擾�Ɏ��s���܂��� orz", 3000 );
		}
		
		return size;
	},
	
	// �f�B���N�g�������
	createDir: function () {
		// check
		if( this.dir == "" ){
			Status.postStatus("�f�B���N�g�����w�肳��Ă��܂���B", 3000 );
			return;
		}
		
		var fs = new ActiveXObject('Scripting.FileSystemObject');
		var path = this.getAbsoluteDir();
		
		if( ! fs.FolderExists( path ) ){
			try {
				fs.CreateFolder( path );
			} catch (e) {
				Status.postStatus("�f�B���N�g��" + path + " �̍쐬�Ɏ��s���܂��� orz", 3000 );
			}
		}
	},
	
	// �����i�t�@�C���j�̐e�f�B���N�g�������
	createParentDir: function () {
		// check
		if( this.file == "" ){
			Status.postStatus("�t�@�C�����w�肳��Ă��܂���B", 3000 );
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
	
	// �t�@�C��������
	remove: function () {
		// check
		if( this.file == "" ){
			Status.postStatus("�t�@�C�����w�肳��Ă��܂���B", 3000 );
			return;
		}
		
		var fs = new ActiveXObject('Scripting.FileSystemObject');
		var path = this.getAbsolutePath();
		
		try {
			fs.deleteFile(path);
		} catch(e) {}
	}
}

