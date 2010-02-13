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
	// �܂��v�f���Ȃ���� hr �𑫂�
	if( Status._countStatusNum() == 0 ){
		$("<hr />")
			.appendTo('#status');
	}

	// �v�f������� prepend
	var obj = $("<p />")
		.html( str )
		.attr( { title: "�N���b�N�Ń��b�Z�[�W����" } )
		.hide()
		.prependTo('#status')
		.slideDown("slow");

	// click
	obj.click( function () { Status._removeMe(obj) } );

	// show ���w�肳��Ă����玩�����g���t�F�[�h�A�E�g
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
	// �v�f�������c���Ă��Ȃ���΁A������ hr ������
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

