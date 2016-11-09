/*
 * @Author: bugmaster
 * @Date:   2016-10-11 14:22:57
 * @Last Modified by:   bugmaster
 * @Last Modified time: 2016-10-11 14:33:06
 */
var userdata, ajson_length, isStatusNormal = true;

$(document).ready(function(){
	var re = function(){
		var h = $(window).height();
		var w = $(window).width();
		var text = $("#text").css("top",((h+160)/2)/2.4);
		var show_height = $("#show").css("top",(h+280)/2);
		var show_width = $("#show").css("left",(w-350)/2);
		var cent_box_height = $("#cent_box").css("top",(h+10)/2);
		var btn = h-84;
		$("#bg_buttom").css("top",btn);
		$(".same_box").css("top",(h-$(".same_box").height())/2);
	};
	re();
	$(window).resize(function(){
		re();
	});
	$('#name').focus();
	$(document).on('click', function(event) {
		event.preventDefault();
		if($('#name').val() == ''){
			setTimeout(function(){
				$('#name').focus();
			},50)
		}
	});
});


function trimStr(str){
	return str.replace(/(^\s*)|(\s*$)/g,"");
}


var keycode, isEnter = false;
$(document).keydown(function(event){
	keycode=event.keyCode;
	if(keycode == 13 && !isEnter){
		enter();
	}
});

function wrongStatus(str){
	$("#cent_box_isn").show();
	$('#text_box_2').show();
	$(".cry").show();   //错误提示
	$(".smile").hide();
	$('#tips').text(str).css({
		color: '#333',
		background: 'none'
	});
	isStatusNormal = false;
	refresh(2000);
	return false;
}

//用户签到
function enter(){
	isEnter = true;
	var phone   = trimStr($("#name").val());
	var length  = phone.length;
	var eventid = mzGlobalData.eid;
	//var eventid = 1;


	if( !phone || length=='0'){
		isEnter = false;
		return false;
	}else{
		if(isNaN(phone)){
			$("#tips").text("输入格式错误!");
			$("#tips").css("background","none");
			$("#cent_box_isn").show();//背景
			$("#cent_box").hide();//隐藏输入框
			$("#text").hide();//隐藏标题
			$("#name").val('');
			$("#text_box_2").show();//错误提示
			$(".cry").show();   //错误提示
			$(".smile").hide();
			isEnter = false;
			refresh(2000);
			return false;

		}else if(length != 11){	//用id去查
			$("#tips").text("手机号位数错误!");
			$("#tips").css("background","none");
			$("#cent_box_isn").show();//背景
			$("#cent_box").hide();//隐藏输入框
			$("#text").hide();//隐藏标题
			$("#name").val('');
			$("#text_box_2").show();//错误提示
			$(".cry").show();   //错误提示
			$(".smile").hide();
			isEnter = false;
			refresh(2000);
			return false;
		}


		$.ajax({
			type:"post",
			url:"/api/user_sign/",
			data:{eid:eventid, phone:phone},
			dataType:"json",
			cache:false,
			success:function(json){
				if(json['status'] == 10025){
					wrongStatus('嘉宾不存在');
					refresh(2000);
				}else if(json['status'] == 10026){
					wrongStatus('该嘉宾没有参加此次发布会');
					refresh(2000);
				}else if(json['status'] == 10027){
					wrongStatus('嘉宾已签到');
					refresh(2000);
				}else if(json['status'] == 10024){
					wrongStatus('发布会已开始');
					refresh(2000);
				}else if(json['status'] == 10023){
					wrongStatus('发布会状态未开启');
					refresh(2000);
				}else if(json['status'] == 200){
					$("#realname").text(json['realname']);
					$("#realname").css("background","none");
					$("#tips").text(json['phone']);
					$("#tips").css("background","none");
					$("#cent_box_isn").show();//背景
					$("#cent_box").hide();//隐藏输入框
					$("#text").hide();//隐藏标题
					$("#name").val('');
					$("#text_box_2").show();
					$(".cry").hide();   //错误提示
					$(".smile").show();
					isEnter = false;
					refresh(3000);
					return false;
				}else{
					window.alert(json['status']);
					$("#cent_box_isn").show();//背景
					$("#text_box_2").show();//错误提示
					$("#cent_box").hide();//隐藏输入框
					$("#text").hide();//隐藏标题
					$(".smile").hide();
					$("#tips").css({
						background: 'none',
						color: '#333'
					}).text('验证失败');
					refresh(2000);
				}
				isEnter = false;
			},
			error:function() {
				isEnter = false;
				alert("你可能登录失效了或者断网了，请刷新当前页面。");
			}
		});

	}

}


function refresh(){
	var time = arguments[0] ? arguments[0] : 100;
	setTimeout("window.location.href='/sign_index2/"+mzGlobalData.eid + "/'", time);
}
