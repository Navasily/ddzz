//2025.01.14
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
var maFlag = false;
var addtimeMaxCount = 20;
var updateendMaxCount = 5;
var addtimeFlagCount = 0;
var addtimeAllCount = 0;
var updateendFlagCount = 0;
var examList = new Array();
var currentExamNum = 0;
var host = "https://navasily.github.io";

$(document).ready(function () {
	setTimeout(function () {
		init_baseInfo();
		init_compontent();
		//init_alreadystudylist();
		setInterval("keepState()",60000);
	}, 1000);
});

function keepState(){
	$.post("__api/api/getTrainee",function(){});
}

function setHeader(config){
    var headerConfig = {};
    headerConfig.KEY = "ac620187e5b8d7af";
    headerConfig.NONCE = guid();
    headerConfig.TIMESTAMP = (new Date).getTime();
    headerConfig.SIGNATURE = ("V1" + S(headerConfig.TIMESTAMP + headerConfig.NONCE + "e8f5e56d7b67b997")).toUpperCase();
    return headerConfig;
}

function init_baseInfo() {
	baseInfo.recordProgress = 60;
	baseInfo.userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
	baseInfo.classInfo = {};
	baseInfo.classInfo.classlist = new Array();
	baseInfo.classInfo.exClass = new Array();
	baseInfo.classInfo.microClass = new Array();
	baseInfo.classInfo.currentClass = 0;
	baseInfo.getclassInfo = function () {
		$.get(host + '/ddzz/gbjx/gblist', function (data) {
			baseInfo.classInfo.classlist = eval(data);
			if (baseInfo.classInfo.classlist.length == 0) {
				$("#lblresult").html("初始化专题班课程错误.");
				return;
			}
		});
	};
	baseInfo.classInfo.getExClass = function () {
		$.get(host + '/ddzz/gbjx/exclass', function (data) {
			baseInfo.classInfo.exClass = eval(data);
			if (baseInfo.classInfo.exClass.length == 0) {
				$("#lblresult").html("初始化额外课程错误.");
				return;
			}
		});
	};
    baseInfo.classInfo.getMicroClass = function(){
		$.get(host + '/ddzz/gbjx/microclass', function (data) {
			baseInfo.classInfo.microClass = eval(data);
			if (baseInfo.classInfo.microClass.length == 0) {
				$("#lblresult").html("初始化额外课程错误.");
				return;
			}
		});
    };
	baseInfo.getTotalHours = function () {
		var postData = {
			year: 2025,
			idCardHash: baseInfo.userInfo.data.idCardHash
		};
		var requestUri = "/__api/api/personal/totalStatistics";
		$.ajax({
			url: requestUri,
			type: 'post',
			data: JSON.stringify(postData),
			contentType: 'application/json;charset=utf-8',
			success: function (data) {
				if (typeof (data) != "undefined") {
					totalTime = data.data.totalHours;
                    $("#lblTotalTime").html("<font color='red'>" + totalTime + "</font>");
					$("title").text(totalTime);
				}
				else if (data.success == false) setTimeout(baseInfo.getTotalHours, 5000);
				else setTimeout(baseInfo.getTotalHours, 5000);
			},
			error: function () {
				setTimeout(baseInfo.getTotalHours, 5000);
			}
		});
	};

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
	$("#iptTime").attr("disabled", "disabled");
	$("#iptMa").attr("disabled", "disabled");
}
function init_enable() {
	$("#End").attr("disabled", "disabled");
	$("#Start").removeAttr("disabled");
	$("#courseSelect").removeAttr("disabled");
	$("#iptTime").removeAttr("disabled");	
	$("#iptMa").removeAttr("disabled");
}
function init_compontent() {
	$(".head-parent").html("");
	$(".head-parent").append("<div id='messageContent' style='width:1050px;padding:10px 10px;background-color: #fff;margin: 0 auto;line-height:30px;min-height:150px;'><div>");
	var lblText = "请选择开始课程：";
	var courseSelect = "<select id='courseSelect' style='width:500px;height:30px;' ></select>&nbsp;&nbsp;&nbsp;&nbsp;";
	var iptTime = "<input type='text' id='iptTime' value='' style='width:40px;height:27px;border: 1px solid;border-radius: 3px;text-align:center;'>&nbsp;&nbsp;&nbsp;&nbsp;";
	var btnStart = "<input type='button' value='开始' id='Start' style='height:30px;width:60px;border: 1px solid;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
	var btnEnd = "<input type='button' value='暂停' id='End' disabled='disabled' style='height:30px;width:60px;border: 1px solid ;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
	var btnExam = "<input type='button' value='考试' id='btnExam' style='height:30px;width:60px;border: 1px solid ;border-radius: 3px;background: #fff;'>";

	$("#messageContent").append("<div>" + lblText + courseSelect + iptTime + btnStart + btnEnd + btnExam + "</div>");
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
				if (courseList[i].examStatus == "0") {
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
	$("#messageContent").append("<div>" + lblText2 + lblCurrentCourseTitle + lblText3 + currentPlayTime + lblText4 + lblTotalTime + lblEndTime + lblresult + "</div>");
	$("#lblCurrentCourseTitle").html("<font color='red'>" + $("#courseSelect option:selected").text() + "</font>");
	$("#messageContent").css("height", "100px");
	$("#courseSelect").change(function () {
		currentCourseNum = $("#courseSelect option:selected").val();
		$("#lblCurrentCourseTitle").html("<font color='red'>" + $("#courseSelect option:selected").text() + "</font>");
	});
	//添加额外课程
	var gwyf = "<input type='checkbox' id='gwyf' />专题";
	var gwyfIds = "&nbsp;&nbsp;&nbsp;&nbsp;<input type='text' id='gwyfIds' value='' style='width:200px;height:27px;border: 1px solid;border-radius: 3px;text-align:center;'>&nbsp;&nbsp;&nbsp;&nbsp;";
	$("#messageContent").append(gwyf + gwyfIds);
    //添加微课
    var microClass = "<input type='checkbox' id='microClass' />普通课程";
	$("#messageContent").append(microClass);
	var examResult = "&nbsp;&nbsp;&nbsp;&nbsp;<label id='examResult' style='color:red'></label>";
	$("#messageContent").append(examResult);
	
	var examFrame = '<iframe id="examFrame" width="100%" height="400" src=""  style="display:none"></iframe>';
	$("#messageContent").append(examFrame);
	
	$("#gwyf").bind("click", function () {
/* 		$(baseInfo.classInfo.getExClass()).promise().done(function (data) {
			//console.log(baseInfo.classInfo.exClass.length);
		}); */
		if($("#gwyfIds").val() == "") $("#lblresult").html("请输入专题ID，以“,”为分割。");
		init_alreadystudylist("gwyf");
	});

	$("#microClass").bind("click", function () {
/* 		$(baseInfo.classInfo.getMicroClass()).promise().done(function (data) {
		}); */
		init_alreadystudylist("microClass");
	});
	$("#lblresult").html("窗口初始化完毕。");
}

function init_alreadystudylist(classType) {
/* 	if (baseInfo.classInfo.classlist.length == 0) {
		setTimeout(baseInfo.getclassInfo, 2000);
		setTimeout(init_alreadystudylist, 2000);
		$("#lblresult").html("初始化专题班课程错误.正在重试。");
		return;
	} */
	var postData = {
		studyType: "VIDEO",
		pageSize: baseInfo.pageSize,
		pagenum: baseInfo.pagenum,
		year: 2023,
		idCardHash: baseInfo.userInfo.data.idCardHash,
		studyStatus: "2"
	};
	var requestUri = "https://gbwlxy.dtdjzx.gov.cn/__api/api/personal/myCourses";

	$.ajax({
		url: requestUri,
		type: 'post',
		data: JSON.stringify(postData),
		contentType: 'application/json;charset=utf-8',
		success: function (dataSource) {
			if (typeof (dataSource) != "undefined") {
				if (dataSource.datalist == null) {
					init_alllist(classType);
					return;
				}

				alreayStudyList = alreayStudyList.concat(dataSource.datalist);
				baseInfo.totalpages = dataSource.totalpages;
				baseInfo.pagenum += 1;
				$("#lblresult").html("正在获取已学课程。" + baseInfo.pagenum+ "/" + dataSource.totalpages);
				if (baseInfo.pagenum >= baseInfo.totalpages) {
					baseInfo.pagenum = 0;
					init_alllist(classType);
				}
				else {
					init_alreadystudylist(classType);
					return;
				}
				
			} else {
				setTimeout(function(){init_alreadystudylist(classType)}, 3000);
			}
		}
	});
}

function init_alllist(classType) {

	var postData = {};
	var requestUri = "";
	if(classType == "gwyf"){
		requestUri = "/__api/api/study/my/courses";
		baseInfo.classInfo.classlist = $("#gwyfIds").val().split(",");
		postData = {
			isCompulsory: "",
			pageSize: baseInfo.pageSize,
			pagenum: baseInfo.pagenum,
			tbtpId: baseInfo.classInfo.classlist[baseInfo.classInfo.currentClass],
			idCardHash: baseInfo.userInfo.data.idCardHash
		};
	}
	else {
		requestUri = "/__api/api/portal/course/getPageByCategory";
		postData = {
			pageSize: baseInfo.pageSize,
			pagenum: baseInfo.pagenum,
			name:""
		};
	}

	$.ajax({
		url: requestUri,
		type: 'post',
		data: JSON.stringify(postData),
		contentType: 'application/json;charset=utf-8',
		success: function (dataSource) {
			if (typeof (dataSource) != "undefined") {
				if (dataSource.datalist == null) {
					$("#lblresult").html("初始化学习列表错误，自动重试中。。。");
					setTimeout(function(){init_alllist(classType)}, 3000);
				}
				if(classType == "gwyf"){
					preCourseList = preCourseList.concat(dataSource.datalist);
				}
				else{
					for(var i=0;i<dataSource.datalist.length;i++){
						if(dataSource.datalist[i].showStatusMsg == "未学习"){
							if(dataSource.datalist[i].assessementType != "0" &&dataSource.datalist[i].resourceType == "VIDEO"){
								preCourseList.push(dataSource.datalist[i]);
							}
						}
					}
				}

				baseInfo.totalpages = dataSource.totalpages;
				baseInfo.pagenum += 1;
				$("#lblresult").html("正在获取全部课程。" + baseInfo.pagenum + "/" + dataSource.totalpages);
				if (baseInfo.pagenum >= baseInfo.totalpages) {
					baseInfo.pagenum = 0;
					if(classType != "gwyf"){ 
						init_studylist(); 
						return;
					}
					baseInfo.classInfo.currentClass += 1;
				}
				else {
					init_alllist(classType);
					return;
				}

				if (baseInfo.classInfo.currentClass >= baseInfo.classInfo.classlist.length) {
					baseInfo.classInfo.currentClass = 0;
					init_studylist();
				}
				else setTimeout(function(){init_alllist(classType)}, 3000);

			} else {
				setTimeout(function(){init_alllist(classType)}, 3000);
			}
		},
		error: function (err) {
			setTimeout(function(){init_alllist(classType)}, 3000);
		}
	});
}

function init_studylist() {
	for (var i = 0; i < preCourseList.length; i++) {
		var isAdd = false;
		for (var j = 0; j < alreayStudyList.length; j++) {
			if (preCourseList[i].id == alreayStudyList[j].courseId) {
				alreayStudyList.splice(j, 1);
				isAdd = true;
				break;
			}
		}
		if (isAdd == false) {
			courseList.push(preCourseList[i]);
		}
	}
	courseList = bubbleSort(courseList);
	var selectOptions = "";
	for (var i = 0; i < courseList.length; i++) {
		selectOptions += "<option value='" + i + "'>" + courseList[i].name + "（时长：" + courseList[i].showCourseDuration + "分钟|学时：" + courseList[i].creditHour + "）</option>";
	}
	$("#courseSelect").html(selectOptions);
	totalTime = 0;
	baseInfo.getTotalHours();
	$("#lblresult").html("数据初始化完毕，可以进行学习了。");
	$("#iptTime").focus();
}
function nextable() {
	if (currentCourseNum >= courseList.length) {
		$("#lblresult").html("所有课程已全部学完。");
		return false;
	}
	if ($("#End").attr("disabled") == "disabled") return false;
	//今天学够学时
	if (maFlag == true) return false;
    //学够52学时
    if(totalTime >= parseInt($("#iptTime").val())) return false;
	return true;
}
function startNext() {
	if (nextable() == false) return;
	studyCount = 0;
	currentPlayTime = 0;
	currentCourseNum++;
	preProject = project;
	//startStudy();
	//判断当前时间，如果当前时间处于 凌晨12：30 - 4：30，暂停学习
	delayToStudyNext();
}
function startNext2() {
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
	baseInfo.getTotalHours();
	setTimeout(catEndTime, 3000);
	isStudy();
}
function isStudy(){
	$("#lblCurrentCourseTitle").html("<font color='red'>" + courseList[currentCourseNum].name + "（时长：" + courseList[currentCourseNum].courseDuration + "分钟|学时：" + courseList[currentCourseNum].creditHour + "）</font>");
	var postData = {
		courseId: currentCourse.id || currentCourse.courseId,
		idCardHash: baseInfo.userInfo.data.idCardHash
	}
	var requestUri = "/__api/api/course/web/get";

	$.ajax({
		url: requestUri,
		type: 'post',
		data: JSON.stringify(postData),
		contentType: 'application/json;charset=utf-8',
		beforeSend: function(xhr){
           xhr.setRequestHeader("Accept","application/json, text/plain, */*");
       },
		success: function (data) {
			if (data.success == true) {
				if (addtimeFlagCount > 0) {
					addtimeFlagCount = 0;
					$("#lblresult").html("");
				}
				if(data.data.studyStatus == "2"){
					$("#lblresult").html("当前课程已学习，开始下一个。");
					startNext2();
				}
				else addTimeCount();
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
function addTimeCount() {
	$("#lblCurrentCourseTitle").html("<font color='red'>" + courseList[currentCourseNum].name + "（时长：" + courseList[currentCourseNum].courseDuration + "分钟|学时：" + courseList[currentCourseNum].creditHour + "）</font>");
	var postData = {
		courseId: currentCourse.id || currentCourse.courseId,
		idCardHash: baseInfo.userInfo.data.idCardHash,
		studyType: "VIDEO"
	}
	var requestUri = "/__api/api/study/start";

	$.ajax({
		url: requestUri,
		type: 'post',
		data: JSON.stringify(postData),
		contentType: 'application/json;charset=utf-8',
		beforeSend: function(xhr){
           xhr.setRequestHeader("Accept","application/json, text/plain, */*");
       },
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
	if (currentPlayTime > currentTotalTime - 10) {
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
		courseId: currentCourse.id || currentCourse.courseId,
		studyTimes: currentPlayTime,
		idCardHash: baseInfo.userInfo.data.idCardHash
	}
	var requestUri = "/__api/api/study/progress";
	$.ajax({
		url: requestUri,
		type: 'post',
		async: false,
		data: JSON.stringify(postData),
		contentType: 'application/json;',
		beforeSend: function(xhr){
			xhr.setRequestHeader("Accept","application/json, text/plain, */*");
		},
		success: function (data) {
			console.log(data.success + " 记录学时，当前播放时间:" + currentPlayTime);
		}
	});
	var requestUri2 = "/apiStudy/gwapi/us/api/study/progress2";
	var headerConfig = setHeader(baseInfo.userConfig);
	postData = {
		courseCode: currentCourse.id || currentCourse.courseId,
		studyTimes: currentPlayTime,
		userId: baseInfo.userInfo.data.idCardHash
	}
	// $.ajax({
	// 	url: requestUri2,
	// 	type: 'post',
	// 	async: false,
	// 	data: JSON.stringify(postData),
	// 	contentType: 'application/json;charset=utf-8',
	// 	beforeSend: function(xhr){
    //        xhr.setRequestHeader("Accept","application/json, text/plain, */*");
    //        xhr.setRequestHeader("X-CA-KEY",headerConfig.KEY);
    //        xhr.setRequestHeader("X-CA-SIGNATURE",headerConfig.SIGNATURE);
    //        xhr.setRequestHeader("X-CA-TIMESTAMP",headerConfig.TIMESTAMP);
    //        xhr.setRequestHeader("X-CA-NONCE",headerConfig.NONCE);
    //    },
	// 	success: function (data) {
	// 		console.log(data.success + " 记录学时，当前播放时间:" + currentPlayTime);
	// 	}
	// });
}
function updateEnd(currentPlayTime) {
	var postData = {
		courseId: currentCourse.id || currentCourse.courseId,
		idCardHash: baseInfo.userInfo.data.idCardHash,
	}
	var requestUri = "/__api/api/study/v2/end";
	$.ajax({
		url: requestUri,
		type: 'post',
		data: JSON.stringify(postData),
		contentType: 'application/json;charset=utf-8',
		beforeSend: function(xhr){
           xhr.setRequestHeader("Accept","application/json, text/plain, */*");
       },
		success: function (data) {
			if (data.success == false && data.message.indexOf("今天学习完成") != -1) {
				maFlag = true;
				$("#lblresult").html("今天学习完成课件的总时长超出100了，明天继续。");
				//延时到明天6:00 - 6:20继续学习。
				delayToStudyNext();
			}
			else if (data.success == false) {
				$("#lblresult").html("学时记录错误。");
			}
			else console.log(data.success + "播放结束，当前播放时间:" + currentPlayTime);
		}
	});
}
function delayToStudyNext() {
	var mins = (new Date().getHours()) * 60 + new Date().getMinutes();
	if (mins > 180 && mins < 182) {
		baseInfo.ranStartTime = 270 + Math.round(Math.random() * 60, 0); //4:30 - 5:30 之间
		baseInfo.minEndTime = 30 + Math.round(Math.random() * 30, 0); //每天最晚不超过1：00
	}
	if (mins < baseInfo.ranStartTime && mins > baseInfo.minEndTime) {
		$("#lblresult").html("时间太晚，暂停学习。");
		maFlag = false;
		setTimeout(delayToStudyNext, 60000);
	}
	else {
		if (maFlag == true) {
			setTimeout(delayToStudyNext, 60000);
		}
		else {
			var milliseconds = 20000 + Math.round(Math.random() * 30000, 0);
			$("#lblresult").html("等待" + milliseconds / 1000 + "秒");
			setTimeout(function () {
				$("#lblresult").html("");
				startStudy();
			}, milliseconds);
		}
	}
}
function stopStudy() {
	currentPlayTime = 0;
	studyCount = 0;
	init_enable();
}

function openExam(examCourse) {
    //https://gbwlxy.dtdjzx.gov.cn/content#/examManage/startExam?examId=3612721963337786269&courseId=3612721965711768650&studyStatus=0&examStatus=0&recordStatus=0
	var examUrl = 'https://gbwlxy.dtdjzx.gov.cn/content#/examManage/startExam?examId=' + examCourse.examId + '&courseId=' + examCourse.courseId + '&studyStatus=0&examStatus=0&recordStatus=0' + "?time="+new Date().getTime();
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

function guid() {
    function e() {
        return (65536 * (1 + Math.random()) | 0).toString(16).substring(1);
    }
    return e() + e() + "-" + e() + "-" + e() + "-" + e() + "-" + e() + e() + e()
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
//加密
function C(t) {
	t = t || 32;
	const e = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678"
	  , n = e.length;
	let i = "";
	for (let r = 0; r < t; r++)
		i += e.charAt(Math.floor(Math.random() * n));
	return i;
}

function o(t, e) {
    var n = (65535 & t) + (65535 & e)
      , i = (t >> 16) + (e >> 16) + (n >> 16);
    return i << 16 | 65535 & n
}
function a(t, e) {
    return t << e | t >>> 32 - e
}
function s(t, e, n, i, r, s) {
    return o(a(o(o(e, t), o(i, s)), r), n)
}
function l(t, e, n, i, r, o, a) {
    return s(e & n | ~e & i, t, e, r, o, a)
}
function u(t, e, n, i, r, o, a) {
    return s(e & i | n & ~i, t, e, r, o, a)
}
function c(t, e, n, i, r, o, a) {
    return s(e ^ n ^ i, t, e, r, o, a)
}
function h(t, e, n, i, r, o, a) {
    return s(n ^ (e | ~i), t, e, r, o, a)
}
function d(t, e) {
	var n, i, r, a, s;
	t[e >> 5] |= 128 << e % 32,
	t[14 + (e + 64 >>> 9 << 4)] = e;
	var d = 1732584193
	  , p = -271733879
	  , f = -1732584194
	  , g = 271733878;
	for (n = 0; n < t.length; n += 16)
		i = d,
		r = p,
		a = f,
		s = g,
		d = l(d, p, f, g, t[n], 7, -680876936),
		g = l(g, d, p, f, t[n + 1], 12, -389564586),
		f = l(f, g, d, p, t[n + 2], 17, 606105819),
		p = l(p, f, g, d, t[n + 3], 22, -1044525330),
		d = l(d, p, f, g, t[n + 4], 7, -176418897),
		g = l(g, d, p, f, t[n + 5], 12, 1200080426),
		f = l(f, g, d, p, t[n + 6], 17, -1473231341),
		p = l(p, f, g, d, t[n + 7], 22, -45705983),
		d = l(d, p, f, g, t[n + 8], 7, 1770035416),
		g = l(g, d, p, f, t[n + 9], 12, -1958414417),
		f = l(f, g, d, p, t[n + 10], 17, -42063),
		p = l(p, f, g, d, t[n + 11], 22, -1990404162),
		d = l(d, p, f, g, t[n + 12], 7, 1804603682),
		g = l(g, d, p, f, t[n + 13], 12, -40341101),
		f = l(f, g, d, p, t[n + 14], 17, -1502002290),
		p = l(p, f, g, d, t[n + 15], 22, 1236535329),
		d = u(d, p, f, g, t[n + 1], 5, -165796510),
		g = u(g, d, p, f, t[n + 6], 9, -1069501632),
		f = u(f, g, d, p, t[n + 11], 14, 643717713),
		p = u(p, f, g, d, t[n], 20, -373897302),
		d = u(d, p, f, g, t[n + 5], 5, -701558691),
		g = u(g, d, p, f, t[n + 10], 9, 38016083),
		f = u(f, g, d, p, t[n + 15], 14, -660478335),
		p = u(p, f, g, d, t[n + 4], 20, -405537848),
		d = u(d, p, f, g, t[n + 9], 5, 568446438),
		g = u(g, d, p, f, t[n + 14], 9, -1019803690),
		f = u(f, g, d, p, t[n + 3], 14, -187363961),
		p = u(p, f, g, d, t[n + 8], 20, 1163531501),
		d = u(d, p, f, g, t[n + 13], 5, -1444681467),
		g = u(g, d, p, f, t[n + 2], 9, -51403784),
		f = u(f, g, d, p, t[n + 7], 14, 1735328473),
		p = u(p, f, g, d, t[n + 12], 20, -1926607734),
		d = c(d, p, f, g, t[n + 5], 4, -378558),
		g = c(g, d, p, f, t[n + 8], 11, -2022574463),
		f = c(f, g, d, p, t[n + 11], 16, 1839030562),
		p = c(p, f, g, d, t[n + 14], 23, -35309556),
		d = c(d, p, f, g, t[n + 1], 4, -1530992060),
		g = c(g, d, p, f, t[n + 4], 11, 1272893353),
		f = c(f, g, d, p, t[n + 7], 16, -155497632),
		p = c(p, f, g, d, t[n + 10], 23, -1094730640),
		d = c(d, p, f, g, t[n + 13], 4, 681279174),
		g = c(g, d, p, f, t[n], 11, -358537222),
		f = c(f, g, d, p, t[n + 3], 16, -722521979),
		p = c(p, f, g, d, t[n + 6], 23, 76029189),
		d = c(d, p, f, g, t[n + 9], 4, -640364487),
		g = c(g, d, p, f, t[n + 12], 11, -421815835),
		f = c(f, g, d, p, t[n + 15], 16, 530742520),
		p = c(p, f, g, d, t[n + 2], 23, -995338651),
		d = h(d, p, f, g, t[n], 6, -198630844),
		g = h(g, d, p, f, t[n + 7], 10, 1126891415),
		f = h(f, g, d, p, t[n + 14], 15, -1416354905),
		p = h(p, f, g, d, t[n + 5], 21, -57434055),
		d = h(d, p, f, g, t[n + 12], 6, 1700485571),
		g = h(g, d, p, f, t[n + 3], 10, -1894986606),
		f = h(f, g, d, p, t[n + 10], 15, -1051523),
		p = h(p, f, g, d, t[n + 1], 21, -2054922799),
		d = h(d, p, f, g, t[n + 8], 6, 1873313359),
		g = h(g, d, p, f, t[n + 15], 10, -30611744),
		f = h(f, g, d, p, t[n + 6], 15, -1560198380),
		p = h(p, f, g, d, t[n + 13], 21, 1309151649),
		d = h(d, p, f, g, t[n + 4], 6, -145523070),
		g = h(g, d, p, f, t[n + 11], 10, -1120210379),
		f = h(f, g, d, p, t[n + 2], 15, 718787259),
		p = h(p, f, g, d, t[n + 9], 21, -343485551),
		d = o(d, i),
		p = o(p, r),
		f = o(f, a),
		g = o(g, s);
	return [d, p, f, g]
}
function p(t) {
	var e, n = "", i = 32 * t.length;
	for (e = 0; e < i; e += 8)
		n += String.fromCharCode(t[e >> 5] >>> e % 32 & 255);
	return n
}
function f(t) {
	var e, n = [];
	for (n[(t.length >> 2) - 1] = void 0,
	e = 0; e < n.length; e += 1)
		n[e] = 0;
	var i = 8 * t.length;
	for (e = 0; e < i; e += 8)
		n[e >> 5] |= (255 & t.charCodeAt(e / 8)) << e % 32;
	return n
}
function g(t) {
	return p(d(f(t), 8 * t.length))
}
function m(t, e) {
	var n, i, r = f(t), o = [], a = [];
	for (o[15] = a[15] = void 0,
	r.length > 16 && (r = d(r, 8 * t.length)),
	n = 0; n < 16; n += 1)
		o[n] = 909522486 ^ r[n],
		a[n] = 1549556828 ^ r[n];
	return i = d(o.concat(f(e)), 512 + 8 * e.length),
	p(d(a.concat(i), 640))
}
function v(t) {
	var e, n, i = "0123456789abcdef", r = "";
	for (n = 0; n < t.length; n += 1)
		e = t.charCodeAt(n),
		r += i.charAt(e >>> 4 & 15) + i.charAt(15 & e);
	return r
}
function y(t) {
	return unescape(encodeURIComponent(t))
}
function _(t) {
	return g(y(t))
}
function b(t) {
	return v(_(t))
}
function x(t, e) {
	return m(y(t), y(e))
}
function w(t, e) {
	return v(x(t, e))
}
function S(t, e, n) {
	return e ? n ? x(e, t) : w(e, t) : n ? _(t) : b(t)
}