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

$(document).ready(function() {
    setTimeout(function(){
		init_baseInfo();
		init_compontent();
		init_alreadystudylist();
	},1000);
});
function init_baseInfo(){
	baseInfo.recordProgress = 10;
	baseInfo.userInfo = JSON.parse(localStorage.getItem("userInfo"));
	baseInfo.getTotalHours = function(){
		var postData = {
            idCardHash: baseInfo.userInfo.data.idCardHash
        };
        var requestUri = "/api/study/times/new";
        $.ajax({
            url: requestUri,
            type: 'post',
            data: JSON.stringify(postData),
            contentType: 'application/json;charset=utf-8',     
			success: function(data){
				if (typeof(data) != "undefined") {
					totalTime = data.data.totalHours;
					$("#lblTotalTime").html("<font color='red'>" + totalTime + "</font>");
					$("title").text(totalTime);
				}
                else if(data.success == false) setTimeout(baseInfo.getTotalHours,5000);
				else setTimeout(baseInfo.getTotalHours,5000);
			},
			error:function(){
				setTimeout(baseInfo.getTotalHours,5000);
			}
        });
	}
	baseInfo.pageSize = 15;
	baseInfo.pagenum = 0;
	baseInfo.totalpages = 0;
} 


function catEndTime() {
    var totalStudyTime = endTime;
    var getTotalMins = 0;
    var getTotalHoursByEndTime = 0;
    for (var i = currentCourseNum; i < courseList.length; i++) {
        getTotalMins += courseList[i].courseDuration;
        getTotalHoursByEndTime += courseList[i].creditHour;
        if (getTotalHoursByEndTime >= (totalStudyTime - totalTime)) break;
    }
    $("#lblEndTime").html(timeFormat(new Date(new Date().setMinutes(new Date().getMinutes() + getTotalMins)).getTime()));

}
function validateSet(){
	$("#lblresult").html("正在验证基础数据。。。");
	if($("#iptTime").val().trim() == "") {
		$("#lblresult").html("请输入结束学时。");
		return false;
	}
	else{
		var reg=/^[1-9]\d*$|^0$/;
		if(reg.test($("#iptTime").val().trim()) == false){
			$("#lblresult").html("结束学时请输入数字，注意数字 0 不要在第一位");
			return false;
		}
	}
	if(baseInfo.totalTime == -1){
		$("#lblresult").html("累计学时没有获取成功，请刷新页面重试。");
		return false;
	}
	else{
		//if(parseInt($("#iptTime").val().trim()) - totalTime <=0){
		//	$("#lblresult").html("结束学时请 大于 累计学时。");
		//	return false;
		//}
	}
	return true;
}
function init_disable(){
	$("#Start").attr("disabled", "disabled");
	$("#courseSelect").attr("disabled", "disabled");
	$("#End").removeAttr("disabled");
	$("#iptTime").attr("disabled", "disabled");
	$("#iptMa").attr("disabled", "disabled");	
}
function init_enable(){
	$("#End").attr("disabled", "disabled");
	$("#Start").removeAttr("disabled");
	$("#courseSelect").removeAttr("disabled");
	$("#iptTime").removeAttr("disabled");	
	$("#iptMa").removeAttr("disabled");	
}
function init_compontent() {
	$(".header").append("<div id='messageContent' style='width:1050px;padding:10px 10px;background-color: #fff;margin: 0 auto;line-height:30px;min-height:150px;'><div>");
    var lblText = "请选择开始课程：";
	var courseSelect = "<select id='courseSelect' style='width:500px;height:30px;' ></select>&nbsp;&nbsp;&nbsp;&nbsp;";
	var iptTime = "<input type='text' id='iptTime' value='' style='width:40px;height:27px;border: 1px solid;border-radius: 3px;text-align:center;'>&nbsp;&nbsp;&nbsp;&nbsp;";
    var btnStart = "<input type='button' value='开始' id='Start' style='height:30px;width:60px;border: 1px solid;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
    var btnEnd = "<input type='button' value='暂停' id='End' disabled='disabled' style='height:30px;width:60px;border: 1px solid ;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
	$("#messageContent").append("<div>" + lblText + courseSelect + iptTime + btnStart + btnEnd + "</div>");
    $("#Start").bind("click",
		function() {
			init_disable();
			if(validateSet() == false){
				init_enable();
				return;
			}
			$("#lblresult").html("");
            if(totalTime!=-1){
                endTime = totalTime + parseInt($("#iptTime").val());
                $("#endTime").html(endTime);
            }
			startStudy();			
    });
    $("#End").bind("click",
		function() {
			init_enable();
			stopStudy();
    });
	//选择框变化
    $("#courseSelect").change(function() {
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
    $("#courseSelect").change(function() {
        currentCourseNum = $("#courseSelect option:selected").val();
        $("#lblCurrentCourseTitle").html("<font color='red'>" + $("#courseSelect option:selected").text() + "</font>");
    });
	$("#lblresult").html("正在初始化，请稍后。。。");
}
function init_alreadystudylist(){
	
	var postData = {
		idCardHash: baseInfo.userInfo.data.idCardHash,
        pageSize: baseInfo.pageSize,
        pagenum: baseInfo.pagenum,
        studyStatus: "2"
	};
	var requestUri = "/api/study/my/courses";
	
	$.ajax({
        url: requestUri,
        type: 'post',
		data: JSON.stringify(postData),
        contentType: 'application/json;charset=utf-8',    
		success: function(dataSource){
			if (typeof(dataSource) != "undefined") {
				if(dataSource.datalist == null){
					init_alllist();
					return;
				}			
				baseInfo.totalpages = dataSource.totalpages;
				
				for(var i=0;i<dataSource.datalist.length;i++){
					var tempCourse = {};
					tempCourse.creditHour = dataSource.datalist[i].creditHour;
					tempCourse.courseId = dataSource.datalist[i].courseId;
					alreayStudyList.push(tempCourse);
				}
				baseInfo.pagenum += 1;
				if(baseInfo.pagenum >= baseInfo.totalpages) init_alllist();
				else init_alreadystudylist();
				
			} else {
				setTimeout(init_alreadystudylist,3000);
			}	
		}　　
    });
}
function init_alllist(){
	$.get('https://xixipx.gitee.io/ddzz/dsj/dsjlist2020',function(data){
		preCourseList = eval(data);
		if(preCourseList.length == 0){
			$("#lblresult").html("初始化学习列表错误，自动重试中。。。");
			setTimeout(init_alllist,3000);
			return;
		}
		init_studylist();		
	});
}
function init_studylist(){
	for (var i = 0; i < preCourseList.length; i++) {
		var isAdd = false;
        for (var j = 0; j < alreayStudyList.length; j++) {
            if (preCourseList[i].courseId == alreayStudyList[j].courseId) {
				alreayStudyList.splice(j,1);
                isAdd = true;
                break;
            }
        }
        if (isAdd == false){
			courseList.push(preCourseList[i]);
		} 
    }
	var selectOptions = "";
	for (var i = 0; i < courseList.length; i++) {
        selectOptions += "<option value='" + i + "'>" + courseList[i].courseName + "（时长：" + courseList[i].courseDuration + "分钟|学时：" + courseList[i].creditHour + "）</option>";
    }
    $("#courseSelect").html(selectOptions);
	baseInfo.getTotalHours();
	$("#lblresult").html("数据初始化完毕，可以进行学习了。");
    //随机填充38-48的学时
    //var r_xueshi = 38+Math.round(10*Math.random(),0);
    //$("#iptTime").val(r_xueshi);
	$("#iptTime").focus();
}
function nextable(){
	if(currentCourseNum >= courseList.length){
		$("#lblresult").html("所有课程已全部学完。");
		return false;
	}
	if (totalTime >= endTime){
		$("#lblresult").html("已学够结束学时，学习停止。");
		return false;
	}
	if($("#End").attr("disabled") == "disabled") return false;
	//今天学够学时
	if(maFlag == false) return false;
	return true;
}
function startNext(){
	if(nextable() == false) return;
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
	baseInfo.getTotalHours();
	setTimeout(catEndTime,3000);
    addTimeCount();
}
function addTimeCount() {
	$("#lblCurrentCourseTitle").html("<font color='red'>" + courseList[currentCourseNum].courseName + "（时长：" + courseList[currentCourseNum].courseDuration + "分钟|学时：" + courseList[currentCourseNum].creditHour + "）</font>");
	var postData = {
		courseId: currentCourse.courseId,
		idCardHash: baseInfo.userInfo.data.idCardHash,
		studyType: "VIDEO"
	}
	var requestUri = "/api/study/start";
	
	$.ajax({
        url: requestUri,
        type: 'post',
		data: JSON.stringify(postData),
        contentType: 'application/json;charset=utf-8',    
		success: function(data){
			console.log("begin");
			if(data.success == true){
				if(addtimeFlagCount>0){
					addtimeFlagCount = 0;
					$("#lblresult").html("");
				}			
				currentCourse.studyTimes = currentCourse.studyTimes ? currentCourse.studyTimes: 0;
				startStudyProcess();
			}
			else {
				addtimeFlagCount++;
				if(addtimeFlagCount < addtimeMaxCount) {
					setTimeout(addTimeCount,5000);
					$("#lblresult").html("当前学习课程没有记录，正在重试。。。");
				}
				else {
					addtimeFlagCount = 0;
					addtimeAllCount++;
					startNext();
				}
			
			}
		},
		error:function(){
			addtimeFlagCount++;
			if(addtimeFlagCount < addtimeMaxCount) {
				setTimeout(addTimeCount,5000);
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
	if(nextable() == false) {
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
		setTimeout(startNext,3000);
		return;
    } 
	else setTimeout(startStudyProcess,1000);
}
function StudyProgress(currentPlayTime){
	var postData = {
		courseId: currentCourse.courseId,
		studyTimes: currentPlayTime,
		idCardHash: baseInfo.userInfo.data.idCardHash
	}
	var requestUri = "/api/study/progress";
	$.ajax({
        url: requestUri,
        type: 'post',
		data: JSON.stringify(postData),
        contentType: 'application/json;charset=utf-8',    
		success: function(data){
			console.log(data.success + " 记录学时，当前播放时间:" + currentPlayTime);
		}　　
    });
}
function updateEnd(currentPlayTime){
	var postData = {
		courseId: currentCourse.courseId,
		idCardHash: baseInfo.userInfo.data.idCardHash
	}
	var requestUri = "/api/study/end";
	$.ajax({
        url: requestUri,
        type: 'post',
		data: JSON.stringify(postData),
        contentType: 'application/json;charset=utf-8',    
		success: function(data){
			if(data.success == false && data.message.indexOf("今天学习完成")!=-1){
				maFlag = false;
				$("#lblresult").html("今天学习完成课件的总时长超出100了，明天继续。");
				//延时到明天6:00 - 6:20继续学习。
				var oldTime = new Date().getDate();
				delayToStudyNext(oldTime);
			}
			else if(data.success == false) {
				$("#lblresult").html("学时记录错误。");
			}
			else console.log(data.success + "播放结束，当前播放时间:" + currentPlayTime);
		}　　
    });
}
function delayToStudyNext(oldTime){
	var today = new Date().getDate();
	var hours = new Date().getHours();
	if(today == oldTime || hours < 4) setTimeout(function(){delayToStudyNext(oldTime)},60000);
	else{
		maFlag = true;
		var milliseconds = Math.round(Math.random()*1200000,0);
        $("#lblresult").html("");
		setTimeout(startStudy,milliseconds);
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