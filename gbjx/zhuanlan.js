//2022.8.13
var baseInfo = {};
var alreayStudyList = [];
var courseList = [];
var preCourseList = [];
var courseSelect = "";
var currentCourse = {};
var currentCourseNum = 0;
var currentTotalTime = 0;
var currentPlayTime = 0;
var totalTime = -1;
var endTime = 0;
var speedTimes = 1;
var studyPercent = 0;
var studyCount = 0;
var tempCourseList = [];
var preProject = {};
var maFlag = true;
var addtimeMaxCount = 20;
var updateendMaxCount = 5;
var addtimeFlagCount = 0;
var addtimeAllCount = 0;
var updateendFlagCount = 0;
var examList = new Array();
var currentExamNum = 0;

$(document).ready(function () {
	setTimeout(function () {
		init_baseInfo();
		init_compontent();
		init_alllist();
	}, 1000);
});

function init_baseInfo() {
	baseInfo.recordProgress = 60;
	baseInfo.userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
	baseInfo.recordProgress = 10;
	baseInfo.classInfo = {};
	baseInfo.classInfo.currentClass = 0;
	baseInfo.classInfo.classId = getQueryVariable("id");

	baseInfo.ranStartTime = 270 + Math.round(Math.random() * 60, 0); //4:30 - 5:30 之间
	baseInfo.minEndTime = 30 + Math.round(Math.random() * 30, 0); //每天最晚不超过1：00
	baseInfo.pageSize = 500;
	baseInfo.pagenum = 0;
}

function catEndTime() {
	var getTotalMins = 0;
	for (var i = currentCourseNum; i < courseList.length; i++) {
		getTotalMins += courseList[i].courseDuration;
	}
	$("#lblEndTime").html(timeFormat(new Date(new Date().setMinutes(new Date().getMinutes() + getTotalMins)).getTime()));

}
function validateSet() {
	$("#lblresult").html("正在验证基础数据。。。");
	if (baseInfo.totalTime == -1) {
		$("#lblresult").html("累计学时没有获取成功，请刷新页面重试。");
		return false;
	}
	return true;
}
function init_disable() {
	$("#Start").attr("disabled", "disabled");
	$("#courseSelect").attr("disabled", "disabled");
	$("#End").removeAttr("disabled");
	//$("#iptTime").attr("disabled", "disabled");
	$("#iptMa").attr("disabled", "disabled");
}
function init_enable() {
	$("#End").attr("disabled", "disabled");
	$("#Start").removeAttr("disabled");
	$("#courseSelect").removeAttr("disabled");
	//$("#iptTime").removeAttr("disabled");	
	$("#iptMa").removeAttr("disabled");
}
function init_compontent() {
	$(".head-parent").html("");
	$(".head-parent").append("<div id='messageContent' style='width:1050px;padding:10px 10px;background-color: #fff;margin: 0 auto;line-height:30px;min-height:500px;'><div>");
	var lblText = "请选择开始课程：";
	var courseSelect = "<select id='courseSelect' style='width:500px;height:30px;' ></select>&nbsp;&nbsp;&nbsp;&nbsp;";
	//var iptTime = "<input type='text' id='iptTime' value='' style='width:40px;height:27px;border: 1px solid;border-radius: 3px;text-align:center;'>&nbsp;&nbsp;&nbsp;&nbsp;";
	var btnStart = "<input type='button' value='开始' id='Start' style='height:30px;width:60px;border: 1px solid;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
	var btnEnd = "<input type='button' value='暂停' id='End' disabled='disabled' style='height:30px;width:60px;border: 1px solid ;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
	var btnExam = "<input type='button' value='考试' id='btnExam' style='height:30px;width:60px;border: 1px solid ;border-radius: 3px;background: #fff;'>";
	$("#messageContent").append("<div>" + lblText + courseSelect + btnStart + btnEnd + btnExam + "</div>");
	$("#Start").bind("click",
		function () {
			init_disable();
			if (validateSet() == false) {
				init_enable();
				return;
			}
			$("#lblresult").html("");
			startStudy();
		});
	$("#End").bind("click",
		function () {
			init_enable();
			stopStudy();
		});
	$("#btnExam").bind("click",
		function () {
			examList = new Array();
			for (var i = 0; i < courseList.length; i++) {
				if (courseList[i].assessementType == "0") {
					examList.push(courseList[i]);
				}
			}
			if (examList.length > 0) {
				var storage = window.localStorage;
				sessionStorage.setItem("examType","zhuanlan");
				window.examListener = setInterval(examListening,5000);
				openExam(examList[currentExamNum]);
			}
			else $("#examResult").html("无考试课程。");
		});

	//选择框变化
	$("#courseSelect").change(function () {
		currentCourseNum = $("#courseSelect option:selected").val();
		$("#lblCurrentCourseTitle").html("<font color='red'>" + $("#courseSelect option:selected").text() + "</font>");
	});
	var lblText2 = "当前学习课程：";
	var lblText3 = "</br>当前课程学习进度：";
	var lblText4 = "</br>累计学时：";
	var lblCurrentCourseTitle = "<label id='lblCurrentCourseTitle'></label>";
	var currentPlayTime = "<label id='currentPlayTime'></label>";
	var lblTotalTime = "<label id='lblTotalTime'></label>&nbsp;&nbsp;&nbsp;<label id='endTime'></label>";
	var lblEndTime = "&nbsp;&nbsp;&nbsp;&nbsp;预计完成：<label id='lblEndTime'></label>";
	var lblresult = "<label id='lblresult' style='color:red'></label>";
	var examResult = "&nbsp;&nbsp;&nbsp;&nbsp;<label id='examResult' style='color:red'></label>";
	var examFrame = '<iframe id="examFrame" width="100%" height="400" src=""  style="display:none"></iframe>';
	$("#messageContent").append("<div>" + lblText2 + lblCurrentCourseTitle + lblText3 + currentPlayTime + lblText4 + lblTotalTime + lblEndTime + lblresult + examResult + "</div>");
	$("#messageContent").append(examFrame);
	$("#lblCurrentCourseTitle").html("<font color='red'>" + $("#courseSelect option:selected").text() + "</font>");
	$("#messageContent").css("height", "100px");
	$("#courseSelect").change(function () {
		currentCourseNum = $("#courseSelect option:selected").val();
		$("#lblCurrentCourseTitle").html("<font color='red'>" + $("#courseSelect option:selected").text() + "</font>");
	});
	$("#lblresult").html("正在初始化，请稍后。。。");
}

function init_alllist() {

	var postData = {
		subjectId: baseInfo.classInfo.classId,
		pageSize: baseInfo.pageSize,
		pagenum: baseInfo.pagenum,
		idCardHash: baseInfo.userInfo.data.idCardHash
	};
	var requestUri = "/__api/api/subject/queryCourse";

	$.ajax({
		url: requestUri,
		type: 'post',
		data: JSON.stringify(postData),
		contentType: 'application/json;charset=utf-8',
		success: function (dataSource) {
			if (typeof (dataSource) != "undefined") {
				if (dataSource.datalist == null) {
					$("#lblresult").html("初始化学习列表错误，自动重试中。。。");
					setTimeout(init_alllist, 3000);
				}
				//preCourseList = preCourseList.concat(dataSource.datalist);
				for (var i = 0; i < dataSource.datalist.length; i++) {
					if (dataSource.datalist[i].studyStatus != "2") {
						courseList.push(dataSource.datalist[i]);
					}
				}

				baseInfo.totalpages = dataSource.totalpages;
				baseInfo.pagenum += 1;
				if (baseInfo.pagenum >= baseInfo.totalpages) {
					baseInfo.pagenum = 0;
					init_studylist();
				}
				else {
					init_alllist();
					return;
				}
			} else {
				setTimeout(init_alllist(), 3000);
			}
		}
	});
}

function init_studylist() {
	courseList = bubbleSort(courseList)
	var selectOptions = "";
	for (var i = 0; i < courseList.length; i++) {
		selectOptions += "<option value='" + i + "'>" + courseList[i].name + "（时长：" + courseList[i].showCourseDuration + "分钟|学时：" + courseList[i].creditHour + "）</option>";
	}
	$("#courseSelect").html(selectOptions);
	totalTime = 0;
	//baseInfo.getTotalHours();
	$("#lblresult").html("数据初始化完毕，可以进行学习了。");
	//$("#iptTime").focus();
}
function nextable() {
	if (currentCourseNum >= courseList.length) {
		$("#lblresult").html("所有课程已全部学完。");
		return false;
	}
	if ($("#End").attr("disabled") == "disabled") return false;
	//今天学够学时
	if (maFlag == false) return false;
	return true;
}
function startNext() {
	if (nextable() == false) return;
	studyCount = 0;
	currentPlayTime = 0;
	currentCourseNum++;
	preProject = project;
	startStudy();
}
function startStudy() {
	currentCourse = courseList[currentCourseNum];
	currentTotalTime = currentCourse.courseDuration * 60;
	project = currentCourse;
	totalTime = 0;
	//baseInfo.getTotalHours();
	setTimeout(catEndTime, 3000);
	addTimeCount();
}
function addTimeCount() {
	$("#lblCurrentCourseTitle").html("<font color='red'>" + courseList[currentCourseNum].name + "（时长：" + courseList[currentCourseNum].courseDuration + "分钟|学时：" + courseList[currentCourseNum].creditHour + "）</font>");
	var postData = {
		courseId: currentCourse.id,
		idCardHash: baseInfo.userInfo.data.idCardHash,
		studyType: "VIDEO"
	}
	var requestUri = "/api/study/start";

	$.ajax({
		url: requestUri,
		type: 'post',
		data: JSON.stringify(postData),
		contentType: 'application/json;charset=utf-8',
		success: function (data) {
			console.log("begin");
			if (data.success == true) {
				if (addtimeFlagCount > 0) {
					addtimeFlagCount = 0;
					$("#lblresult").html("");
				}
				currentCourse.studyTimes = currentCourse.studyTimes ? currentCourse.studyTimes : 0;
				startStudyProcess();
			}
			else {
				addtimeFlagCount++;
				if (addtimeFlagCount < addtimeMaxCount) {
					setTimeout(addTimeCount, 5000);
					$("#lblresult").html("当前学习课程没有记录，正在重试。。。");
				}
				else {
					addtimeFlagCount = 0;
					addtimeAllCount++;
					startNext();
				}

			}
		},
		error: function () {
			addtimeFlagCount++;
			if (addtimeFlagCount < addtimeMaxCount) {
				setTimeout(addTimeCount, 5000);
				$("#lblresult").html("当前学习课程没有记录，正在重试。。。");
			}
			else {
				addtimeFlagCount = 0;
				addtimeAllCount++;
				startNext();
			}
		}
	});
}
function startStudyProcess() {
	if (nextable() == false) {
		stopStudy();
		return;
	}
	studyCount++;
	currentPlayTime += speedTimes;
	studyPercent = parseInt(currentPlayTime / currentTotalTime * 100) == 100 ? 100 : parseInt(currentPlayTime / currentTotalTime * 100);
	$("#currentPlayTime").html("<font color='red'>" + studyPercent + "%</font>");
	if (currentPlayTime % baseInfo.recordProgress == 0) {
		StudyProgress(currentPlayTime);
	}
	if (currentPlayTime > currentTotalTime + Math.round(Math.random() * 7, 0)) {
		studyCount = 0;
		currentPlayTime = 0;
		preProject = project;
		updateEnd(currentPlayTime);
		setTimeout(startNext, 3000);
		return;
	}
	else setTimeout(startStudyProcess, 1000);
}
function StudyProgress(currentPlayTime) {
	var postData = {
		courseId: currentCourse.id,
		studyTimes: currentPlayTime,
		idCardHash: baseInfo.userInfo.data.idCardHash
	}
	var requestUri = "/__api/api/study/progress";
	$.ajax({
		url: requestUri,
		type: 'post',
		data: JSON.stringify(postData),
		contentType: 'application/json;charset=utf-8',
		beforeSend: function(xhr){
			xhr.setRequestHeader("Accept","application/json, text/plain, */*");
		},
		success: function (data) {
			console.log(data.success + " 记录学时，当前播放时间:" + currentPlayTime);
		}
	});
}
function updateEnd(currentPlayTime) {
	var postData = {
		courseId: currentCourse.id,
		idCardHash: baseInfo.userInfo.data.idCardHash,
	}
	var requestUri = "/__api/api/study/v2/end";
	$.ajax({
		url: requestUri,
		type: 'post',
		data: JSON.stringify(postData),
		contentType: 'application/json;charset=utf-8',
		success: function (data) {
			if (data.success == false && data.message.indexOf("今天学习完成") != -1) {
				maFlag = false;
				$("#lblresult").html("今天学习完成课件的总时长超出100了，明天继续。");
				//延时到明天6:00 - 6:20继续学习。
				var oldTime = new Date().getDate();
				delayToStudyNext(oldTime);
			}
			else if (data.success == false) {
				$("#lblresult").html("学时记录错误。");
			}
			else console.log(data.success + "播放结束，当前播放时间:" + currentPlayTime);
		}
	});
}
function delayToStudyNext(oldTime) {
	var today = new Date().getDate();
	var hours = new Date().getHours();
	if (today == oldTime || hours < 4) setTimeout(function () { delayToStudyNext(oldTime) }, 60000);
	else {
		maFlag = true;
		var milliseconds = Math.round(Math.random() * 1200000, 0);
		$("#lblresult").html("");
		setTimeout(startStudy, milliseconds);
	}
}
function stopStudy() {
	currentPlayTime = 0;
	studyCount = 0;
	init_enable();
}

function openExam(examCourse) {
	//https://gbwlxy.dtdjzx.gov.cn/content#/examManage/startExam?courseId=3433224931624623655&examId=3433224931331022355&studyStatus=1&examStatus=0&recordStatus=1
	var examUrl = 'https://gbwlxy.dtdjzx.gov.cn/content#/examManage/startExam?examId=' + examCourse.assessementId + '&courseId=' + examCourse.id + '&studyStatus=1&examStatus=0&recordStatus=1' + "?time="+new Date().getTime();
	$("#examFrame").attr("src","");
	setTimeout(function(){$("#examFrame").attr("src",examUrl);},3000);
}

function examListening(){
	$("#examResult").html("当前考试进度：" + currentExamNum + "/" + examList.length);
	var storage = window.localStorage;
	var examType = sessionStorage.getItem("examType");
	if (examType == "nextExam") {
		clearInterval(window.examListener);
		//$("#messageContent").append("<div>考试成绩：<label style='color:red'>" + response.message + "</label></div>");
		var examTime = 20000 + Math.round(Math.random() * 30, 0) * 1000;
		//开始下一个
		currentExamNum += 1;
		if (currentExamNum >= examList.length) {
			$("#btnExam").attr("disabled", "disabled");
			$("#examResult").html("考试全部完成。");
			return;
		}
		else {	
			sessionStorage.setItem("examType","zhuanlan");
			window.examListener = setInterval(examListening,5000);
			setTimeout(function () { 
				openExam(examList[currentExamNum]); 		
			}, examTime);
		}
	}
}
chrome.extension.onMessage.addListener(function (response, sender, sendResponse) {
	response = JSON.parse(response);
	if (response.type == "nextExam") {
		$("#messageContent").append("<div>考试成绩：<label style='color:red'>" + response.message + "</label></div>");
		var examTime = 20000 + Math.round(Math.random() * 30, 0) * 1000;
		//开始下一个
		currentExamNum += 1;
		if (currentExamNum >= examList.length) {
			$("#btnExam").attr("disabled", "disabled");
			return;
		}
		else setTimeout(function () { 
			var storage = window.localStorage;
			storage.setItem("examType","zhuanlan");
			openExam(examList[currentExamNum]); 
		}, examTime);
	}
});
function timeFormat(nowTime) {
	var time = new Date(nowTime);
	var yy = time.getFullYear();
	var m = time.getMonth() + 1;
	var d = time.getDate();
	var h = time.getHours();
	var mm = time.getMinutes();
	return yy + "年" + m + "月" + d + "日 " + h + "时" + mm + "分";
}
function getQueryVariable(variable) {
	var query = location.hash.split('?')[1];
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (pair[0] == variable) { return pair[1]; }
	}
	return (false);
}
//排序
function bubbleSort(studyCourseList){
	var arr = studyCourseList;
	for (var i = 0; i < arr.length - 1; i++) {
        for (var j = 0; j < arr.length - i -1; j++) {   // 这里说明为什么需要-1
			var e_j = arr[j].creditHour / arr[j].courseDuration;
			var e_j1 = arr[j+1].creditHour / arr[j+1].courseDuration;
            if (e_j < e_j1) {
                var temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
	return arr;
}