
//wirte on 2021.11.12
var studyInfo = {};
function init_studyInfo(){
	studyInfo.years = ["2024","2023","2022","2021","2020","2019","2018","2017"];
}
//初始化界面
function init_interface(){
	var courseSelect = "<select id='courseSelect' style='width:100px;height:30px;' ></select>&nbsp;&nbsp;&nbsp;&nbsp;";
	$("span[data-bind='foreach:queryYearList']").append(courseSelect);
	var selectOptions = "";
    for (var i = 0; i < studyInfo.years.length; i++) {
        selectOptions += "<option value='" + (i+1) + "'>" + studyInfo.years[i] + "</option>";
    }
    $("#courseSelect").html(selectOptions);
}   

$(document).ready(function(){
	init_studyInfo();
	init_interface();
});

function initListData(page,data){
	
    pageIndex = page;
    viewModel.curPage(pageIndex);
	var queryYear = $("#courseSelect option:selected").val();
	 var obj = {};
//  后台传参
    var obj = {
        "pageSize":50,
		"pageNum":pageIndex,
		"title":viewModel.title(),//名称
		"num":viewModel.num(),//状态
		"queryYear":queryYear,
		"special":viewModel.zt()//专题
    };
	var param = JSON.stringify(obj);
	
	ajaxPostData('api-course/zjCourse/publicCourseList',param);
	$("#pager").pagination(PostData.totalElements, {//totalElements是后台返回的数据变量，代表总条数
		num_edge_entries: 2,                   //两侧首尾分页条目数
		num_display_entries: 4,               //连续分页主体部分分页条目数
		items_per_page:10,
		current_page: pageIndex,        //当前页索引
		prev_text:"上一页",
		next_text:'下一页',
		callback: PageCallback,
	});
	viewModel.InformationManagementList(PostData.content);
	viewModel.activityListLen(parseInt(PostData.totalElements));
}

function ajaxPostData(urls, param) {
  $.ajax({
	async: false,
    type: "post",
    url: orgUrl + urls,
    data: param,
    dataType: "JSON",
    xhrFields: {withCredentials: true},
    contentType: "application/json",
    beforeSend: function (request) {
		  if(localStorage.getItem("token")){
              request.setRequestHeader("token",localStorage.getItem("token"));
		  }else {
              request.setRequestHeader("token","String");
          }
    },
    success: function (data) {
      if (data.code == 0) {
		if(data.obj.content){
			for(var i=0;i<data.obj.content.length;i++){
				data.obj.content[i].isTime = 2;
			}
		} 
        PostData = data.obj;
      }
    },
    error: function (data) {
	  PostData=null;
    }
  });
}