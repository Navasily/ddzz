var courseList = new Array();
var currentCourseNum = 0;
var allCourse = new Array();
var isLearn = new Array();
//$(document).ready(function () {
//	init();
//	init_course();
//});

setTimeout(function(){init();init_course();},2000);

function init() {

	//出初始化控件
	var lblText = "请选择开始课程：";
	var courseSelect = "<select id='courseSelect' style='width:400px;height:30px;' ></select>&nbsp;&nbsp;&nbsp;&nbsp;";
	var btnStart = "<input type='button' value='开始' id='Start' style='height:30px;width:60px;border: 1px solid;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
	var btnEnd = "<input type='button' value='暂停' id='End' disabled='disabled' style='height:30px;width:60px;border: 1px solid ;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
	$(".tab").append("<div>" + lblText + courseSelect + btnStart + btnEnd + "</div>");

	var lblText2 = "当前学习课程：";
	var lblText3 = "</br>当前课程学习进度：";
	var lblCurrentCourseTitle = "<label id='lblCurrentCourseTitle'></label>";
	var currentPlayTime = "<label id='currentPlayTime'></label>";
	var lblresult = "<label id='lblresult' style='color:red'></label>";
	$(".tab").append("<div>" + lblText2 + lblCurrentCourseTitle + lblText3 + currentPlayTime + lblresult + "</div>");
}

function init_course() {
	//获取所有课程
	$.get("https://gbwkt.cbead.cn/api/v1/help-center/indexSearch?page=1&pageSize=2000&type=0%2C1&clientType=1", function (data) {
		allCourse = data.items;
		//获取已学课程，然后挑选未学课程
		$.get("https://gbwkt.cbead.cn/api/v1/course-study/course-study-progress/personCourse-list?findStudy=1&businessType=0&studyTimeOrder=desc&finishStatus=2&page=1&pageSize=1000", function (data2) {
			isLearn = data2.items;
			var isLearnFlag = false;
			for (var i = 0; i < allCourse.length; i++) {
				isLearnFlag = false;
				for (var j = 0; j < isLearn.length; j++) {
					if (allCourse[i].id == isLearn[j].courseId) {
						isLearnFlag = true;
						break;
					}
				}
				if (isLearnFlag == false) {
					var courseListRow = {};
					courseListRow.id = allCourse[i].id;
					courseListRow.name = allCourse[i].name;
					courseList.push(courseListRow);
				}
			}

			fillSelectOptions();
		});
	});
}

function fillSelectOptions() {
	if (courseList.length == 0) return;
	else {
		var selectOptions = "";
		for (var i = 0; i < courseList.length; i++) {
			selectOptions += "<option value='" + i + "' courseId='" + courseList[i].id + "'>" + courseList[i].name + "</option>";
		}
		$("#courseSelect").html(selectOptions);
	}

	$("#courseSelect").change(function () {
		currentCourseNum = $("#courseSelect option:selected").val();
		$("#lblCurrentCourseTitle").html("<font color='red'>" + $("#courseSelect option:selected").text() + "</font>");
	});
}