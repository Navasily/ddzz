function alert(message){
    $(".top ul").append("<li>" + message + "</li>")
}
window.close = function(){}

function updateStudyTime(doclose) {
    var courseId = $("#courseId").val();
	try{
		var url="http://study.teacheredu.cn/proj/studentwork/studyAjax/AddStudyTimeExit.json?time="+document.form2.passedtime.value;
		jQuery.ajax({ type: "POST", url: url,  dataType:"json",
       		data: "courseId="+courseId+"&studyTime="+ document.form2.passedtime.value,
       		success: function(msg){
              	 	if(msg!=0){
              			document.form2.leiji.value=msg;
            			begintime=0;
            			var zminute = parseInt(msg/3600);
            			var zsecond =  parseInt((msg%3600)/60);
            			//jQuery("#zonggong").html(zminute+"小时"+zsecond+"分钟" );
						if(fulltime != ""){
                    		if(parseInt(msg/60)>fulltime){
                    			jQuery("#zonggong").html(parseInt(fulltime)+"分钟")
                    		}
                    	}else{
                    			jQuery("#zonggong").html(parseInt(msg/60)+"分钟")
                    	}
            		}else{
            			alert( "更新时间失败,原因是你打开多个浏览器同时学习，只能记录第一次学习的时间。");
            		}
       		}
		});
	}catch(err) {
		alter(err.message);
	}
}

function getRandomSecond() {
   return getRandom(10) * 30 + 120 ;  //2-5 分钟的随机数
}

setTimeout(function(){randomTime = getRandomSecond();window.onbeforeunload = null;},10000);

function openTishi(minute,second) {
	;
	if(minute>=randomTime )  //学习15分钟时弹出窗口 提示更新时间
	{
		if(second=="0")
		{						
    		var tishiTime=document.form2.thzt.value;
    		updateStudyTime(0);
    		setRandomTipTime();
		}
	}
}

function openTishi(second)
{
	;
	if(second>=randomTime )  //随机时间提示
	{		
		var tishiTime=document.form2.thzt.value;
		updateStudyTime(0);	
		setRandomTipTime();
	}
}