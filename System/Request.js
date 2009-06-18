function Request(){
	this.id     = "";
	this.title  = "";
	this.view   = 0;
	this.comm   = 0;
	this.list   = 0;
	this.length = "0:00";
	this.date   = new Date();
	this.tags   = new Array();
	this.name   = "";
//add start
	// タイプ判定用
	this.oTitle        = "";	// 元の動画タイトル
	this.thumbnail_url = "";	// サムネイルURL
	this.description   = "";	// 動画説明
	this.type          = "";	// タイプ(typeX("typeX")／複数("plural")／不明(""))
	this.kiki = 0; //聴き入り度（マイリスト/コメント）
	this.myri = 0; //マイリスト率（マイリスト/再生）
	this.hiky = 0; //正義度（ボカランコメント補正・卑怯度）
//サムネ = 
//add end
	this.initialize.apply(this, arguments);
}
Request.prototype = {
	initialize: function(id, xmldom){
		this.id     = id;
		if(!xmldom || xmldom.getElementsByTagName("error").length > 0){
			this.title = xmldom.getElementsByTagName("code")[0].text;
			return this;
		}
		this.title  = this.getTitle(xmldom.getElementsByTagName("title")[0].text);
		this.view   = Number(xmldom.getElementsByTagName("view_counter")[0].text);
		this.comm   = Number(xmldom.getElementsByTagName("comment_num")[0].text);
		this.list   = Number(xmldom.getElementsByTagName("mylist_counter")[0].text);
//add start
//		this.kiki = Math.round(100*this.list/this.comm)/100;
//		this.myri = Math.round(10000*this.list/this.view)/100;
//		this.hiky = Math.round(100*(this.list+this.view)/(this.list+this.view+this.comm))/100;
		this.kiki = (this.list/this.comm).toFixed(2);
		this.myri = (100*this.list/this.view).toFixed(2);
		this.hiky = ((this.list+this.view)/(this.list+this.view+this.comm)).toFixed(2);
//add end
		this.length = xmldom.getElementsByTagName("length")[0].text;
		this.date   = new Date(xmldom.getElementsByTagName("first_retrieve")[0].text.replace("-","/").replace("T"," ").replace("+09:00",""));
		var xmltags = xmldom.getElementsByTagName("tags")[0].getElementsByTagName("tag");
		for(var i=0,l=xmltags.length; i<l; i++){
			this.tags.push(xmltags[i].text);
		}
		this.name  = this.getPName(this.tags, this.title);
//add start タイプ判定用プロパティ
		this.oTitle  = xmldom.getElementsByTagName("title")[0].text;
		this.thumbnail_url = xmldom.getElementsByTagName("thumbnail_url")[0].text;
		this.description = xmldom.getElementsByTagName("description")[0].text;
		this.type        = this.getType(this.oTitle, this.description, this.tags);
//add end
	},
	getTitle: function(title){
		var T = title;
		for(var i=0,l=settings["TitleDeleteTargets"].length; i<l; i++){
			T = T.replace(settings["TitleDeleteTargets"][i], "");
		}
		return T;
	},
	getPName: function(tags, title){
		var P = "";
		// たまに～に定評のある～Pというタグが付いてることがある
		// そういうのは順番的に後ろだろうということで、手前にある作者タグを優先する
		for(var i=tags.length-1; i>=0; i--){
			var Tag = tags[i];
			// タグ名の最後にPがついたらヒット
			if(Tag.match(/(P|p|Ｐ|ｐ)$/)){
				var _P = P;
				P += Tag + " ";
				// でも除外リストに載ってたら白紙に
				if(Zen2Han(settings["NotPTagsIM"].join(",")).indexOf(","+Zen2Han(Tag)+",") > -1) P = _P;
				if(Zen2Han(settings["NotPTagsVO"].join(",")).indexOf(","+Zen2Han(Tag)+",") > -1) P = _P;
				// タイトルの中に出てくるって事は曲名かもしれないって事で白紙に
				if(title.indexOf(Tag) > -1) P = _P;
			}
			// 例外的に～氏と～作品が作者タグになっている場合があるので調べる
			// ～リスペクト作品ってタグは除外
			if(Tag.match(/(氏|作品)$/) && !Tag.match(/リスペクト作品/)) P += Tag + " ";
			// 上記のルール以外の作者タグは例外リストで対応
			if(Zen2Han(settings["exceptionPTagsIM"].join(",")).indexOf(","+Zen2Han(Tag)+",") > -1) P += Tag + " ";
			if(Zen2Han(settings["exceptionPTagsVO"].join(",")).indexOf(","+Zen2Han(Tag)+",") > -1) P += Tag + " ";
		}
		if(P=="") P = settings["NoPName"];
		return P;
	},
//add start　タイプ判定
	getType: function(title, description, tags){
//タイトル = title
//動画説明 = description
//タグ = tags(tag)
		var T = "";
		if (settings["typeTITLE"]) T += title+" ";
		if (settings["typeDESCRIPTION"]) T += description+" ";
		if (settings["typeTAG"]) T += tags+" ";

		//type1のチェック
		var i=0;//単語番号
		var j=0;//単語グループ番号
		var k=0;//複数フラグ
		var l=0;//単語総数
		var m=0;//該当グループ番号
		var typeSTR="";
		while (j<settings["typeMax"] && k<2){
			j++;
			typeSTR="type"+j+"STR";
			if(settings[typeSTR]){
				l=settings[typeSTR].length;
				while (i<l && j>m){
					if(T.indexOf(settings[typeSTR][i]) > -1){
						//該当グループ番号更新
						m=j;
						k++;
					}
					i++;
				}
				//単語番号リセット
				i=0;
			}
		}
		//タイプ判定
		//複数に該当する場合
		if(k>1) return "plural";
		//単独で該当する場合
		if(m>0) return "type"+m;
		return "";
	},
//add end
	getDateString: function(format){
		if(!format) format = "yy/mm/dd hh:nn:ss";
		var YYYY = this.date.getFullYear();
//del		var YY   = this.fillZero(this.date.getYear());
//add start
		var YY   = this.fillZero(YYYY<2000?YYYY-1900:YYYY-2000);
//add end
		var MM   = this.fillZero(this.date.getMonth() + 1);
		var DD   = this.fillZero(this.date.getDate());
		var DY   = ["日", "月", "火", "水", "木", "金", "土"][this.date.getDay()];
		var HH   = this.fillZero(this.date.getHours());
		var NN   = this.fillZero(this.date.getMinutes());
		var SS   = this.fillZero(this.date.getSeconds());
		var dateStr = format.replace("yyyy", YYYY)
							.replace("yy", YY)
							.replace("mm", MM)
							.replace("dd", DD)
							.replace("dy", DY)
							.replace("hh", HH)
							.replace("nn", NN)
							.replace("ss", SS)
		;
		return dateStr;
	},
	fillZero: function(num){
		if(num<10) num = "0" + num;
		return num;
	},
	getLengthNumber: function(){
		var temp = this.length.split(":");
		var length = Number(temp[0]) * 60 + Number(temp[1]);
		if(isNaN(length)) length = 0;
		return length;
	}
};

function RequestQueue(){
	this.id  = "";
	this.key = "";
	this.number = 0;
	this.initialize.apply(this, arguments);
}
RequestQueue.prototype = {
	initialize: function(id, key, number){
		this.id  = id;
		this.key = key;
		this.number = number;
	}
}
