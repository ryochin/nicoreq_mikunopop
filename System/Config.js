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
			// �P�l������̃��N�G�X�g���̐���
			'MultiRequestLimit.Flag':0,
			'MultiRequestLimit.Num':1,
			
			// nm ����̃��N�G�X�g�֎~
			'ForbidNMVideo.Flag': 0,
			
			// �~�N�m�x�ɂ�郊�N�G�X�g����
			'RestrictPlayCount.Flag':0,
			'RestrictPlayCount.Num':5,
			
			// ���N�G�X�g�����i�^�O�j
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

