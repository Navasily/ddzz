var userInfo = {};
var answerList = {};
var examTime = 0
$(document).ready(function () {
    setTimeout('$(".doingBtn").click()', 2000);
    examTime = Math.round(20000 + Math.random() * 30000);
    //examTime = 6000;
    setTimeout(init_data, examTime);
});

function init_data() {

    var examId = getQueryVariable("examId");
    var courseId = getQueryVariable("courseId");
    var studyStatus = getQueryVariable("studyStatus");
    var examStatus = getQueryVariable("examStatus");
    var recordStatus = getQueryVariable("recordStatus");
    userInfo = JSON.parse(sessionStorage.getItem("userInfo")).data;
    var postData = {
        examId: examId,
        idCardHash: userInfo.idCardHash
    }
    var requestUri = "/api/myExam/web/getExam";
    $.ajax({
        url: requestUri,
        type: 'post',
        data: JSON.stringify(postData),
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (data.success == true) {
                var examList = data.data.dataList;
                var peopleRecordList = new Array();
                for (var i = 0; i < examList.length; i++) {
                    var peopleRecordListRow = {};
                    peopleRecordListRow.examId = examId;
                    peopleRecordListRow.questionId = examList[i].questionId;
                    peopleRecordListRow.answer = "";
                    peopleRecordList.push(peopleRecordListRow);
                }
                var firstSubList = {
                    tbtpId: '',
                    orgId: '',
                    orgCode: '',
                    telephone: userInfo.telephone,
                    examId: examId,
                    hash: userInfo.idCardHash,
                    sourceClient: "pc",
                    username: userInfo.name,
                    courseId: courseId,
                    studyStatus: studyStatus,
                    examStatus: examStatus,
                    recordStatus: recordStatus,
                    peopleRecordList: peopleRecordList
                };

                jiaojuan(firstSubList);
            }
        }
    });
}
function jiaojuan(subList) {
    var requestUri = "/api/myExam/web/v2/submitExam";
    $.ajax({
        url: requestUri,
        type: 'post',
        data: JSON.stringify(subList),
        contentType: 'application/json;charset=utf-8',
        success: function (data) {
            if (data.success == true) {
                if (data.data.msg == "随堂测试不合格") {
                    var examAnswerRecordList = data.data.examAnswerRecordList;
                    for (var i = 0; i < subList.peopleRecordList.length; i++) {
                        subList.peopleRecordList[i].answer = examAnswerRecordList[i].answer;
                    }
                    setTimeout(function () { jiaojuan(subList); }, 5000);
                }
                else if(data.data.msg == "随堂测试合格"){
                    var message = {};
		            message.type = "result";
		            //message.message = data.data.rightCount+"正确|"+Math.floor(examTime/1000)+"秒";
		            chrome.extension.sendMessage(JSON.stringify(message),function(response){});
                }
            }
        }
    });
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