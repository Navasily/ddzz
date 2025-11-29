//update by 2023.12.11

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
	if (currentUrl.indexOf("personal-center") != -1) {
		$(".header").remove();
            setTimeout(function () {
			    init_baseInfo();
			    init_compontent();
			    init_alreadystudylist();
                refreshSession();
		    }, 1500);
	}
});

function setHeader(config){
    var headerConfig = {};
    headerConfig.KEY = config.accessKey;
    headerConfig.NONCE = C(6);
    headerConfig.TIMESTAMP = (new Date).getTime();
    headerConfig.SIGNATURE = ("V1" + S(headerConfig.TIMESTAMP+headerConfig.NONCE+config.accessSecret)).toUpperCase();
    return headerConfig;
}

function init_baseInfo() {
    baseInfo.year = "2025";
    baseInfo.recordProgress = 10;
    baseInfo.getTotalHours = function () {
        var postData = {
            userId: baseInfo.userInfo.id,
            year: parseInt(baseInfo.year),
            idCardHash: baseInfo.userInfo.idCardHash
        };
        var requestUri = "/gwapi/dywlxynet/api/web/personal/myTotalStatistics";
        var headerConfig = setHeader(baseInfo.userConfig);
        $.ajax({
            url: requestUri,
            type: 'post',
            data: JSON.stringify(postData),
            contentType: 'application/json;charset=utf-8',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            beforeSend: function(xhr){
                xhr.setRequestHeader("Accept","application/json, text/plain, */*"),
                xhr.setRequestHeader("FS-CK",baseInfo.userInfo.token);
                xhr.setRequestHeader("X-CA-KEY",headerConfig.KEY);
                xhr.setRequestHeader("X-CA-SIGNATURE",headerConfig.SIGNATURE);
                xhr.setRequestHeader("X-CA-TIMESTAMP",headerConfig.TIMESTAMP);
                xhr.setRequestHeader("X-CA-NONCE",headerConfig.NONCE);
            },
            success: function (data) {
                if (typeof (data) != "undefined") {
                    totalTime = data.data.totalHours;
                    $("#lblTotalTime").html("<font color='red'>" + totalTime + "</font>");
                    if (endTime == 0) {
                        $("title").text(totalTime);
                    }
                    else $("title").text(totalTime + "-" + (parseInt($("#iptTime").val() - endTime + totalTime)));
                }
                else if (data.success == false) setTimeout(baseInfo.getTotalHours, 5000);
                else setTimeout(baseInfo.getTotalHours, 5000);
            },
            error: function () {
                setTimeout(baseInfo.getTotalHours, 5000);
            }
        });
    },
    baseInfo.getUserInfo = function (config) {
        var requestUri = "/gwapi/dywlxynet/api/user/info";
        var headerConfig = setHeader(baseInfo.userConfig);
        $.ajax({
            url: requestUri,
            type: 'post',
            contentType: 'application/json',
            async: false,
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            beforeSend: function(xhr){
                xhr.setRequestHeader("Accept","application/json, text/plain, */*"),
                xhr.setRequestHeader("X-CA-KEY",headerConfig.KEY);
                xhr.setRequestHeader("X-CA-SIGNATURE",headerConfig.SIGNATURE);
                xhr.setRequestHeader("X-CA-TIMESTAMP",headerConfig.TIMESTAMP);
                xhr.setRequestHeader("X-CA-NONCE",headerConfig.NONCE);
            },
            success: function (data) {
                if (typeof (data) != "undefined") {
                    if(data.success != false){
                        baseInfo.userInfo = data.data;
                        baseInfo.getTotalHours();
                    }
                    else setTimeout(baseInfo.getUserInfo, 5000);
                }
                else setTimeout(baseInfo.getUserInfo, 5000);
            }
        });
    },
    baseInfo.getConfig = function(){
        var requestUri = "/gwapi/dywlxynet/api/user/configure";
        $.ajax({
            url: requestUri,
            type: 'post',
            contentType: 'application/json;charset=UTF-8',
            async: false,
            success: function (data) {
                if (typeof (data) != "undefined") {
                    baseInfo.userConfig = data.data;
                    baseInfo.getUserInfo(baseInfo.userConfig);
                }
                else if (data.success == false) setTimeout(baseInfo.getConfig, 5000);
                else setTimeout(baseInfo.getConfig, 3000);
            }
        });
    }(),
    baseInfo.ranStartTime = 270 + Math.round(Math.random() * 60, 0); //4:30 - 5:30 之间
    baseInfo.minEndTime = 30 + Math.round(Math.random() * 30, 0); //每天最晚不超过1：00
    baseInfo.pageSize = 200;
    baseInfo.pagenum = 0;
}


function catEndTime() {
    var totalStudyTime = endTime;
    var getTotalMins = 0;
    var getTotalHoursByEndTime = 0;
    for (var i = currentCourseNum; i < courseList.length; i++) {
        getTotalMins += courseList[i].courseDuration;
        getTotalHoursByEndTime += courseList[i].courseHour;
        if (getTotalHoursByEndTime >= (totalStudyTime - totalTime)) break;
    }
    $("#lblEndTime").html(timeFormat(new Date(new Date().setSeconds(new Date().getSeconds() + getTotalMins)).getTime()));

}
function validateSet() {
    $("#lblresult").html("正在验证基础数据。。。");
    if ($("#iptTime").val().trim() == "") {
        $("#lblresult").html("请输入结束学时。");
        return false;
    }
    else {
        var reg = /^[1-9]\d*$|^0$/;
        if (reg.test($("#iptTime").val().trim()) == false) {
            $("#lblresult").html("结束学时请输入数字，注意数字 0 不要在第一位");
            return false;
        }
    }
    if (baseInfo.totalTime == -1) {
        $("#lblresult").html("累计学时没有获取成功，请刷新页面重试。");
        return false;
    }
    else {
        //if(parseInt($("#iptTime").val().trim()) - totalTime <=0){
        //	$("#lblresult").html("结束学时请 大于 累计学时。");
        //	return false;
        //}
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
    $(".main_body").before("<div id='messageContent' style='width:1050px;padding:10px 10px;background-color: #fff;margin: 0 auto;line-height:30px;height:200px;'><div>");
    var lblText = "请选择开始课程：";
    var courseSelect = "<select id='courseSelect' style='width:500px;height:30px;' ></select>&nbsp;&nbsp;&nbsp;&nbsp;";
    var iptTime = "<input type='text' id='iptTime' value='' style='width:40px;height:27px;border: 1px solid;border-radius: 3px;text-align:center;'>&nbsp;&nbsp;&nbsp;&nbsp;";
    var btnStart = "<input type='button' value='开始' id='Start' style='height:30px;width:60px;border: 1px solid;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
    var btnEnd = "<input type='button' value='暂停' id='End' disabled='disabled' style='height:30px;width:60px;border: 1px solid ;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
    $("#messageContent").append("<div>" + lblText + courseSelect + iptTime + btnStart + btnEnd + "</div>");

    var examFrame = '<iframe id="examFrame" width="100%" height="400" src=""  style="display:none"></iframe>';
	$("#messageContent").append(examFrame);

    $("#Start").bind("click",
        function () {
            init_disable();
            maFlag = false;
            if (validateSet() == false) {
                init_enable();
                return;
            }
            $("#lblresult").html("");
            if (totalTime != -1) {
                //随机增加学时
                endTime = getEndTime();
                $("#endTime").html(endTime);
            }
            startStudy();
        });
    $("#End").bind("click",
        function () {
            init_enable();
            stopStudy();
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
function getEndTime(){
    return totalTime + parseInt($("#iptTime").val()) + Math.round(Math.random()*5,0)*0.25;
}
function init_alreadystudylist() {
    var postData = {
		pageNum: baseInfo.pagenum,
        pageSize: baseInfo.pageSize,
		classificationType: "",
		idCardHash: baseInfo.userInfo.idCardHash,
        courseName: "",
		orgName: "",
		teacher: "",
		courseHoursStart: "",
		courseHoursEnd: ""
    };
    var requestUri = "/gwapi/dywlxynet/api/web/courseResourceLibrary/queryByClassification";
    var headerConfig = setHeader(baseInfo.userConfig);
    $.ajax({
        url: requestUri,
        type: 'post',
        data: JSON.stringify(postData),
        contentType: 'application/json;charset=utf-8',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        beforeSend: function(xhr){
            xhr.setRequestHeader("Accept","application/json, text/plain, */*");
            xhr.setRequestHeader("FS-CK",baseInfo.userInfo.token);
            xhr.setRequestHeader("X-CA-KEY",headerConfig.KEY);
            xhr.setRequestHeader("X-CA-SIGNATURE",headerConfig.SIGNATURE);
            xhr.setRequestHeader("X-CA-TIMESTAMP",headerConfig.TIMESTAMP);
            xhr.setRequestHeader("X-CA-NONCE",headerConfig.NONCE);
        },
        success: function (dataSource) {
            if(dataSource.success == false){
                init_alreadystudylist();
                return;
            }
            if (typeof (dataSource) != "undefined") {
                if (dataSource.datalist == null) {
					$("#lblresult").html("课程获取失败，正在重新获取。");
                    setTimeout(init_alreadystudylist, 3000);
                    return;
                }
				
                baseInfo.totalpages = dataSource.totalpages;
                $("#lblresult").html("正在获取全部课程，当前页： " + baseInfo.pagenum + "/" + baseInfo.totalpages);
                
				var courseIds = new Array();
				for(var i=0;i<dataSource.datalist.length;i++){
					courseIds.push(dataSource.datalist[i].id);
				}

				getCourseByIds(courseIds);

            } else {
				$("#lblresult").html("课程获取失败，正在重新获取。");
                setTimeout(init_alreadystudylist, 3000);
            }
        }
    });
}

function getCourseByIds(courseIds){
	var postData = {
		idCardHash: baseInfo.userInfo.idCardHash,
        courseIds: courseIds
    };
    var requestUri = "/gwapi/dywlxynet/api/web/courseResourceLibrary/queryCourseByIds";
    var headerConfig = setHeader(baseInfo.userConfig);
    $.ajax({
        url: requestUri,
        type: 'post',
        data: JSON.stringify(postData),
        contentType: 'application/json;charset=utf-8',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        beforeSend: function(xhr){
            xhr.setRequestHeader("Accept","application/json, text/plain, */*");
            xhr.setRequestHeader("FS-CK",baseInfo.userInfo.token);
            xhr.setRequestHeader("X-CA-KEY",headerConfig.KEY);
            xhr.setRequestHeader("X-CA-SIGNATURE",headerConfig.SIGNATURE);
            xhr.setRequestHeader("X-CA-TIMESTAMP",headerConfig.TIMESTAMP);
            xhr.setRequestHeader("X-CA-NONCE",headerConfig.NONCE);
        },
        success: function (dataSource) {
            if(dataSource.success == false){
				$("#lblresult").html("课程获取课程详细失败，正在重新获取。");
                setTimeout(function(){
						getCourseByIds(courseIds);
				}, 3000);
                return;
            }
            if (typeof (dataSource) != "undefined") {
                if (dataSource.datalist == null) {
					$("#lblresult").html("课程获取课程详细失败，正在重新获取。");
                    setTimeout(function(){
						getCourseByIds(courseIds);
					}, 3000);
                    return;
                }
				
				dataSource = dataSource.datalist;
				for (var i = 0; i < dataSource.length; i++) {
					if(dataSource[i].studyStatus == 2) continue;
					if(dataSource[i].courseHours <= 0 || dataSource[i].courseHours == "0") continue;
					var courseListRow = {};
					courseListRow.classificationId = dataSource[i].classificationId;
					courseListRow.courseDuration = dataSource[i].courseDuration;
					courseListRow.courseHour = dataSource[i].courseHours;
					courseListRow.courseCode = dataSource[i].courseCode;
					courseListRow.courseName = dataSource[i].courseName;
					courseListRow.id = dataSource[i].id;
					courseListRow.examFlag = dataSource[i].examFlag;
					preCourseList.push(courseListRow);
				}
				
				baseInfo.pagenum += 1;
                if (baseInfo.pagenum >= baseInfo.totalpages) {
                    baseInfo.pagenum = 0;
					init_studylist();
                }
                else {
					init_alreadystudylist();
                    return;
                }
			}
		}	
    });
}

function init_studylist(){
	var postData = {
		userId: baseInfo.userInfo.idCardHash,
		studyStatus: 2,
		courseName: "",
		startTime: "",
		endTime: "",
		pageNum: baseInfo.pagenum,
		pageSize: baseInfo.pageSize,
		year: baseInfo.year
    };
    var requestUri = "/gwapi/dywlxynet/api/web/personal/queryMyCourseList";
    var headerConfig = setHeader(baseInfo.userConfig);
    $.ajax({
        url: requestUri,
        type: 'post',
        data: JSON.stringify(postData),
        contentType: 'application/json;charset=utf-8',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        beforeSend: function(xhr){
            xhr.setRequestHeader("Accept","application/json, text/plain, */*");
            xhr.setRequestHeader("FS-CK",baseInfo.userInfo.token);
            xhr.setRequestHeader("X-CA-KEY",headerConfig.KEY);
            xhr.setRequestHeader("X-CA-SIGNATURE",headerConfig.SIGNATURE);
            xhr.setRequestHeader("X-CA-TIMESTAMP",headerConfig.TIMESTAMP);
            xhr.setRequestHeader("X-CA-NONCE",headerConfig.NONCE);
        },
        success: function (dataSource) {
            if(dataSource.success == false){
                init_studylist();
                return;
            }
            if (typeof (dataSource) != "undefined") {
                if (dataSource.datalist == null) {
					$("#lblresult").html("已学课程获取失败，正在重新获取。");
                    setTimeout(init_studylist, 3000);
                    return;
                }
				
                baseInfo.totalpages = dataSource.totalpages;
                $("#lblresult").html("正在获取已学课程，当前页： " + baseInfo.pagenum + "/" + baseInfo.totalpages);
                
				for(let i=0;i<dataSource.datalist.length;i++){
					alreayStudyList.push(dataSource.datalist[i]);
				}
				
				baseInfo.pagenum += 1;
                if (baseInfo.pagenum >= baseInfo.totalpages) {
                    baseInfo.pagenum = 0;
					init_select();
                }
                else {
					init_studylist();
                    return;
                }				

            } else {
				$("#lblresult").html("已学课程获取失败，正在重新获取。");
                setTimeout(init_studylist, 3000);
            }
        }
    });
}

function init_select() {
	for (var i = 0; i < preCourseList.length; i++) {
        var isAdd = false;
        for (var j = 0; j < alreayStudyList.length; j++) {
            if (preCourseList[i].courseCode == alreayStudyList[j].courseCode) {
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
	let alltime = 0;
    for (var i = 0; i < courseList.length; i++) {
        selectOptions += "<option value='" + i + "'>" + courseList[i].courseName + "（时长：" + courseList[i].courseDuration + "秒|学时：" + courseList[i].courseHour + "）</option>";
		alltime += courseList[i].courseHour;
    }
    $("#courseSelect").html(selectOptions);
    $("#lblresult").html("数据初始化完毕，可以进行学习了。可学：" + alltime);
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
    currentTotalTime = currentCourse.courseDuration;
    project = currentCourse;
    setTimeout(catEndTime, 3000);
    addCourseClick();
    updateCourseStatistics();
    addTimeCount();
}
function addCourseClick(){
    var requestUri = "https://dywlxy.dtdjzx.gov.cn/gwapi/dywlxynet/api/web/courseComment/courseClick?id=" + currentCourse.id;
    var headerConfig = setHeader(baseInfo.userConfig);
    $.ajax({
        url: requestUri,
        type: 'get',
        contentType: 'application/json;charset=UTF-8',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        beforeSend: function(xhr){
            xhr.setRequestHeader("Accept","application/json, text/plain, */*"),
            xhr.setRequestHeader("FS-CK",baseInfo.userInfo.token);
            xhr.setRequestHeader("X-CA-KEY",headerConfig.KEY);
            xhr.setRequestHeader("X-CA-SIGNATURE",headerConfig.SIGNATURE);
            xhr.setRequestHeader("X-CA-TIMESTAMP",headerConfig.TIMESTAMP);
            xhr.setRequestHeader("X-CA-NONCE",headerConfig.NONCE);
        }
    });
}

function updateCourseStatistics(){
    var requestUri = "https://dywlxy.dtdjzx.gov.cn/gwapi/dywlxynet/api/web/courseComment/courseStatistics?courseId=" + currentCourse.id;
    var headerConfig = setHeader(baseInfo.userConfig);
    $.ajax({
        url: requestUri,
        type: 'get',
        contentType: 'application/json;charset=UTF-8',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        beforeSend: function(xhr){
            xhr.setRequestHeader("Accept","application/json, text/plain, */*"),
            xhr.setRequestHeader("FS-CK",baseInfo.userInfo.token);
            xhr.setRequestHeader("X-CA-KEY",headerConfig.KEY);
            xhr.setRequestHeader("X-CA-SIGNATURE",headerConfig.SIGNATURE);
            xhr.setRequestHeader("X-CA-TIMESTAMP",headerConfig.TIMESTAMP);
            xhr.setRequestHeader("X-CA-NONCE",headerConfig.NONCE);
        }
    });   
}
function addTimeCount() {
    $("#lblCurrentCourseTitle").html("<font color='red'>" + courseList[currentCourseNum].courseName + "（时长：" + courseList[currentCourseNum].courseDuration + "秒|学时：" + courseList[currentCourseNum].courseHour + "）</font>");
    var postData = {
        id: currentCourse.id,
        idCardHash: baseInfo.userInfo.idCardHash
    }
    var requestUri = "/gwapi/dywlxynet/api/web/course/startCourseStudy";
    var headerConfig = setHeader(baseInfo.userConfig);
    $.ajax({
        url: requestUri,
        type: 'post',
        data: postData,
        contentType: 'application/x-www-form-urlencoded',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        beforeSend: function(xhr){
            xhr.setRequestHeader("Accept","application/json, text/plain, */*"),
            xhr.setRequestHeader("FS-CK",baseInfo.userInfo.token);
            xhr.setRequestHeader("X-CA-KEY",headerConfig.KEY);
            xhr.setRequestHeader("X-CA-SIGNATURE",headerConfig.SIGNATURE);
            xhr.setRequestHeader("X-CA-TIMESTAMP",headerConfig.TIMESTAMP);
            xhr.setRequestHeader("X-CA-NONCE",headerConfig.NONCE);
        },
        success: function (data) {
			if(data.success == false){
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
				return;
			}
			if(data.data.code == "800"){
				 maFlag = true;
                $("#lblresult").html(data.data.message);
				//延时到明天继续学习。
				delayToStudyNext();
				return;
			}
			else if (data.data.studyStatus == "2"){
				startNext();
				return;
			}
            if (data.success == true) {
                if (addtimeFlagCount > 0) {
                    addtimeFlagCount = 0;
                    $("#lblresult").html("");
                }
                currentCourse.studyTimes = data.data.studyTimes || 0;
                currentCourse.startTime = (new Date()).getTime();
                startStudyProcess();
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
    currentCourse.playTime = (new Date()).getTime() - currentCourse.startTime;
	var bs = Math.floor(currentCourse.playTime / 10000);

    if (bs > 0) {
		currentCourse.startTime = (new Date()).getTime();
		currentPlayTime += baseInfo.recordProgress;
		studyPercent =  parseInt(currentPlayTime / currentTotalTime * 100) == 100 ? 100 : parseInt(currentPlayTime / currentTotalTime * 100);
		if (currentPlayTime > currentTotalTime + Math.round(Math.random() * 7, 0)) {
			$("#currentPlayTime").html("<font color='red'>" + studyPercent + "%</font>");
			updateEnd(currentPlayTime);
			currentPlayTime = 0;
			setTimeout(startNext, 3000);
			return;
		}
		else {
			$("#currentPlayTime").html("<font color='red'>" + studyPercent + "%</font>")
			setTimeout(startStudyProcess, 1000);
			StudyProgress(currentPlayTime);
		}
	}
	else setTimeout(startStudyProcess, 1000);
}
function StudyProgress(currentPlayTime) {
    var postData = {
        courseCode: currentCourse.courseCode,
        userId: baseInfo.userInfo.idCardHash,
        studyTimes: currentPlayTime
    };
    var requestUri = "https://gw.dtdjzx.gov.cn/gwapi/us/api/study/progress2";
    var headerConfig = setHeader(baseInfo.userConfig);
    $.ajax({
        url: requestUri,
        type: 'post',
        data: JSON.stringify(postData),
        contentType: 'application/json;charset=utf-8',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        beforeSend: function(xhr){
            xhr.setRequestHeader("Accept","application/json, text/plain, */*"),
            xhr.setRequestHeader("FS-CK",baseInfo.userInfo.token);
            xhr.setRequestHeader("X-CA-KEY",headerConfig.KEY);
            xhr.setRequestHeader("X-CA-SIGNATURE",headerConfig.SIGNATURE);
            xhr.setRequestHeader("X-CA-TIMESTAMP",headerConfig.TIMESTAMP);
            xhr.setRequestHeader("X-CA-NONCE",headerConfig.NONCE);
        }
    }).then(function(data) {
        console.log(data.success + " 记录学时，当前播放时间:" + currentPlayTime);
    });
}
function updateEnd(currentPlayTime) {
    var postData = {
        id: currentCourse.id,
        idCardHash: baseInfo.userInfo.idCardHash
    }
    var requestUri = "/api/web/course/endCourseStudy";
    var headerConfig = setHeader(baseInfo.userConfig);
    $.ajax({
        url: requestUri,
        type: 'post',
        data: postData,
        contentType: 'application/x-www-form-urlencoded',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        beforeSend: function(xhr){
            xhr.setRequestHeader("Accept","application/json, text/plain, */*"),
            xhr.setRequestHeader("FS-CK",baseInfo.userInfo.token);
            xhr.setRequestHeader("X-CA-KEY",headerConfig.KEY);
            xhr.setRequestHeader("X-CA-SIGNATURE",headerConfig.SIGNATURE);
            xhr.setRequestHeader("X-CA-TIMESTAMP",headerConfig.TIMESTAMP);
            xhr.setRequestHeader("X-CA-NONCE",headerConfig.NONCE);
        },
        success: function (data) {
            if (data.success == false) {
                $("#lblresult").html(data.message);
            }
            else console.log(data.success + "播放结束，当前播放时间:" + currentPlayTime);
            baseInfo.getTotalHours();
        },
		error: function () {
           $("#lblresult").html("课程结束失败。");
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
function refreshSession(){
	let url =  "/gwapi/dywlxynet/api/user/configure";
    $.post(url);
    setTimeout(refreshSession,60000);
}

function bubbleSort(studyCourseList){
	var arr = studyCourseList;
	for (var i = 0; i < arr.length - 1; i++) {
        for (var j = 0; j < arr.length - i -1; j++) {   // 这里说明为什么需要-1
			var e_j = arr[j].courseHour / arr[j].courseDuration;
			var e_j1 = arr[j+1].courseHour / arr[j+1].courseDuration;
            if (e_j < e_j1) {
                var temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
	return arr;
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
function guid() {
    function e() {
        return (65536 * (1 + Math.random()) | 0).toString(16).substring(1)
    }
    return e() + e() + "-" + e() + "-" + e() + "-" + e() + "-" + e() + e() + e()
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