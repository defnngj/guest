/*
 * @Author: dinghui
 * @Date:   2014-07-21 14:22:57
 * @Last Modified by:   dinghui
 * @Last Modified time: 2014-11-05 14:33:06
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

//入场离场的函数
function place_status_click(){
	var userid = arguments[0];
	var status = parseInt(arguments[1]);
	if(status){
		status = 0;
	}else{
		status = 1;
	}
	var str = $('#place_status').text() != '' ? $('#place_status').text() : $('#place_status_1').text();
	// var str = $("#make_sign").text();
	if("undefined" != typeof ajson_length){
		for(var i=0; i<ajson_length; i++){
			if($("#same_ul li").eq(i).hasClass('same_active')){
				var str = $("#same_sign #place_status").text();
			}
		}
	}

	$.post("/event/update_status",{gid:userid, status:status}, function(json){
		if(json['status'] == 200){
			$(".same_box").css("display","none");
			$("#txt_box").hide();
			$("#tips").text(str+"成功");
			$('#text_box_2').show();
			$('.smile').show();
			$('.cry').hide();
			$("#tips").css("background","none");
			refresh(2000);
		}
	},"json")
}

//点击入/离场
$("#place_status, #place_status_1").click(function(){
	if ($(this).hasClass('disabled')) {
		return
	};
	var userid, status;
	if(ajson_length){
		userid = userdata[tabBlock.getActive('#same_ul')].gid;
		status = userdata[tabBlock.getActive('#same_ul')].isin;
	}else{
		userid = $("#userid").val();
		status = $("#isin").val();
	}
	place_status_click(userid, status, this);
})

//签到的函数
function make_sign_click(){
	var userid = arguments[0];
	$.post("/event/check_signin_by_hand",{gid:userid}, function(json){
		if(json['status'] == 200){
			// if("undefined" != typeof ajson_length){
			// 	$("#tips").text("签到成功");
			// }else{
				$('#txt_box').css('display', 'block');
				$('#txt_box li').hide();
				$("#wins").show();
				$("#place_status").attr("disabled", true);
				$("#make_sign").attr("disabled", true);
				// $(".btn_issue,.issue_name,.message").hide();
			// }
			$(".same_box").css("display","none");
			refresh(2000);
		}
	},"json")
}
//点击确认签到
$("#make_sign, #make_sign_1").click(function(){
	if ($(this).hasClass('disabled')) {
		return
	};
	var userid;
	if(ajson_length){
		userid = userdata[tabBlock.getActive('#same_ul')].gid;
	}else{
		userid = $("#userid").val();
	}
	make_sign_click(userid);
})

function trimStr(str){
	return str.replace(/(^\s*)|(\s*$)/g,"");
}

function english_str(str){
	var pattern = new RegExp("^[a-zA-Z].*[a-zA-Z]$");
	return pattern.test(str);
}

function chinese_str(str){
	var pattern = new RegExp("[\u4e00-\u9fa5]");
	return pattern.test(str);
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
	$('#tips').text(str).css({
		color: '#333',
		background: 'none'
	});
	isStatusNormal = false;
	refresh(2000);
	return false;
}


function signSuccess(realname,phone){
	$('#text_box').show();
	$('#username').text(realname).css({
		color: '#333',
		background: 'none'
	});
	$('#telphone').text(phone).css({
		color: '#333',
		background: 'none'
	});
	isStatusNormal = false;
	refresh(2000);
	return false;
}

function enter(){
	isEnter = true;
	var phone   = trimStr($("#name").val());
	var length  = phone.length;
	var eventid = mzGlobalData.eid;
	//var eventid = 1;


	window.alert(eventid);
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
			$(".smile").hide();
			isEnter = false;
			//refresh(3000);
			return false;
		}else if(length != 11){	//用id去查
			$("#tips").text("手机号位数错误!");
			$("#tips").css("background","none");
			$("#cent_box_isn").show();//背景
			$("#cent_box").hide();//隐藏输入框
			$("#text").hide();//隐藏标题
			$("#name").val('');
			$("#text_box_2").show();//错误提示
			$(".smile").hide();
			isEnter = false;
			refresh(3000);
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
				}else if(json['status'] == 200){
					signSuccess(json['realname'],json['phone']);
					refresh(3000);
				}else{
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


var disabledSign = (function (){

	return function(opt){
		var option = {
			id: '',
			txt: ''
		}, tFlag;
		$.extend(true, option, opt);
		var el = $('#' + option.id);

		run();
		function run(){
			var _time = parseInt(el.find('i').text());
			if (_time > 1) {
				_time--;
				el.find('i').text(_time );
			}else{
				el.removeClass('disabled').html(option.txt);
				clearTimeout(tFlag);
				return false;
			}
			tFlag = setTimeout(run,1000);
		}
	}

})();

function refresh(){
	var time = arguments[0] ? arguments[0] : 100;
	setTimeout("window.location.href='/sign_index2/"+mzGlobalData.eid + "/'", time);
}

var tabBlock = function(){
    var _opt = {
        box: null,
        fun: null
    },
    tab = function(){
        var $box = $(_opt.box);
        var $li = $box.find('li');
        var $li_h = $li.outerHeight(true);
        var activeLi = 0;
        var liLen = $li.length;
        $li.eq(0).addClass('active');
        // $box.hover(function() {
            $(document).keyup(function(e){
                var e = e || window.event;
                if($('.btn_1').hasClass('disabled')){
	        		return false;
	        	}
                //向下翻动
                if(e.keyCode == 40){
                    if(activeLi < liLen-1){
                        activeLi++;
                        $li.removeClass('active');
                        $li.eq(activeLi).addClass('active');
                        $box[0].scrollTop = (activeLi-1)*$li_h;
                    }
                }
                //向上翻动
                if(e.keyCode == 38){
                    if(activeLi > 0){
                        activeLi--;
                        $li.removeClass('active');
                        $li.eq(activeLi).addClass('active');
                        $box[0].scrollTop = (activeLi)*$li_h;
                    }
                }
                $box.data('activeIndex', activeLi);
                if(typeof _opt.fun == 'function'){
	            	_opt.fun(activeLi);
	            }
            })
        // });

        $box.on('click','li',function(){
        	if($('.btn_1').hasClass('disabled')){
        		return false;
        	}
            $li.removeClass('active');
            $(this).addClass('active');
            activeLi = $(this).index();
            $box.data('activeIndex', activeLi);
            if(typeof _opt.fun == 'function'){
            	_opt.fun(activeLi);
            }
        })
    },
    getActive = function(box){
        var activeIndex = $(box).data('activeIndex') == undefined
            ? 0 : $(box).data('activeIndex');
        return activeIndex;
    }
    return {
        init: function(opt){
            $.extend(true, _opt, opt);
            tab();
        },
        getActive: function(box){
           return getActive(box);
        }
    }
}()
