// 

var DefaultTags = [];
var ExtraTags = [];

var width_len = 18;

$(document).ready( function () {
	// 数字をつけて管理する
	var n_d = 0;
	$.each( settings["RequestLimitation"]["DefaultTags"], function () {
		DefaultTags[n_d++] = this;
	} );
	
	var n_e = 0;
	$.each( settings["RequestLimitation"]["ExtraTags"], function () {
		ExtraTags[n_e++] = this;
	} );
	
	var RL = new RequestLimitation;
	
	// フラグの設定
	RL.setFlag();
	
	// タグのリストを表示する
	RL.setDefaultTagsHTML();
	RL.setExtraTagsHTML();
	RL.setUserTagsHTML();
	
	// それぞれの機能を設定する
	RL.setDefaultTagCheckboxBehaivier();
	RL.setExtraTagCheckboxBehaivier();
	RL.setUserTagCheckboxBehaivier();

	RL.getLimitedTags();
} );

function RequestLimitation () {
	
}

RequestLimitation.prototype = {
	initialize: function () {  },
	
	setFlag: function () {
		if( config.get("RequestLimitation.Flag") ){
			$('#req_limitation_flag').attr( { checked: 'checked' } );
		}
		
		// 
		$('#req_limitation_flag').click( function () {
			// set
			config.set( "RequestLimitation.Flag", $('#req_limitation_flag').attr('checked') ? 1 : 0 );
			
			// save
			config.save();
		} );
	},
	
	setDefaultTagsHTML: function () {
		var html = '';
		var len = 0;
		
		for( var i = 0; i <= DefaultTags.length; i++ ){
			var name = DefaultTags[i];
			if( name == undefined || name == '[object]' )
				continue;
			
			// checked
			var is_checked = config.get("RequestLimitation.DefaultTags")[name];
			
			// len
			if( len > width_len ){
				html += "<br />";
				len = 0;
			}
			len += name.length;
			
			// html
			var id = 'request_limitation_default_tags_' + String(i);
			html += sprintf('<input type="checkbox" id="%s"%s /><label for="%s">%s</label>' + "\n",
				id, ( is_checked ? ' checked="checked"' : '' ), id, name );
			
			// set
			$('#req_limitation_default_tags').html( html );
		}
	},
	
	setExtraTagsHTML: function () {
		var html = '';
		var len = 0;
		
		for( var i = 0; i <= ExtraTags.length; i++ ){
			var name = ExtraTags[i];
			if( name == undefined || name == '[object]' )
				continue;
			
			// checked
			var is_checked = config.get("RequestLimitation.ExtraTags")[name];
			
			// len
			if( len > width_len ){
				html += "<br />";
				len = 0;
			}
			len += name.length;
			
			// html
			var id = 'request_limitation_extra_tags_' + String(i);
			html += sprintf('<input type="checkbox" id="%s"%s /><label for="%s">%s</label>' + "\n",
				id, ( is_checked ? ' checked="checked"' : '' ), id, name );
			
			// set
			$('#req_limitation_extra_tags').html( html );
		}
	},
	
	setDefaultTagCheckboxBehaivier: function () {
		for( var i = 0; i <= DefaultTags.length; i++ ){
			var name = DefaultTags[i];
			if( name == undefined || name == '[object]' )
				continue;
			
			// id
			var id = '#request_limitation_default_tags_' + String(i);
			
			$(id).click( function () {
				// id に含まれる数字から名前を得る
				$(this).attr('id').match(/_([0-9]+)$/);
				var name = DefaultTags[ Number(RegExp.$1) ];
				
				// 現在の値
				var tags = config.get("RequestLimitation.DefaultTags");    // obj
				
				// set
				tags[name] = $(this).attr('checked') ? 1 : 0;
				config.set( "RequestLimitation.DefaultTags", tags );
				
				// save
				config.save();
			} );
			
		}
	},
	
	setExtraTagCheckboxBehaivier: function () {
		for( var i = 0; i <= ExtraTags.length; i++ ){
			var name = ExtraTags[i];
			if( name == undefined || name == '[object]' )
				continue;
			
			// id
			var id = '#request_limitation_extra_tags_' + String(i);
			
			$(id).click( function () {
				// id に含まれる数字から名前を得る
				$(this).attr('id').match(/_([0-9]+)$/);
				var name = ExtraTags[ Number(RegExp.$1) ];
				
				// 現在の値
				var tags = config.get("RequestLimitation.ExtraTags");    // obj
				
				// set
				tags[name] = $(this).attr('checked') ? 1 : 0;
				config.set( "RequestLimitation.ExtraTags", tags );
				
				// save
				config.save();
			} );
			
		}
	},
	
	setUserTagsHTML: function () {
		var tags = config.get("RequestLimitation.UserTags");    // array
		
		$('#req_limitation_user_area').text( tags.join(" ") );
	},
	
	setUserTagCheckboxBehaivier: function () {
		$('#req_limitation_user_area').change( function () {
			var tags = $('#req_limitation_user_area').text().split(/[\s\n\r　]+/)
			
			// set
			config.set( "RequestLimitation.UserTags", tags );
			
			// save
			config.save();
		} );
	},
	
	// Main.js から呼ぶ
	getLimitedTags: function () {
		var tags = [];
		$.each( config.get("RequestLimitation.DefaultTags"), function (name, value) {
			if( value == 1 )
				tags.push(name);
		} );
		$.each( config.get("RequestLimitation.ExtraTags"), function (name, value) {
			if( value == 1 )
				tags.push(name);
		} );
		
		var userTags = config.get("RequestLimitation.UserTags");
		$.each( config.get("RequestLimitation.UserTags"), function (i) {
			tags.push( userTags[i] );
		} );
		
		return tags;
	}
}

