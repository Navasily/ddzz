$(document).ready(function () {
	setTimeout(gotoExam,3000);
});

function gotoExam(){
	var storage = window.localStorage;
	var url = storage.getItem("examUrl");
	window.location.href = url;
}