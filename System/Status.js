// showing status message module by saihane

Status = {};

// timer wrapper
Status.postStatus = function (str, show, timer) {
	if( timer > 0 ){
		setTimeout( function () { Status._postStatus(str, show) }, timer );
	}
	else{
		Status._postStatus(str, show);
	}
};

// main
Status._postStatus = function (str, show, timer) {
	// まだ要素がなければ hr を足す
	if( Status._countStatusNum() == 0 ){
		$("<hr />")
			.appendTo('#status');
	}

	// 要素を作って prepend
	var obj = $("<p />")
		.html( str )
		.attr( { title: "クリックでメッセージ消去" } )
		.hide()
		.prependTo('#status')
		.slideDown("slow");

	// click
	obj.click( function () { Status._removeMe(obj) } );

	// show が指定されていたら自分自身をフェードアウト
	if( show > 0 ){
		setTimeout( function () { Status._removeMe(obj) }, show );
	}
};

// remove me
Status._removeMe = function (obj) {
	obj.slideUp("slow");
	obj.remove();
	Status._cleanup();
};

// cleanup
Status._cleanup = function () {
	// 要素がもう残っていなければ、末尾の hr を消す
	if( Status._countStatusNum() == 0 ){
		$('#status hr').each( function () {
			$(this).slideUp("slow");
			$(this).remove();
		} );
	}
};

// count
Status._countStatusNum = function () {
	return $('#status > p').length;
};

