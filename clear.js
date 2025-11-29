var imageBase64 = "";

function sendMessage(type,m) {
	var message = {};
	message.type = type;
	message.m = m;
	chrome.extension.sendMessage(JSON.stringify(message), function (response) {
		
	});
}
$(document).ready(function () {
	$(".top").remove();
	// $("#username").blur(function () {
	// 	sendMessage("clear");
	// });
	var info = '<div class="tianze-user-box  tianze-username"><input id="userpass" autocomplete="off" type="text" placeholder="用户名和密码" required="" data-parsley-errors-container="#nameMessage"></div>';
	//var yzm = '<a id="yzm" class="js-submit tianze-loginbtn">获取验证码</a>';
	$("#loginForm").prepend(info);
	//$(".w-100").prepend(yzm);

	$("#userpass").blur(function () {
		var dd = $("#userpass").val();
		var username = dd.substring(0, dd.indexOf("	"));
		var password = dd.substring(dd.indexOf("	") + 1, dd.length);
		$("#username").val(username);
		$("#password").val(password);
		sendMessage("clear");
	});
	// $("#yzm").bind("click",
	// 	function () {
	// 		getMa();
	// 	});
});
function getMa() {
	var img = $("#yanzhengma").attr("src");
	imageBase64 = "";
	var image = new Image();

	image.src = img;
	image.onload = function () {
		imageBase64 = encodeURIComponent(getBase64Image(image));
		//console.log(imageBase64);
		sendMessage("getma",imageBase64);
		
	};
}
function getBase64Image(img) {
	var canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0, img.width, img.height);
	var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
	var dataURL = canvas.toDataURL("image/" + ext);
	return dataURL.split(',')[1];
}

chrome.extension.onMessage.addListener(function(response, sender, sendResponse){
	response = JSON.parse(response);
	if(response.type == "getma"){
		$("#validateCode").val(response.m.replace(' ',''));
	}
	if(response.type == "refresh"){
		$('#yanzhengma').attr('src', 'validateCodeServlet?t=' + (Math.random() * 10));
	}
});