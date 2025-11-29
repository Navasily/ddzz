$(document).ready(function(){
	$("#libVideo").remove();
	clearInterval(timer);
	clearInterval(jstimer);
	jgtime = 10000;
	checkTime = 6000000000;
	timer=setInterval(updateLearn,jgtime);
});

function updateLearn(ac){
	if(study.st==1){
		setState("额定学习时间已完成。");
		return
	}
	linkTimes++;
	setState("连接学习记录服务器");
	study.curVideo=$("a.current").attr("vid");
	console.log("1.stop_study:"+ac);
	if(ac=="end"){
		console.log("2.stop_study:"+ac);
		study.curPoint=0;
	}else{
		study.curPoint=getCurTime();
	}
	var action=ac?ac:"studying";
	
	var talltime = getAllTime();
	console.log("curtime:"+study.curPoint);
	console.log("alltime:"+talltime);
	if(parseInt(talltime)>0 && parseInt(study.curPoint)==parseInt(talltime)){
		study.curPoint=0;
		action="end";
	}
	
	$.ajax({
		type: "POST",
		url: "learn_server.asp",
		data: study,
		dataType: "json",
		success: function(json){
			if(json.jg==1){
				linkTimes=0;
				setState("学习记录保存成功");
				if(json.state==1){
					setTimeout(function(){
						tongbu_xueshi(study.gcid);
					},500);	
					studyState=1;
					study.st=1;
					//clearInterval(timer);
					if(timer)clearInterval(timer);
					if(jstimer)clearInterval(jstimer);
					if(isPop){
						if(poptimer)clearTimeout(poptimer)
					}
					$("#jd_box").html("已完成");
					$("#jd").css("width","100%");
					$("#jd_txt").html("100%");
					setState("额定学习时间已完成。");
					layer.msg("额定学习时间已完成。",{icon:6});
				}else{
					$("#jd_box").html("已学了 "+json.percent);
					$("#jd").css("width",json.percent);
					$("#jd_txt").html(json.percent);
					setTimeout("setState('学习计时中',1)",5000);
				}
			}else{
                window.location.reload();
			}
		},
		error:function(x,y,z){
            window.location.reload();
		}
	});
}