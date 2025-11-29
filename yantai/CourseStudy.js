var courseList = new Array();
var currentCourseNum = 0;
var studyInfo = {};
var userInfo = {};
var newTabId = 0;

$(document).ready(function () {
	initInfo();
	init();
	initCourse();
	initButton();
});

function initInfo() {
	studyInfo.getCourseInfoInterval = 20000;//30秒
	studyInfo.getStudyInterval = 20000; //60秒;
	studyInfo.retryTimes = 3000;
	studyInfo.studyTime = 0; //当前学习时间;
	studyInfo.baseUrl = "http://ytwldx.soocedu.com";

	userInfo.getUserInfo = function () {
		$.get("http://ytwldx.soocedu.com/index.php/home/Index/index.html", function (htmlData) {
			userInfo.totalTime = $(htmlData).find(".xs_s_l").find(".xs_dft").text();
			$("title").text(userInfo.totalTime);
		});
	}();
}
function init() {

	//出初始化控件
	$(".container").before("<div id='messageContent' class='container'><div>");
	var lblText = "请选择开始课程：";
	var courseSelect = "<select id='courseSelect' style='width:500px;height:30px;'></select>&nbsp;&nbsp;&nbsp;&nbsp;";
	var iptTime = "<input type='text' id='iptTime' value='' style='width:40px;height:27px;border: 1px solid;border-radius: 3px;text-align:center;'>&nbsp;&nbsp;&nbsp;&nbsp;";
	var btnStart = "<input type='button' value='开始' id='Start' style='height:30px;width:60px;border: 1px solid;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
	var btnEnd = "<input type='button' value='暂停' id='End' disabled='disabled' style='height:30px;width:60px;border: 1px solid ;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
	$("#messageContent").append("<div>" + lblText + courseSelect + iptTime + btnStart + btnEnd + "</div>");

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
function initCourse() {
	//首先初始化必修课，然后增加全部课程
	$.get("http://ytwldx.soocedu.com/index.php/mooc/Index/student.html", function (htmlData) {
		if (typeof (htmlData) != "undefined") {
			$(htmlData).find(".lesson_list").find("a[title]").each(function () {
				var course = {};
				course.url = $(this).attr("href");
				course.title = "必修课：" + $(this).attr("title");
				courseList.push(course);
			});

			$.get('https://xixipx.gitee.io/ddzz/yantai/courselist', function (dataSource) {
				if (typeof (dataSource) != "undefined") {
					courseList = courseList.concat(eval(dataSource));
					fillSelect();
				}
				else {
					$("#lblresult").html("课程初始化失败，请刷新重试。");
				}
			});
		}
		else {
			$("#lblresult").html("必修课程初始化失败，请刷新重试。");
		}
	});
}
function fillSelect() {
	var selectOptions = "";
	for (var i = 0; i < courseList.length; i++) {
		selectOptions += "<option value='" + i + "'>" + courseList[i].title + "</option>";
	}
	$("#courseSelect").html(selectOptions);
}
function initButton() {
	$("#Start").bind("click",
		function () {
			init_disable();
			$("#lblresult").html("");
			userInfo.endTime = parseInt(userInfo.totalTime) + parseInt($("#iptTime").val());
			$("#endTime").html(endTime);
			startStudy();
		});
	$("#End").bind("click",
		function () {
			init_enable();
			stopStudy();
		});
}
//定时学习
function startStudy() {
	$("#lblCurrentCourseTitle").html("<font color='red'>" + courseList[currentCourseNum].title + "</font>");

	//一共再打开一个页面，课程页面先自动考试，1.先打开页面,获得打开习题页面。
	var getUrl = studyInfo.baseUrl + courseList[currentCourseNum].url;
	$.get(getUrl, function (htmlData) {
		if (typeof (htmlData) != "undefined") {
			var isFinish = 0;
			$(htmlData).find(".xw_process_hover").each(function(){
				if($(this).text().trim()=="100%") isFinish++;
			})
			if(isFinish >= 2) {
				studyNext();
				return;
			}
			
			var message = {};
			message.type = "create";
			message.url = studyInfo.baseUrl + $(htmlData).find(".xw_study_btn").attr("href");
			chrome.extension.sendMessage(JSON.stringify(message), function (response) {});

			window.startStudyProgress = setInterval(function(){
				studyProgress(getUrl);
			},studyInfo.getCourseInfoInterval);

		}
		else {
			$("#lblresult").html("学习课程失败，正在重试。");
			setTimeout(startStudy, studyInfo.retryTimes);
		}

	});
}

function studyProgress(getUrl) {
	$.get(getUrl, function (htmlData) {
		if (typeof (htmlData) != "undefined") {
			var isFinish = 0;
			var progress = "";
			$(htmlData).find(".xw_process_hover").each(function(){
				if($(this).text().trim()=="100%") isFinish++;
				progress += $(this).text().trim();
			});
			
			$("#currentPlayTime").html(progress);
			
			if(isFinish >= 2) {
				clearInterval(window.startStudyProgress);
				//关闭打开的窗口，学习下个课程
				var message = {};
				message.type = "stop";
				message.id = newTabId;
				chrome.extension.sendMessage(JSON.stringify(message), function (response) { });
				studyNext();
				return;
			}
			
		}
		else {
			
		}

	});
}

function startNext() {
	currentCourseNum++;
	if (currentCourseNum >= courseList.length) {
		$("#lblresult").html("全部课程学习完毕！");
		return;
	}
    if (parseInt(userInfo.totalTime) >= parseInt(userInfo.endTime)) {
        $("#lblresult").html("已学够结束学时，学习停止。");
        $("title").text($("title").text() + "-end");
        stopStudy();
        return false;
    }
	var ranTime = Math.round(2000 + 3000 * Math.random(), 0);
	setTimeout(startStudy, ranTime);

}
function init_disable() {
	$("#Start").attr("disabled", "disabled");
	$("#courseSelect").attr("disabled", "disabled");
	$("#End").removeAttr("disabled");
}
function init_enable() {
	$("#End").attr("disabled", "disabled");
	$("#Start").removeAttr("disabled");
	$("#courseSelect").removeAttr("disabled");
}

function stopStudy() {
	//关闭当前窗口
	var message = {};
	message.type = "stop";
	message.id = newTabId;
	chrome.extension.sendMessage(JSON.stringify(message), function (response) { });
	init_enable();
}
//*********************************************************************************************/
chrome.extension.onMessage.addListener(function (response, sender, sendResponse) {
	response = JSON.parse(response);
	if (response.type == "create") {
		newTabId = response.id;
	}
	if (response.type == "progress") {
		$("#currentPlayTime").html(response.message);
	}
	if (response.type == "next") {
		startNext();
	}
});