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

	// タイプ判定用
	this.oTitle        = "";	// 元の動画タイトル
	this.thumbnail_url = "";	// サムネイルURL
	this.description   = "";	// 動画説明
	this.type          = "";	// タイプ(typeX("typeX")／複数("plural")／不明(""))
	this.myri          =  0;	// マイリスト率（マイリスト/再生）
	this.count         =  0;	// ミクノ度
	this.requester     = "";	// リクエスト元
	this.requesterstr  = "";	// リクエスト元整形後文字列

	this.initialize.apply(this, arguments);
}
Request.prototype = {
	initialize: function(id, reqCommentNum, xmldom){
		this.id     = id;
		if(!xmldom || xmldom.getElementsByTagName("error").length > 0){
			this.title = xmldom.getElementsByTagName("code")[0].text;
			return this;
		}
		this.title  = this.getTitle(xmldom.getElementsByTagName("title")[0].text);
		this.view   = Number(xmldom.getElementsByTagName("view_counter")[0].text);
		this.comm   = Number(xmldom.getElementsByTagName("comment_num")[0].text);
		this.list   = Number(xmldom.getElementsByTagName("mylist_counter")[0].text);
		this.myri = (100*this.list/this.view).toFixed(1);
		this.length = xmldom.getElementsByTagName("length")[0].text;
		this.date   = new Date(xmldom.getElementsByTagName("first_retrieve")[0].text.replace("-","/").replace("T"," ").replace("+09:00",""));
		this.no_live_play = Number(xmldom.getElementsByTagName("no_live_play")[0].text);
		var xmltags = xmldom.getElementsByTagName("tags")[0].getElementsByTagName("tag");
		var genreTagWhiteList = Zen2Han(settings["genreTagWhiteList"].join(","));    // cached
		this.genre = [];
		for(var i=0,l=xmltags.length; i<l; i++){
			// tags.js に載っているものだけを抽出したい
			if( genreTagWhiteList.indexOf(","+Zen2Han(xmltags[i].text)+",") > -1 ){
				this.genre.push(xmltags[i].text);
			}
			this.tags.push(xmltags[i].text);
		}
		this.genre.sort( function(a,b){ return ( a.length > b.length ) ? 1 : -1 } );    // 短いほうがきっと本質的だろう
		this.name  = this.getPName(this.tags, this.title);
		this.count = settings["GetMikunopopCount"]
						? getMikunopopCount( id )
						: "-";
		this.requesterstr = reqCommentNum == ""
						? settings["RequesterAdminStr"]
						: settings["RequesterListenerStr"].replace(/{#ReqCommentNum}/g, reqCommentNum);
		this.oTitle  = xmldom.getElementsByTagName("title")[0].text;
		this.thumbnail_url = xmldom.getElementsByTagName("thumbnail_url")[0].text;
		this.description = xmldom.getElementsByTagName("description")[0].text;
//		this.type        = this.getType(this.oTitle, this.description, this.tags);
		this.type        = "";
	},
	getTitle: function(title){
		var T = title;
		if( settings["TitleDeleteTargets"] != null ){
			for(var i=0,l=settings["TitleDeleteTargets"].length; i<l; i++){
				T = T.replace(settings["TitleDeleteTargets"][i], "");
			}
		}
		return T;
	},
	getPName: function(tags, title){
		var P = "";
		// たまに～に定評のある～Pというタグが付いてることがある
		// そういうのは順番的に後ろだろうということで、手前にある作者タグを優先する
		var exceptionPTagsVO = Zen2Han(settings["exceptionPTagsVO"].join(","));    // cache
		for(var i=tags.length-1; i>=0; i--){
			var Tag = tags[i];
			// タグ名の最後にPがついたらヒット
			if(Tag.match(/(P|p|Ｐ|ｐ)$/)){
				var _P = P;
				P += Tag + " ";
				// でも除外リストに載ってたら白紙に
				if(Zen2Han(settings["NotPTagsVO"].join(",")).indexOf(","+Zen2Han(Tag)+",") > -1) P = _P;
				// タイトルの中に出てくるって事は曲名かもしれないって事で白紙に
				// 曲名の場合は積極的に除外Ｐリストをメンテすることにしよう
//				if(title.indexOf(Tag) > -1) P = _P;
			}
			// 例外的に～氏と～作品が作者タグになっている場合があるので調べる
			// ～リスペクト作品ってタグは除外
			if(Tag.match(/(氏|作品)$/) && !Tag.match(/リスペクト作品/)) P += Tag + " ";
			// 上記のルール以外の作者タグは例外リストで対応
			if(exceptionPTagsVO.indexOf(","+Zen2Han(Tag)+",") > -1) P += Tag + " ";
		}
		if(P=="") P = settings["NoPName"];
		return P;
	},

//	getType: function(title, description, tags){
//		var T = "";
//		if (settings["typeTITLE"]) T += title+" ";
//		if (settings["typeDESCRIPTION"]) T += description+" ";
//		if (settings["typeTAG"]) T += tags+" ";
//
//		//type1のチェック
//		var i=0;//単語番号
//		var j=0;//単語グループ番号
//		var k=0;//複数フラグ
//		var l=0;//単語総数
//		var m=0;//該当グループ番号
//		var typeSTR="";
//		while (j<settings["typeMax"] && k<2){
//			j++;
//			typeSTR="type"+j+"STR";
//			if(settings[typeSTR]){
//				l=settings[typeSTR].length;
//				while (i<l && j>m){
//					if(T.indexOf(settings[typeSTR][i]) > -1){
//						//該当グループ番号更新
//						m=j;
//						k++;
//					}
//					i++;
//				}
//				//単語番号リセット
//				i=0;
//			}
//		}
//		//タイプ判定
//		//複数に該当する場合
//		if(k>1) return "plural";
//		//単独で該当する場合
//		if(m>0) return "type"+m;
//		return "";
//	},

	getDateString: function(format){
		if(!format) format = "yy/mm/dd hh:nn:ss";
		var YYYY = this.date.getFullYear();
		var YY   = this.fillZero(YYYY<2000?YYYY-1900:YYYY-2000);
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
	this.requester = "";    // listener | admin | stock
	this.initialize.apply(this, arguments);
}
RequestQueue.prototype = {
	initialize: function(id, key, number, requester){
		this.id  = id;
		this.key = key;
		this.number = number;
		this.requester = requester;
	}
}
