
$(document).ready(function(){
	setTimeout(getData,1000);
});

function getData(){
	let courseinfo = {};		
	var a  = chimee.src.split("/");
	courseinfo.courseid = a[a.length-1].split(".")[0];
	courseinfo.userid = $("#userID").val();
	courseinfo.classid = $("#classId").val();
	courseinfo.wareid = $("#wareId").val();
	window.parent.postMessage(JSON.stringify(courseinfo),'*');
}