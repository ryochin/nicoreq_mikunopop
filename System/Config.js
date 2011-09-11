// 一時設定ファイル操作 by saihane

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
			object = f.readAsJSON();    // 最初は無いかもしれない
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
	
	// 現在の config を保存する
	save: function () {
		var f = new File;
		f.file = this.file;
		
		f.saveAsJSON( this.config );
		
//		Status.postStatus("config を保存しました。", 3000);
	},
	
	// デフォルトオブジェクトを作成
	getDefaultObject: function () {
		return {
			// １人あたりのリクエスト数の制限
			'MultiRequestLimit.Flag':0,
			'MultiRequestLimit.Num':1,
			
			// nm 動画のリクエスト禁止
			'ForbidNMVideo.Flag': 0,
			
			// ミクノ度によるリクエスト制限
			'RestrictPlayCount.Flag':0,
			'RestrictPlayCount.Num':5,
			
			// リクエスト制限（タグ）
			'RequestLimitation.Flag': 0,
			'RequestLimitation.DefaultTags': {
				"テクノ": 1,
				"テクノポップ": 1,
				"ミクノ": 1,
				"ミクノポップ": 1,
				"ミクトランス": 1,
				"ミクトロニカ": 1,
				"ミクビエント": 1,
				"MikuPOP": 1,
				"MikuHouse": 1
			},
			'RequestLimitation.ExtraTags': {
				"ChipTune": 1,
				"ミニマル": 1,
				"J-CORE": 1
			},
			'RequestLimitation.UserTags': [
				"空白（あるいは改行）で区切って独自タグをセットします"
			],
			dummy: 0   // terminater dummy
		};
	}
};

