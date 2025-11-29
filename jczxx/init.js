var courseList = new Array();
var currentCourseNum = 0;
var studyInfo = {};

$(document).ready(function(){
    init_info();
	init_course();
	init();
});

function init_info(){
    studyInfo.processInterval = 10000;
    studyInfo.processId = 0;
}

function init(){
	//出初始化控件
	$("#ser").html("");
	$(".kecheng_tab").css("height","150px");
	var lblText = "请选择开始课程：";
    var courseSelect = "<select id='courseSelect' style='width:400px;height:30px;' ></select>&nbsp;&nbsp;&nbsp;&nbsp;";
    var btnStart = "<input type='button' value='开始' id='Start' style='height:30px;width:60px;border: 1px solid;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
    var btnEnd = "<input type='button' value='暂停' id='End' disabled='disabled' style='height:30px;width:60px;border: 1px solid ;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
	$(".kecheng_tab").append("<div>" + lblText + courseSelect + btnStart + btnEnd + "</div>");

	var lblText2 = "当前学习课程：";
	var lblText3 = "</br>当前课程学习进度：";	
	var lblCurrentCourseTitle = "<label id='lblCurrentCourseTitle'></label>";
	var currentPlayTime = "<label id='currentPlayTime'></label>";
	var lblresult = "<label id='lblresult' style='color:red'></label>";
	var nextFlag = "<input type='hidden' id='nextFlag' value='false'>";
	$(".kecheng_tab").append("<div>" + lblText2 + lblCurrentCourseTitle + lblText3  + currentPlayTime + lblresult + nextFlag + "</div>");
	
	$("#courseSelect").change(function () {
		currentCourseNum = $("#courseSelect option:selected").val();
		$("#lblCurrentCourseTitle").html("<font color='red'>" + $("#courseSelect option:selected").text() + "</font>");
	});

	$("#Start").bind("click",
		function () {
			init_disable();
			$("#lblresult").html("");
			startStudy();
			setInterval(checkNextFlag,10000);
		});
	$("#End").bind("click",
		function () {
			init_enable();
			stopStudy();
		});
}

function init_course(){
	var ptcode = getQueryVariable("ptcode");
	var courseUrl = "http://study.teacheredu.cn/proj/studentwork/courseStudyList.htm?ptcode=" + ptcode + "&stageId=0&searchName=&pageSize=150&curPage=1";
	
	$.get(courseUrl,function(result){
		$(result).find(".kcal_title a").each(function(){
			var courseRow = {};
			courseRow.title = $(this).text().trim();
			courseRow.dom = $(this);
			courseList.push(courseRow);
		});

		if(courseList.length == 0) return;
		else{
			var selectOptions = "";
			for (var i = 0; i < courseList.length; i++) {
				selectOptions += "<option value='" + i + "'>" + courseList[i].title + "）</option>";
			}
			$("#courseSelect").html(selectOptions);
		}
	});
	
}

function startStudy(){
	$("#lblCurrentCourseTitle").html("<font color='red'>" + courseList[currentCourseNum].title + "</font>");
	//打开新窗口
	$(courseList[currentCourseNum].dom).click();
}

function checkNextFlag(){
	var flag = $("#nextFlag").val();
	if(flag == "true"){
		$("#nextFlag").val("false");
		startNext();
	}
}

function startNext() {
	currentCourseNum ++;
	if(currentCourseNum >= courseList.length ) {
		$("#lblresult").html("全部课程学习完毕！");
		return;
	}
	else{
		var ranTime = Math.round(2000+3000*Math.random(),0);
		setTimeout(startStudy,ranTime);
	}
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

function getQueryVariable(variable) {
	var query = window.location.href.split('?')[1];
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (pair[0] == variable) { return pair[1]; }
	}
	return (false);
}