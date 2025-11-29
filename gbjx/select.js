var host = "https://navasily.github.io";

$(document).ready(function(){
	$("head").append('<meta name="referrer" content="no-referrer"/>');
	//$('head').append('<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">');
	var currentUrl = window.location.href;
	if(currentUrl.indexOf("index") != -1){
		$.get(host + "/ddzz/gbjx/handlecore.js",function(data){
		});
    }
    else if(currentUrl.indexOf("startExam") != -1){
		$.get(host + "/ddzz/gbjx/exam.js",function(data){
		});
    }
    else if(currentUrl.indexOf("title") != -1){
		$.get(host + "/ddzz/gbjx/startexam.js",function(data){
		});
    }
    else if(currentUrl.indexOf("commendIndex") != -1){
		$.get(host + "/ddzz/gbjx/gotoExam.js",function(data){
		});
    }
    else if(currentUrl.indexOf("specialReDetails") != -1){
		$.get(host + "/ddzz/gbjx/zhuanlan.js",function(data){
		});
    }
});
