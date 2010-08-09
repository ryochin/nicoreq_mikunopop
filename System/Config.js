// �ꎞ�ݒ�t�@�C������ by saihane

/*
	var config = new Config;
	var value = config.get("foo.bar.baz");
	config.set("foo.bar.baz", 42);
*/

function Config() {
	this.file	= settings["ConfigFile"];
	this.config = null;
}

Config.prototype = {
	initialize: function (o) { },
	
	// load
	load: function () {
		var f = new File;
		f.file = this.file;
		
		var object;
		if( f.isExists() ){
			object = f.readAsJSON();    // �ŏ��͖�����������Ȃ�
		}
		this.config = object ? object : this.getDefaultObject();
	},
	
	// getter
	get: function (key) {
		if( key == "" )
			return;
		
		return this.config[key];
	},
	
	// setter
	set: function (key, value) {
		if( key == "" )
			return;
		
		this.config[key] = value;
	},
	
	// ���݂� config ��ۑ�����
	save: function () {
		var f = new File;
		f.file = this.file;
		
		f.saveAsJSON( this.config );
		
//		Status.postStatus("config ��ۑ����܂����B", 3000);
	},
	
	// �f�t�H���g�I�u�W�F�N�g���쐬
	getDefaultObject: function () {
		return {
			'RequestLimitation.Flag': 0,
			'RequestLimitation.DefaultTags': {
				"�e�N�m": 1,
				"�e�N�m�|�b�v": 1,
				"�~�N�m": 1,
				"�~�N�m�|�b�v": 1,
				"�~�N�g�����X": 1,
				"�~�N�g���j�J": 1,
				"�~�N�r�G���g": 1,
				"MikuPOP": 1,
				"MikuHouse": 1
			},
			'RequestLimitation.ExtraTags': {
				"ChipTune": 1,
				"�~�j�}��": 1,
				"J-CORE": 1
			},
			'RequestLimitation.UserTags': [
				"�󔒁i���邢�͉��s�j�ŋ�؂��ēƎ��^�O���Z�b�g���܂�"
			],
			dummy: 0   // terminater dummy
		};
	}
};

