window.attachEvent("onload", function(){
	__Tab__setTab();
	document.getElementById("Tab").attachEvent("onchange", function(){
		__Tab__setTab();
	});
});

// ID���d��������Ɣz��Ƃ��ăA�N�Z�X�ł���Ƃ���(����)IE����Z
function __Tab__setTab(){
	for(var i=0,l=TabContents.length; i<l; i++){
		TabContents[i].runtimeStyle.display = "none";
	}
	var sTab = TabContents[Tab.selectedIndex];
	if(sTab) sTab.runtimeStyle.display = "block";
}