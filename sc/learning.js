
var studyInfo = {};
var currentCourse = {};
var currentNum = 0;
var isEnd = false;
var coursePos = 0;
var urlpos = 0;

function GetQueryString(url,paras) {  
	var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");  
	var paraObj = {}  
	for (i = 0; j = paraString[i]; i++) {  
		paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);  
	}  
	var returnValue = paraObj[paras.toLowerCase()];  
	if (typeof (returnValue) == "undefined") {  
	    return "";  
	} else {  
	    return returnValue;  
	}  
}  
function timeFormat(nowTime){
	var time = new Date(nowTime);
	var yy = time.getFullYear();
	var m = time.getMonth()+1; //js bug  取出的数从0开始算
	var d = time.getDate();
	var h = time.getHours();
	var mm = time.getMinutes();
	return yy+"年"+m+"月"+d+"日 "+h+"时"+mm+"分";
}

function start(){
	currentCourse = studyInfo.courses[currentNum];
	setTimeout(catEndTime,2000);
	$("#currentTitle").html("    当前课程："+studyInfo.courses[currentNum].title);
	startDjsTimer();
}

function catEndTime(){
	var finishTime = (new Date().getTime()) + (studyInfo.totalTime - studyInfo.studyTime)/0.3*300000;
	$("#finishTime").html("   完成时间:" + timeFormat(finishTime));
}

function startNext(){
	if(currentNum >= studyInfo.courses.length){
		$("#jindu").html("    学习完毕");
		$("title").html("学习完毕");
		return;
	}
	else {
		currentNum++;
		start();
	}
}
function startDjsTimer(){
	var djsTime = studyInfo.djsTime;//倒计时300秒=5分钟;
	$("#djs").html("   倒计时:"+djsTime);
	window.djstimer = setInterval(function () {
		if((studyInfo.studyTime - studyInfo.totalTime) > 0 ) {
			$("#jindu").html("    学习完毕");
			$("title").html("学习完毕");
			stopDjsTimer();
			return;
		}
		djsTime--;	
		$("#djs").html("   倒计时:"+djsTime);
		currentCourse.studytime++;	
		if(currentCourse.studytime >= currentCourse.totaltime){
				sendStudyTime(studyInfo.djsTime-djsTime);
				setTimeout(startNext, 3000);
				stopDjsTimer();
				return;
		}	
		if (djsTime == 0) {		
			djsTime = studyInfo.djsTime;
			sendStudyTime(studyInfo.djsTime);
			stopDjsTimer();
			startDjsTimer();
		}
	}, 1000);
    
}

function stopDjsTimer(){clearInterval(window.djstimer);}

function sendStudyTime(djsTime)
{
	var postData = {
		userid: currentCourse.userid,
        classid: currentCourse.classid,
        courseid: currentCourse.courseid,
        deltatime: djsTime,
        videopos: currentCourse.studytime,
        wareid: currentCourse.wareid
	};
	$.ajax({
            url:'https://service.training.sdufe.edu.cn/home/SetTimePcH5',
            type: "POST",
            data: postData,
            dataType:"json",
            success:function(jsonMessage){
				$("#result").html("课程学习记录成功！");
				setTimeout(getStudyTime,1500);
				setTimeout(catEndTime,2000);
				return;
            },
            error:function(xhr,type,errorThrown){
				$("#result").html("课程学习记录失败！");
            }
        });
}

$(document).ready(function(){
	let courseSelect = "<select id='courseSelect' style='width:420px;height:30px;' ></select>&nbsp;&nbsp;&nbsp;&nbsp;";
	let btn=$("<input type='button' id='studyAuto' style='height:38px;cursor:pointer;' class='btn-orange88x28' value='开始学习'>");
	let djs=$("<span>&nbsp;&nbsp;&nbsp;</span><span id='djs'></span>");
	let jindu = $("<span>&nbsp;&nbsp;&nbsp;</span><span id='jindu'></span><span>&nbsp;&nbsp;&nbsp;</span>");
	let btnExam = $("<input type='button' id='examAuto' style='height:38px;cursor:pointer;' class='btn-orange88x28' value='开始考试'>");
	let finishTime = $("<span>&nbsp;&nbsp;&nbsp;</span><span id='finishTime'></span>");
	let result = $("<span>&nbsp;&nbsp;&nbsp;</span><span id='result'></span>");
	let iframeInfo = '<iframe id="iframeInfo" width="100%" height="200px" src=""  style="display:none"></iframe>';
	let current = $("<span>&nbsp;&nbsp;&nbsp;</span><span id='currentTitle'></span>");
	
    $(".righttitle2").css("height","100px");
	//在学习课程外添加学习按钮，获得userid 和 classid
	$("a").each(function() {
		if ($(this).text() == "学习课程") {
			$(this).parent().append(courseSelect);
			$(this).parent().append(btn);
			$(this).parent().append(djs);
			$(this).parent().append(jindu);
			$(this).parent().append(btnExam);
			$(this).parent().append(djs);
			$(this).parent().append(finishTime);
			$(this).parent().append(result);
			$(this).parent().append(iframeInfo);
			$(this).parent().append(current);
		}
	});
	
	//开始考试
	$("#examAuto").bind("click",function(){
		var thisUrl = window.location.pathname.split('/');
		window.location = window.location.origin + "/Exam/OnlineExam/" + thisUrl[thisUrl.length-1] + "?isSimulation=False";
	});
	
	$("#studyAuto").bind("click",function(){
		
		if(studyInfo.courses.length == 0){
			$("#result").html("您还没有选择课程，请先选择课程！");
			return;
		}
		//初始化学习课程 studyData 数组，classid，vid，studyCount
		start();		
	});
	$("#result").html("课程初始化...");
	init_studyInfo();
	init_classUrl();
	getStudyTime();
});

function init_studyInfo(){
	studyInfo.classUrl = new Array();
	studyInfo.courseUrl = new Array();
	studyInfo.courses = new Array();
	studyInfo.djsTime = 300;
}

function init_classUrl(){
	$(".table").find("table").each(function(){
		studyInfo.classUrl.push($(this).find("a").last().attr("href"));
	});
	if(studyInfo.classUrl.length>0) init_classes(0);
	else $("#result").html("请先选择课程！");
}

function init_classes(urlpos){
	if(urlpos >= studyInfo.classUrl.length) {
		urlpos = 0;
		init_select();
		$("#iframeInfo").attr("src","");
		$("#result").html("课程初始化完毕！");
		return;
	}
	$.get(studyInfo.classUrl[urlpos],function(data){
		studyInfo.courseUrl = new Array();
		$(data).find(".td008").find("a").each(function(){
			let totaltime = timeToSec($(this).parent().prev().prev().text().trim());
			let studytime = timeToSec($(this).parent().prev().text().trim());
			if(studytime >= totaltime) return;
			let title = $(this).parent().prev().prev().prev().prev().text().trim();
			let classRow = {};
			classRow.url = $(this).attr("href");
			classRow.title = title;
			classRow.studytime = studytime;
			classRow.totaltime = totaltime;		
			studyInfo.courseUrl.push(classRow);
		});
		init_course(urlpos,coursePos);
	});
}

function init_course(urlpos,coursePos){
	$("#result").html("正在获取数据，进度：" + coursePos + "/" + studyInfo.courseUrl.length);
	if(coursePos >= studyInfo.courseUrl.length) {
		coursePos = 0;
		urlpos++;
		init_classes(urlpos);
		return;
	}
	
	$("#iframeInfo").attr("src",studyInfo.courseUrl[coursePos].url);
}

window.addEventListener('message',function(event){
	let courseInfo = JSON.parse(event.data);
	if(courseInfo.userid != undefined){
		clearInterval(window.getDataListener);
		courseInfo.studytime = studyInfo.courseUrl[coursePos].studytime;
		courseInfo.totaltime = studyInfo.courseUrl[coursePos].totaltime;
		courseInfo.title = studyInfo.courseUrl[coursePos].title;
		studyInfo.courses.push(courseInfo);
		coursePos++;
		init_course(urlpos,coursePos);
	}
});

function init_select(){
	var selectOptions = "";
    for (var i = 0; i < studyInfo.courses.length; i++) {
        selectOptions += "<option value='" + i + "'>" + studyInfo.courses[i].title + "（时长：" + studyInfo.courses[i].totaltime + "）</option>";
    }
    $("#courseSelect").html(selectOptions);
}

function getStudyTime(){
	$.get(window.location.href,function(data){
		const reg =/[\u4e00-\u9fa5]/g;
		let times = $(data).find("#shdiv tr").eq(0).text().replace(/\s*/g,"").replace(reg, "").replace("：","");
		times = times.split(",");
		if(times.length>0){
			studyInfo.totalTime = parseFloat(times[0]);
			studyInfo.studyTime = parseFloat(times[1]);
			$("#jindu").html("   已完成：" + studyInfo.studyTime);
		}
		else $("#result").html("获取学时失败！");
	});
}

function timeToSec(time){
    let timeArray = time.split(":");
    let hour  = parseInt(timeArray[0])*3600;
    let min = parseInt(timeArray[1])*60;
    let sec = parseInt(timeArray[2]);
    return hour+min+sec;
}
function hz6d_sendACC(){}