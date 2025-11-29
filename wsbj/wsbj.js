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

$(document).ready(function () {
	var currentUrl = window.location.href;
	if (currentUrl.indexOf("onlineClass") != -1) {
		$(".header").remove();
		setTimeout(function () {
			init_baseInfo();
			init_compontent();
			init_alreadystudylist();
            refreshSession();
		}, 1000);
	}
});
function refreshSession(){
	let url =  "/gwapi/dywlxynet/api/user/configure";
    $.post(url);
    setTimeout(refreshSession,60000);
}
function init_baseInfo() {
    baseInfo.year = "2021";
    baseInfo.classId = getQueryVariable("classId");
    baseInfo.recordProgress = 10;
    baseInfo.getTotalHours = function () {
        var postData = {
            userId: baseInfo.userInfo.userId,
            classId: baseInfo.classId
        };
        var requestUri = "/api/user/getOutTimeInClass";
        $.ajax({
            url: requestUri,
            type: 'post',
            data: JSON.stringify(postData),
            contentType: 'application/json;charset=utf-8',
            success: function (data) {
                if (typeof (data) != "undefined") {
                    data = data.data;
                    totalTime = data.totalHours;
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
    }
    baseInfo.getUserInfo = function () {
        var requestUri = "/api/user/info";
        $.ajax({
            url: requestUri,
            type: 'post',
            contentType: 'application/json;charset=utf-8',
            async: false,
            success: function (data) {
                if (typeof (data) != "undefined") {
                    baseInfo.userInfo = data.data;
                    baseInfo.getTotalHours();
                }
                else if (data.success == false) setTimeout(baseInfo.getTotalHours, 5000);
                else setTimeout(baseInfo.getUserInfo, 3000);
            }
        });
    }();

    baseInfo.ranStartTime = 270 + Math.round(Math.random() * 60, 0); //4:30 - 5:30 之间
    baseInfo.minEndTime = 30 + Math.round(Math.random() * 30, 0); //每天最晚不超过1：00
    baseInfo.pageSize = 500;
    baseInfo.pagenum = 1;
}


function catEndTime() {
    var totalStudyTime = endTime;
    var getTotalMins = 0;
    var getTotalHoursByEndTime = 0;
    for (var i = currentCourseNum; i < courseList.length; i++) {
        getTotalMins += courseList[i].courseDuration;
        getTotalHoursByEndTime += courseList[i].courseHour;
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
    $(".nav-box").before("<div id='messageContent' style='width:1050px;padding:10px 10px;background-color: #fff;margin: 0 auto;line-height:30px;height:200px;'><div>");
    var lblText = "请选择开始课程：";
    var courseSelect = "<select id='courseSelect' style='width:500px;height:30px;' ></select>&nbsp;&nbsp;&nbsp;&nbsp;";
    var iptTime = "<input type='text' id='iptTime' value='' style='width:40px;height:27px;border: 1px solid;border-radius: 3px;text-align:center;'>&nbsp;&nbsp;&nbsp;&nbsp;";
    var btnStart = "<input type='button' value='开始' id='Start' style='height:30px;width:60px;border: 1px solid;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
    var btnEnd = "<input type='button' value='暂停' id='End' disabled='disabled' style='height:30px;width:60px;border: 1px solid ;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
    $("#messageContent").append("<div>" + lblText + courseSelect + iptTime + btnStart + btnEnd + "</div>");
    $("#Start").bind("click",
        function () {
            init_disable();
            if (validateSet() == false) {
                init_enable();
                return;
            }
            $("#lblresult").html("");
            if (totalTime != -1) {
                endTime = totalTime + parseInt($("#iptTime").val());
                $("#endTime").html(endTime);
            }
            startStudy();
        });
    $("#End").bind("click",
        function () {
            init_enable();
            stopStudy();
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
    $("#lblresult").html("正在初始化，请稍后。。。");
}
function init_alreadystudylist() {
    var postData = {
        classId: baseInfo.classId,
        pageSize: baseInfo.pageSize,
        pageNo: baseInfo.pagenum,
        userId: baseInfo.userInfo.userId
    };
    var requestUri = "/api/onlineClass/getClassCourse";

    $.ajax({
        url: requestUri,
        type: 'post',
        data: JSON.stringify(postData),
        contentType: 'application/json;charset=utf-8',
        success: function (dataSource) {
            if (typeof (dataSource) != "undefined") {
                if (dataSource.data == null) {
                    $("#lblresult").html("课程初始化错误，请刷新页面重试。");
                    return;
                }
                for (var i = 0; i < dataSource.data.length; i++) {
                    if (dataSource.data[i].studySchedule != "1") {
                        var tempCourse = {};
                        tempCourse.courseHour = dataSource.data[i].courseHours;
                        tempCourse.courseId = dataSource.data[i].courseId;
                        tempCourse.courseName = dataSource.data[i].courseName;
                        tempCourse.courseDuration = dataSource.data[i].courseDuration;
                        courseList.push(tempCourse);
                    }

                }

                baseInfo.totalpages =dataSource.totalpages;
                baseInfo.pagenum += 1;

                if (baseInfo.pagenum > baseInfo.totalpages) {
                    baseInfo.pagenum = 1;
                    init_studylist();
                }
                else {
                    init_alreadystudylist();
                    return;
                }
            } else {
                setTimeout(init_alreadystudylist, 3000);
            }
        }
    });
}

function init_studylist() {

    var selectOptions = "";
    for (var i = 0; i < courseList.length; i++) {
        selectOptions += "<option value='" + i + "'>" + courseList[i].courseName + "（时长：" + courseList[i].courseDuration + "分钟|学时：" + courseList[i].courseHour + "）</option>";
    }
    $("#courseSelect").html(selectOptions);
    $("#lblresult").html("数据初始化完毕，可以进行学习了。");
    $("#iptTime").focus();
}
function nextable() {
    if (currentCourseNum >= courseList.length) {
        $("#lblresult").html("所有课程已全部学完。");
        $("title").text(($("title").text() + "-end"));
        return false;
    }
    if (totalTime >= endTime) {
        $("#lblresult").html("已学够结束学时，学习停止。");
        $("title").text(($("title").text() + "-" + baseInfo.userInfo.name));
        stopStudy();
        return false;
    }
    if ($("#End").attr("disabled") == "disabled") return false;
    //今天学够学时
    if (maFlag == true) return false;
    return true;
}
function startNext() {
    if (nextable() == false) return;
    studyCount = 0;
    currentPlayTime = 0;
    currentCourseNum++;
    preProject = project;
    baseInfo.getTotalHours();
	//判断当前时间，如果当前时间处于 凌晨12：30 - 4：30，暂停学习
	delayToStudyNext();
}
function startStudy() {
    currentCourse = courseList[currentCourseNum];
    currentTotalTime = currentCourse.courseDuration * 60;
    project = currentCourse;
    setTimeout(catEndTime, 3000);
    addTimeCount();
}
function addTimeCount() {
    $("#lblCurrentCourseTitle").html("<font color='red'>" + courseList[currentCourseNum].courseName + "（时长：" + courseList[currentCourseNum].courseDuration + "分钟|学时：" + courseList[currentCourseNum].courseHour + "）</font>");
    var postData = {
        courseId: currentCourse.courseId,
        userId: baseInfo.userInfo.userId
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
    if (currentPlayTime % baseInfo.recordProgress == 0) {
        $("#currentPlayTime").html("<font color='red'>" + studyPercent + "%</font>");
        StudyProgress(currentPlayTime);
    }
    if (currentPlayTime > currentTotalTime + Math.round(Math.random() * 7, 0)) {
        $("#currentPlayTime").html("<font color='red'>" + studyPercent + "%</font>");
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
        courseId: currentCourse.courseId,
        studyTimes: currentPlayTime,
        userId: baseInfo.userInfo.userId
    }
    var requestUri = "/api/study/progress";
    $.ajax({
        url: requestUri,
        type: 'post',
        data: JSON.stringify(postData),
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            console.log(data.success + " 记录学时，当前播放时间:" + currentPlayTime);
        }
    });
}
function updateEnd(currentPlayTime) {
    var postData = {
        courseId: currentCourse.courseId,
        userId: baseInfo.userInfo.userId
    }
    var requestUri = "/api/study/end";
    $.ajax({
        url: requestUri,
        type: 'post',
        data: JSON.stringify(postData),
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (data.success == false && data.message.indexOf("今天学习完成") != -1) {
                maFlag = true;
                $("#lblresult").html("今天学习完成课件的总时长超出100了，明天继续。");
				//延时到明天继续学习。
				delayToStudyNext();
            }
            else console.log(data.success + "播放结束，当前播放时间:" + currentPlayTime);
            baseInfo.getTotalHours();
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