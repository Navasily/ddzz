var userInfo = {};
var answerList = {};
var examTime = 0
$(document).ready(function () {
    setTimeout('$(".doingBtn").click()', 2000);
    examTime = Math.round(5000 + Math.random() * 5000);
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
    userInfo.examList = new Array();
    
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
    var examType = sessionStorage.getItem("examType");
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
                    for (var i = 0; i < examAnswerRecordList.length; i++) {
                        let correctOpions = new Array();
                        examAnswerRecordList[i].answer = jsonStrToArray(examAnswerRecordList[i].answer);
                        examAnswerRecordList[i].options = jsonStrToArray(examAnswerRecordList[i].options);
                        for(let j = 0; j<examAnswerRecordList[i].answer.length;j++){
                            switch (examAnswerRecordList[i].answer[j]){
                                case "A":correctOpions.push(examAnswerRecordList[i].options[0]);break;
                                case "B":correctOpions.push(examAnswerRecordList[i].options[1]);break;
                                case "C":correctOpions.push(examAnswerRecordList[i].options[2]);break;
                                case "D":correctOpions.push(examAnswerRecordList[i].options[3]);break;
                                case "E":correctOpions.push(examAnswerRecordList[i].options[4]);break;
                                case "F":correctOpions.push(examAnswerRecordList[i].options[5]);break;
                            }
                        }    
                        examAnswerRecordList[i].correctOpions = correctOpions;
                        userInfo.examList.push(examAnswerRecordList[i]);
                    }
                    setTimeout(function () { second_jiaojuan(subList); }, 10000);
                }
                else if(data.data.msg == "随堂测试合格"){
					if(examType != null){
						sessionStorage.setItem("examType","nextExam");
					}
					else {
						history.go(-1);
					}
                   
                }
            }
        }
    });
}

function second_jiaojuan(subList){
    var examId = getQueryVariable("examId");
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
                    peopleRecordListRow.answer = new Array();
                    examList[i].options = jsonStrToArray(examList[i].options);
                    for(let j=0;j<userInfo.examList.length;j++){
                        if(examList[i].content == userInfo.examList[j].content){
                            for(let m=0;m<examList[i].options.length;m++){
                                for(let n=0;n<userInfo.examList[j].correctOpions.length;n++){
                                    if(examList[i].options[m] == userInfo.examList[j].correctOpions[n]){
                                        switch (m){
                                            case 0:peopleRecordListRow.answer.push("A");break;
                                            case 1:peopleRecordListRow.answer.push("B");break;
                                            case 2:peopleRecordListRow.answer.push("C");break;
                                            case 3:peopleRecordListRow.answer.push("D");break;
                                            case 4:peopleRecordListRow.answer.push("E");break;
                                            case 5:peopleRecordListRow.answer.push("F");break;
                                        }
                                        break;
                                    }

                                }
                            }
                            break;
                        }
                    }
                    peopleRecordListRow.answer = JSON.stringify(peopleRecordListRow.answer);
                    peopleRecordList.push(peopleRecordListRow);
                }
                subList.peopleRecordList = peopleRecordList;
                jiaojuan(subList);
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
function jsonStrToArray(jsonStr) {
    try {
      // 核心：JSON.parse 解析 JSON 字符串为数组
      const result = JSON.parse(jsonStr);
      // 验证解析结果是否为数组（避免非数组格式的 JSON 字符串）
      return Array.isArray(result) ? result : [];
    } catch (error) {
      // 异常处理（如 JSON 格式错误时）
      console.error("JSON 解析失败：", error);
      return [];
    }
  }