$(document).ready(function () {
	setTimeout("ceshi()",2000);
});

function ceshi() {
	var dd = new Array();
	$("button").each(function () {
		if ($(this).text() == "随堂测试") dd.push($(this));
	});
	if(dd.length == 0) return;
	$(dd[0]).click();
	setTimeout("window.location.reload()", 2000);
	setInterval(function(){
		if(isEnd == false) ceshi();
	},2000);
}