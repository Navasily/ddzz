function setAnswers() {
    setTimeout(function () {
        $(".app-main").find("button").trigger("click");
    }, 2000);
    setTimeout(function () {
        $(".app-main").find("button").trigger("click");
    }, 4000);
    setTimeout(function () {
        $(".el-message-box__wrapper").find(".el-button--primary").trigger("click");
    }, 6000);
    setTimeout(function () {
        var message = {};
        message.type = "close";
        chrome.extension.sendMessage(JSON.stringify(message), function (response) { });
    }, 8000);
}
function openExam(){
    var btnCount = $("button").length;
    $("button").eq(btnCount-1).trigger("click");
}