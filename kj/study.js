var btn=$("<button type='button' id='studyAuto' style='width:80px;height:40px;'>开始学习</button>");
$("div[class='relative-wapper div-block'").append(btn);
$("#studyAuto").bind("click",function(){
	$(".pop").show();
	CKobject.getObjectById('ckplayer_a1').videoPause();
	stopDJSTimer();
	$("#getUserId").val(userid);
	if($("#getUserId").val() == undefined || $("#getUserId").val() == ""){
		alert("系统错误，请重新点击 开始学习 按钮");
		return;
	}	
});