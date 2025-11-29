//mainCode

var studyInfo = {};
var baseInfo = {};
var currentCourse = {};
var stop = false;
var newTabId = 0;

function init_studyInfo() {
    studyInfo.courseList = new Array();
    studyInfo.currentNum = 0;
    studyInfo.endNum = 0;
    studyInfo.bixiu = {};
    studyInfo.bixiu.listUrl = "/leader-app-pc/api/study/list";
    studyInfo.bixiu.detailUrl = "/leader-course-api/plan/course/v1/list/with/detail";
    studyInfo.bixiu.studyUrl = "/leader-course-api/plan/course/v1/period/study";
    studyInfo.bixiu.actionUrl = "/leader-collect-api/study/1/action";
    studyInfo.bixiu.scheduleUrl = "/leader-collect-api/study/1/schedule";

    studyInfo.xuanxiu = {};
    studyInfo.xuanxiu.listUrl = "/leader-course-api/open/course/v1/list";
    studyInfo.xuanxiu.detailUrl = "/leader-course-api/open/course/v1/detail";
    studyInfo.xuanxiu.studyUrl = "/leader-course-api/open/course/v1/period/study";
    studyInfo.xuanxiu.actionUrl = "/leader-collect-api/study/1/action";
    studyInfo.xuanxiu.scheduleUrl = "/leader-collect-api/study/1/schedule";

    studyInfo.exam = {};
    studyInfo.examUrl = "/leader-course-api/homework/v1/exercise/";
    studyInfo.answerUrl = "/qc-app-gc/api/qa/info?serialNum=";
    studyInfo.exam.urls = new Array();
    studyInfo.exam.currentNum = 0;


}
function init_baseInfo() {
    baseInfo.totalTime = 0;
    baseInfo.endTime = 0;
    baseInfo.recordProgress = 120;
    baseInfo.fresh = 10;
    baseInfo.speedTimes = 1;
    baseInfo.getTotalHours = function () {
        var requestUrlZone = "/leader-course-api/course/count/zoneCredit";
        var requestUrl = "/leader-course-api/course/count/credit";
        $.ajax({
            url: requestUrlZone,
            type: 'GET',
            contentType: 'application/json;charset=utf-8',
            success: function (result) {
                result.data = result.data || 0;
                var zoneTime = parseFloat(result.data);
                $.ajax({
                    url: requestUrl,
                    type: 'GET',
                    contentType: 'application/json;charset=utf-8',
                    success: function (data) {
                        if (typeof (data) != "undefined") {
                            data.data = data.data || 0;
                            baseInfo.totalTime = parseFloat(parseFloat(data.data) + zoneTime);
                            $("#lblTotalTime").html("<font color='red'>" + baseInfo.totalTime.toFixed(2) + "</font>");
                            if (baseInfo.endTime == 0) {
                                $("title").text(baseInfo.totalTime.toFixed(2));
                            }
                            else $("title").text(parseFloat(baseInfo.totalTime + "-" + (parseFloat($("#iptTime").val() - baseInfo.endTime + baseInfo.totalTime))).toFixed(2));
                        }
                        else if (data.success == false) setTimeout(baseInfo.getTotalHours, 5000);
                        else setTimeout(baseInfo.getTotalHours, 5000);
                    },
                    error: function () {
                        setTimeout(baseInfo.getTotalHours, 5000);
                    }
                });
            }
        });
    };
    baseInfo.getTotalHours();
}

function init_bixiuCourse() {
    $("#lblresult").html("正在获取 必修 学习课程。");
    var postData = {
        title: "",
        runStatus: "",
        page: 1,
        pageSize: 1000
    };
    $.ajax({
        url: studyInfo.bixiu.listUrl,
        type: 'POST',
        data: JSON.stringify(postData),
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            getBixiuCourseList(data.data, 0);
        }
    });
}
function getBixiuCourseList(list, num) {
    if (num >= list.length) {
        init_xuanxiuCourse();
        return;
    }
    var postData = {
        courseName: "",
        organCode: "",
        courseIds: list[num].courseIds,
        planIds: list[num].planIds,
    };
    $.ajax({
        url: studyInfo.bixiu.detailUrl,
        type: 'POST',
        data: JSON.stringify(postData),
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            var clist = data.data;
            for (var i = 0; i < clist.length; i++) {
                if (clist[i].finishStudy == true) continue;
                var courseRow = {};
                courseRow.type = "b";
                courseRow.courseId = clist[i].courseId;
                courseRow.courseName = "必修：" + clist[i].courseName;
                courseRow.totalDuration = clist[i].totalDuration;
                courseRow.credit = clist[i].credit;
                courseRow.planId = clist[i].planId;

                var chapterList = clist[i].userStudyMap.chapterList;
                for (var x = 0; x < chapterList.length; x++) {
                    for (var y = 0; y < chapterList[x].childList.length; y++) {
                        courseRow.periodId = chapterList[x].childList[y].periodId;
                        courseRow.periodSchedule = chapterList[x].childList[y].periodSchedule; //已学习时间
                        courseRow.haveExercise = chapterList[x].childList[y].haveExercise;
                        courseRow.examFinish = chapterList[x].childList[y].examFinish;
                        courseRow.studyId = chapterList[x].childList[y].studyId;
                    }
                }
                studyInfo.courseList.push(courseRow);
            }
            num++;
            getBixiuCourseList(list, num);
        }
    });
}

function init_xuanxiuCourse() {
    $("#lblresult").html("正在获取 选修 学习课程。");
    var postData = {
        courseName: "",
        page: 1,
        pageSize: 1000
    };
    $.ajax({
        url: studyInfo.xuanxiu.listUrl,
        type: 'POST',
        data: JSON.stringify(postData),
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            getXuanXiuCourseList(data.data, 0);
        }
    });
}

function getXuanXiuCourseList(list, num) {
    if (num >= list.length) {
        fillSelect();
        return;
    }
    if (list[num].finishStudy == true) {
        num++;
        getXuanXiuCourseList(list, num);
        return;
    }
    var postData = {
        courseId: list[num].courseId
    };
    $.ajax({
        url: studyInfo.xuanxiu.detailUrl,
        type: 'POST',
        data: JSON.stringify(postData),
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            var clist = data.data.chapterList;
            for (var i = 0; i < clist.length; i++) {
                var courseRow = {};
                courseRow.type = "x";
                courseRow.courseId = list[num].courseId;
                courseRow.courseName = "选修：" + list[num].courseName;
                courseRow.totalDuration = list[num].totalDuration;
                courseRow.credit = list[num].credit;

                var childList = clist[i].childList;
                for (var x = 0; x < childList.length; x++) {
                    courseRow.periodId = childList[x].periodId;
                    courseRow.periodSchedule = childList[x].periodSchedule; //已学习时间
                    courseRow.haveExercise = childList[x].haveExercise;
                    courseRow.studyId = childList[x].studyId;
                }
                studyInfo.courseList.push(courseRow);
            }
            num++;
            getXuanXiuCourseList(list, num);
        }
    });
}

function fillSelect() {
    var selectOptions = "";
    $("#courseSelect").html("");
    for (var i = 0; i < studyInfo.courseList.length; i++) {
        selectOptions += "<option value='" + i + "'>" + studyInfo.courseList[i].courseName + "（时长：" + studyInfo.courseList[i].totalDuration + "秒|学时：" + studyInfo.courseList[i].credit + "）</option>";
    }
    $("#courseSelect").html(selectOptions);

    $("#courseSelect").change(function () {
        studyInfo.currentNum = $("#courseSelect option:selected").val();
        $("#lblCurrentCourseTitle").html("<font color='red'>" + $("#courseSelect option:selected").text() + "</font>");
    });

    $("#lblresult").html("数据初始化完成，可以学习了。");
}

function init_compontent() {
    $(".app-main").before("<div id='messageContent' style='width:1050px;padding:10px 10px;background-color: #fff;margin: 0 auto;line-height:30px;height:200px;'><div>");
    var lblText = "学习课程：";
    var courseSelect = "<select id='courseSelect' style='width:500px;height:30px;' ></select>&nbsp;&nbsp;&nbsp;&nbsp;";
    var iptTime = "<input type='text' id='iptTime' value='' style='width:40px;height:27px;border: 1px solid;border-radius: 3px;text-align:center;'>&nbsp;&nbsp;&nbsp;&nbsp;";
    var btnStart = "<input type='button' value='开始' id='Start' style='height:30px;width:60px;border: 1px solid;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
    var btnEnd = "<input type='button' value='暂停' id='End' disabled='disabled' style='height:30px;width:60px;border: 1px solid ;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
    var btnExam = "<input type='button' value='考试'  id='Exam' disabled='disabled' style='height:30px;width:60px;border: 1px solid ;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
    $("#messageContent").append("<div>" + lblText + courseSelect + iptTime + btnStart + btnEnd + btnExam + "</div>");

    var lblText2 = "当前学习课程：";
    var lblText3 = "</br>当前课程学习进度：";
    var lblText4 = "</br>累计学时：";
    var lblCurrentCourseTitle = "<label id='lblCurrentCourseTitle'></label>";
    var currentPlayTime = "<label id='currentPlayTime'></label>";
    var lblTotalTime = "<label id='lblTotalTime'></label>&nbsp;&nbsp;&nbsp;<label id='endTime'></label>";
    var lblEndTime = "&nbsp;&nbsp;&nbsp;&nbsp;预计完成：<label id='lblEndTime'></label>";
    var lblresult = "<label id='lblresult' style='color:red'></label>";
    $("#messageContent").append("<div>" + lblText2 + lblCurrentCourseTitle + lblText3 + currentPlayTime + lblText4 + lblTotalTime + lblEndTime + lblresult + "</div>");

    $("#Start").bind("click",
        function () {
            init_disable();
            $("#lblresult").html("");
            if (baseInfo.totalTime != -1) {
                baseInfo.endTime = baseInfo.totalTime + parseFloat($("#iptTime").val());
                $("#endTime").html(baseInfo.endTime);
            }
            stop = false;
            studyInfo.exam.urls = new Array();
            //设置学习长度
            countNum();
            start();
        });
    $("#End").bind("click",
        function () {
            init_enable();
            stopStudy();
        });
    $("#Exam").bind("click",
        function () {
            $("#lblresult").html("开始考试。");
           openExam(0);
        });
}
function countNum() {
    var studyTotalCredit = parseFloat($("#iptTime").val());
    var studyCredit = 0;
    var studyTotalTime = 0;
    for (var i = studyInfo.currentNum; i < studyInfo.courseList.length; i++) {
        studyCredit += studyInfo.courseList[i].credit;
        studyTotalTime += studyInfo.courseList[i].totalDuration / baseInfo.speedTimes;
        if (studyCredit >= studyTotalCredit) {
            $("#lblEndTime").html(timeFormat(new Date(new Date().setMinutes(new Date().getMinutes() + studyTotalTime / 60)).getTime()));
            studyInfo.endNum = i;
            return;
        }
    }
}
function init_disable() {
    $("#Start").attr("disabled", "disabled");
    $("#courseSelect").attr("disabled", "disabled");
    $("#End").removeAttr("disabled");
    $("#iptTime").attr("disabled", "disabled");
    $("#Exam").attr("disabled", "disabled");
}
function init_enable() {
    $("#End").attr("disabled", "disabled");
    $("#Start").removeAttr("disabled");
    $("#courseSelect").removeAttr("disabled");
    $("#iptTime").removeAttr("disabled");
    $("#Exam").removeAttr("disabled");
}
function start() {
    if (studyInfo.currentNum >= studyInfo.courseList.length) {
        $("#lblresult").html("课程已全部学完");
        return;
    }
    $("#lblresult").html("");
    currentCourse = studyInfo.courseList[studyInfo.currentNum];
    currentCourse.periodSchedule = currentCourse.periodSchedule || 0;
    currentCourse.studyTime = 0;

    $("#lblCurrentCourseTitle").html("<font color='red'>" + currentCourse.courseName + "（时长：" + currentCourse.totalDuration + "秒|学时：" + currentCourse.credit + "）</font>");

    //3秒后执行考试

    if (currentCourse.type == "b") startBiXiu();
    else startXuanXiu();
}

function startNext() {
    studyInfo.currentNum++;
    currentCourse = {};
    baseInfo.getTotalHours();
    if (studyInfo.currentNum > studyInfo.endNum) {
        $("#lblresult").html("已学够结束学时，学习停止。");
        $("title").text(($("title").text() + "-end"));
        stopStudy();
        return;
    }
    start();
}

function stopStudy() {
    currentCourse = {};
    stop = true;
    init_enable();
}

function startBiXiu() {
    //study
    var postData = {
        periodId: currentCourse.periodId,
        planId: currentCourse.planId,
        studyId: currentCourse.studyId
    };
    $.ajax({
        url: studyInfo.bixiu.studyUrl,
        type: 'POST',
        data: JSON.stringify(postData),
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            //action
            currentCourse.data = data.data;

            var postDataB = {
                type: "start",
                content: "视频开始播放",
                eventTime: (new Date()).getTime(),
                courseId: currentCourse.courseId,
                periodId: currentCourse.periodId,
                studyId: currentCourse.studyId,
                backNo: currentCourse.data.studyBackNo,
                zoneType: "plan",
                version: "1",
                zoneId: ""
            };
            $.ajax({
                url: studyInfo.bixiu.actionUrl,
                type: 'POST',
                data: JSON.stringify(postDataB),
                contentType: 'application/json;charset=utf-8',
                success: function (data) {
                    //schedule，
                    bixiuProgress();
                }
            });
        }
    });
}

function bixiuProgress() {
    if (stop == true) {
        stopStudy();
        return;
    }
    currentCourse.studyTime += baseInfo.speedTimes;
    currentCourse.studyPercent = parseFloat((currentCourse.studyTime + currentCourse.periodSchedule) / currentCourse.totalDuration * 100) >= 100 ? 100 : parseFloat((currentCourse.studyTime + currentCourse.periodSchedule) / currentCourse.totalDuration * 100).toFixed(2);
    $("#currentPlayTime").html("<font color='red'>" + currentCourse.studyPercent + "%</font>");

    if (currentCourse.studyTime % baseInfo.recordProgress == 0) {
        bixiuUpdateProgress("update");
    }
    if ((currentCourse.studyTime + currentCourse.periodSchedule) > currentCourse.totalDuration + Math.round(Math.random() * 10, 0)) {
        bixiuUpdateProgress("end");
        var examCourse = currentCourse;
        setTimeout(startNext, 3000);
        //开始答题
        if (examCourse.haveExercise == true) setTimeout(function () { exam(examCourse); }, 5000)
        return;
    }
    else setTimeout(bixiuProgress, 1000);
}

function bixiuUpdateProgress(type) {
    var isEnd = false;
    if (type == "end") isEnd = true;

    var postData = {
        playLocation: currentCourse.studyTime + currentCourse.periodSchedule,
        schedule: currentCourse.studyTime + currentCourse.periodSchedule,
        isEnd: isEnd,
        courseId: currentCourse.courseId,
        periodId: currentCourse.periodId,
        studyId: currentCourse.studyId,
        backNo: currentCourse.data.studyBackNo,
        zoneType: "plan",
        version: "1",
        eventTime: (new Date()).getTime(),
        zoneId: "",
        studyTime: currentCourse.studyTime,
        sign: ""
    };

    var message = [postData.schedule, postData.isEnd].join("");//需要加密的数据
    var key = "leader-course-3sdf4";//加密key
    //加密
    postData.sign = encryptByDES(message, key);

    $.ajax({
        url: studyInfo.bixiu.scheduleUrl,
        type: 'POST',
        data: JSON.stringify(postData),
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (data.msg == "操作成功") {
                $("#lblresult").html("学时记录成功，" + postData.playLocation);
            }
            else $("#lblresult").html("学时记录失败，" + postData.playLocation);

        }
    });
}

function startXuanXiu() {
    //study
    var postData = {
        periodId: currentCourse.periodId,
        studyId: currentCourse.studyId
    };
    $.ajax({
        url: studyInfo.xuanxiu.studyUrl,
        type: 'POST',
        data: JSON.stringify(postData),
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            //action
            currentCourse.data = data.data;

            var postDataB = {
                type: "start",
                content: "视频开始播放",
                eventTime: (new Date()).getTime(),
                courseId: currentCourse.courseId,
                periodId: currentCourse.periodId,
                studyId: currentCourse.studyId,
                backNo: currentCourse.data.studyBackNo,
                zoneType: "zone",
                version: "1",
                zoneId: ""
            };
            $.ajax({
                url: studyInfo.bixiu.actionUrl,
                type: 'POST',
                data: JSON.stringify(postDataB),
                contentType: 'application/json;charset=utf-8',
                success: function (data) {
                    //schedule，
                    xuanxiuProgress();
                }
            });
        }
    });
}

function xuanxiuProgress() {
    if (stop == true) {
        stopStudy();
        return;
    }
    currentCourse.studyTime += baseInfo.speedTimes;
    currentCourse.studyPercent = parseInt((currentCourse.studyTime + currentCourse.periodSchedule) / currentCourse.totalDuration * 100) >= 100 ? 100 : parseInt((currentCourse.studyTime + currentCourse.periodSchedule) / currentCourse.totalDuration * 100);
    $("#currentPlayTime").html("<font color='red'>" + currentCourse.studyPercent + "%</font>");

    if (currentCourse.studyTime % baseInfo.recordProgress == 0) {
        xuanxiuUpdateProgress("update");
    }
    if ((currentCourse.studyTime + currentCourse.periodSchedule) > currentCourse.totalDuration + Math.round(Math.random() * 10, 0)) {
        xuanxiuUpdateProgress("end");
        var examCourse = currentCourse;
        setTimeout(startNext, 3000);
        //开始答题
        if (examCourse.haveExercise == true) setTimeout(function () { exam(examCourse); }, 5000)

        return;
    }
    else setTimeout(bixiuProgress, 1000);
}
function xuanxiuUpdateProgress(type) {
    var isEnd = false;
    if (type == "end") isEnd = true;

    var postData = {
        playLocation: currentCourse.studyTime + currentCourse.periodSchedule,
        schedule: currentCourse.studyTime + currentCourse.periodSchedule,
        isEnd: isEnd,
        courseId: currentCourse.courseId,
        periodId: currentCourse.periodId,
        studyId: currentCourse.studyId,
        backNo: currentCourse.data.studyBackNo,
        zoneType: "zone",
        version: "1",
        eventTime: (new Date()).getTime(),
        zoneId: "",
        studyTime: currentCourse.studyTime,
        sign: ""
    };

    var message = [postData.schedule, postData.isEnd].join("");//需要加密的数据
    var key = "leader-course-3sdf4";//加密key
    //加密
    postData.sign = encryptByDES(message, key);

    $.ajax({
        url: studyInfo.xuanxiu.scheduleUrl,
        type: 'POST',
        data: JSON.stringify(postData),
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (data.msg == "操作成功") {
                $("#lblresult").html("学时记录成功，" + postData.playLocation);
            }
            else $("#lblresult").html("学时记录失败，" + postData.playLocation);

        }
    });
}

function exam(examCourse) {
    var exerciseUrl = "";
    if(examCourse.type == "b") exerciseUrl = "https://qlgh.sdgh.org.cn/leaderp/#/pc/task/taskList?courseIds=" + examCourse.courseId + "&planIds=" + examCourse.planId ;
    else exerciseUrl = "https://qlgh.sdgh.org.cn/leaderp/#/pc/study/studyDetail?courseId=" + examCourse.courseId;
    //studyInfo.exam.urls.push(exerciseUrl);
    startExam(exerciseUrl);
}

function startExam(exerciseUrl){
    window.location.href = exerciseUrl;
    var jiange = 3000 + Math.round(Math.random() * 2000, 0);
    setTimeout(function(){
        var btnCount = $("button").length;
        $("button").eq(btnCount-1).trigger("click");
        window.history.back(-1); 
    },jiange);
}


function openExam(num){
    if(num >= studyInfo.exam.urls.length){
        $("#lblresult").html("考试完毕。");
        baseInfo.getTotalHours();
        return;
    }
    window.location.href = studyInfo.exam.urls[num];
    num++;
    setTimeout(function(){
        var btnCount = $("button").length;
        $("button").eq(btnCount-1).trigger("click");
        window.history.back(-1); 
    },3000);
    var jiange = 15000 +  Math.round(Math.random() * 10000, 0);
    setTimeout(function(){
        openExam(num);
    },jiange);
    
}

chrome.extension.onMessage.addListener(function (response, sender, sendResponse) {
	response = JSON.parse(response);
	if (response.type == "create") {
		newTabId = response.id;

	}

});


function encryptByDES(message, key) {
    var keyHex = CryptoJS.enc.Utf8.parse(key);
    var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.ciphertext.toString();
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

$(document).ready(function () {
    init_compontent();
    init_studyInfo();
    init_baseInfo();
    init_bixiuCourse();
});