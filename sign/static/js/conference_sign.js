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
function enter(){
	isEnter = true;
	var param   = '';
	//var value   = trimStr($("#name").val());
	var phone   = trimStr($("#name").val());
	var length  = phone.length;
	//var eventid = mzGlobalData.eid;
	var eventid = 1;
	var isEnglish = english_str(phone);
	var needSign 	= false;
	var hasSign  	= false;
	var isIn   		= false;
	var multipleMsg = false;

	if(isEnglish){
		param = 'english';
	}
	var isChinese = chinese_str(phone);
	if(isChinese){
		param = 'realname';
	}
	var act     = '';

	if( !phone || length=='0'){
		isEnter = false;
		return false;
	}else{
		if(length == '6' && param ==''){	//用id去查
			param = "invite_code";
		}else if(length == '11' && !isNaN(phone[0]) && param ==''){ 	//用手机去查
			param = "phone";
		}else if(length > '11' && param ==''){	//大于长度11的，用链接url去取后面六位的id去查
			param = "invite_code";
		}else if(param==''){
			// $("#text_box_2").css("width", "auto");
			$("#tips").text("输入格式错误!");
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
				if(json['status'] == 200){
					var length = phone.length;
					userdata = json['result'];
					if(json['message'] == '获得多条用户信息'){
						multipleMsg = true;
						var str = '';
						ajson_length = userdata.length;
						if(ajson_length == 0){
							wrongStatus('该嘉宾的邀请函未发放或者已作废');
						}else{
							$("#cent_box_isn").show();
							$(".same_box,.same_text").show();
							$('#same_num').text(ajson_length);
							for(var i = 0; i < ajson_length; i++){
								var isSign = userdata[i].sign == 1 ? '<em class="is-sign"></em>' : '';
								str += '<li><div class="c_333"><span class="realname">' + userdata[i].realname + '</span>'
									+ '<span class="guest_type_name c_33c6f1">' + userdata[i].guest_type_name + '</span>'
									+ '<span class="seat_number">' + userdata[i].seat_number + '</span>'
									+ (Number(userdata[i].traffic_allowance) > 0 ? '<span class="traffic_allowance"></span>' : '' ) + '</div>'
									+ '<div class="c_90989a"><span class="position">' + userdata[i].position + '</span>'
									+ '<span class="company">' + userdata[i].company + '</span></div>'
									+ '<div class="c_90989a"><span class="phone">' + userdata[i].phone + '</span>'
									+ '<span class="email">' + userdata[i].email + '</span></div>'
									+ '<em class="li-selected"></em>' + isSign + '</li>';
							}
							$('#same_ul').html(str);
							tabBlock.init({
								box: '#same_ul',
								fun: function(ind){
									if(userdata[ind].sign == 0){
										$('#make_sign_1').css('display', 'inline-block').text('确认签到');
										$('#place_status_1').hide();
										needSign = true;
										isIn = hasSign = true;
									}else if(userdata[ind].sign == 1){
										needSign = false;
										$('#place_status_1').css('display', 'inline-block');
										$('#make_sign_1').hide();
										if(userdata[ind].isin == 0){
											$('#place_status_1').text('入场');
											hasSign = true;
										}else{
											$('#place_status_1').text('离场');
											isIn = true;
										}
									}
								}
							});
							if(userdata[0].sign == 0){//未签到状态
								$('#make_sign_1').css('display', 'inline-block').addClass('disabled').html("确认签到<em>(<i>3</i>s)</em>");
								disabledSign({id:'make_sign_1', txt:'确认签到'});
								needSign = true;
							}else{//
								$('#place_status_1').css('display', 'inline-block');
								if(userdata[0].isin == 0){//已签到未入场
									$('#place_status_1').addClass('disabled').html("入场<em>(<i>3</i>s)</em>");
									disabledSign({id:'place_status_1', txt:'入场'});
									hasSign = true;
								}else{//已签到且已入场
									$('#place_status_1').addClass('disabled').html("离场<em>(<i>3</i>s)</em>");
									disabledSign({id:'place_status_1', txt:'离场'});
									isIn = true;
								}
							}
						}
					}else if(json['message'] == '直接签到'){
						$("#wins").show();					//成功提示
						$("#been_in").hide();
						$(".btn_issue").hide();
						refresh(2000);
					}else if(json['message'] == '获得一条用户信息'){
						if(userdata['present'] == 0){
							wrongStatus('该嘉宾不出席');
						}else if( (userdata['sign']==0 && userdata['isin']==0 && length>11 && param!='realname' && userdata['valid']==1 && userdata['sent']==1)
							|| (userdata['sign']==0 && userdata['isin']==0 && length==6 && userdata['valid']==1 && userdata['sent']==1)
							|| (userdata['sign']==0 && userdata['isin']==0 && length==11 && userdata['valid']==1 && userdata['sent']==1)
							|| (userdata['sign']==0 && userdata['isin']==0 && userdata['valid']==1 && userdata['sent']==1 && (param=='realname' || param=='english')) )
						{
							wrongStatus("邀请函已作废");
						}else if( (userdata['sign']==0 && userdata['isin']==0 && length>11 && param!='realname' && userdata['valid']==0 && userdata['sent']==0)
							|| (userdata['sign']==0 && userdata['isin']==0 && length==6 && userdata['valid']==0 && userdata['sent']==0)
							|| (userdata['sign']==0 && userdata['isin']==0 && length==11 && userdata['valid']==0 && userdata['sent']==0)
							|| (userdata['sign']==0 && userdata['isin']==0 && userdata['valid']==0 && userdata['sent']==0 && (param=='realname' || param=='english')) )
						{
							wrongStatus("该嘉宾未发放邀请函");
						// }else if( (userdata['sign']==0 && userdata['isin']==0 && length>11 && param!='realname' && userdata['valid']==1 && userdata['sent']==0)
						// 	|| (userdata['sign']==0 && userdata['isin']==0 && length==6 && userdata['valid']==1 && userdata['sent']==0)
						// 	|| (userdata['sign']==0 && userdata['isin']==0 && length==11 && userdata['valid']==1 && userdata['sent']==0)
						// 	|| (userdata['sign']==0 && userdata['isin']==0 && userdata['valid']==1 && userdata['sent']==0 && (param=='realname' || param=='english')) )
						// {
						// 	wrongStatus("邀请函已作废、未发放");
						}else if((userdata['sign']==1 && userdata['isin']==1 && length>11 && param!='realname') || (userdata['sign']==1 && userdata['isin']==1 && length==6) || (userdata['sign']==1 && userdata['isin']==1 && length==11) || (userdata['sign']==1 && userdata['isin']==1 && (param=='realname' || param=='english'))){
							$("#been_in").show();				//在场状态提示
							$(".btn_issue").hide();
							$(".been_img").hide();
							$("#wined").show().parent().addClass('signed');
							$("#place_status").addClass('disabled').html("离场<em>(<i>3</i>s)</em>");
							disabledSign({id:'place_status', txt:'离场'});
						}else if((userdata['sign']==1 && userdata['isin']==0 && length>11 && param!='realname') || (userdata['sign']==1 && userdata['isin']==0 && length==6) || (userdata['sign']==1 && userdata['isin']==0 && length==11) || (userdata['sign']==1 && userdata['isin']==0 && (param=='realname' || param=='english'))){
							$("#been_in").show();				//在场状态提示
							$(".btn_issue").hide();
							$(".been_img").hide();
							$("#place_status").addClass('disabled').html("入场<em>(<i>3</i>s)</em>");
							disabledSign({id:'place_status', txt:'入场'});
							$("#wined").show().parent().addClass('signed');
							$("#place_status").focus()
							$("#place_status").attr("onkeydown","FSubmit()");
						}else if(userdata['sign']==0 && userdata['isin']==0 && length==6 && userdata['valid']==0 && userdata['sent']==1){
							$(".btn_issue").show();
							$("#been_in").hide();

						}else if(userdata['sign']==0 && userdata['isin']==0 && length==11 && userdata['valid']==0 && userdata['sent']==1){
							$(".btn_issue").show();
							$("#been_in").hide();

						}else if(userdata['sign']==0 && userdata['isin']==0 && userdata['valid']==0 && userdata['sent']==1 && (param=='realname' || param=='english')){
							$(".btn_issue").show();
							$("#been_in").hide();
						}
					}
					if(!multipleMsg && isStatusNormal){
						$("#txt_box").show();
						$("#userid").val(userdata['gid']);
						$("#username").text(userdata['realname']);
						$("#typename").text(userdata['guest_type_name']);
						$("#station").text(userdata['company']);
						$("#position").text(userdata['position']);
						$("#telphone").text(userdata['phone']);
						$("#email").text(userdata['email']);
						$("#seat").text(userdata['seat_number']);
						$("#isin").val(userdata['isin']);
						$("#issignin").val(userdata['sign']);
						if (userdata['traffic_allowance']>0) {
							// alert(userdata['tra_money'])
							$("#start").css("display","inline-block");
						};
						$("#cent_box_isn").show();//背景
						$("#cent_box").hide();//隐藏输入框
						$("#text").hide();//隐藏标题
						$("#name").val('');
						//clearInterval(timer1);

						$("#make_sign").addClass('disabled').html("确认签到<em>(<i>3</i>s)</em>");
						disabledSign({id:'make_sign', txt:'确认签到'});

						if($(".btn_issue").is(":visible")){//未签到

							needSign = true;
						}
						if($("#been_in").is(":visible")){//已签到
							hasSign = true;
						}
					}

					setTimeout(function(){
						$(document).on('keyup', function(e){
							e = e || window.event;

							if(e.keyCode == 13 ){
								if(multipleMsg){
									userdata = userdata[tabBlock.getActive('#same_ul')];
								}
								// if(!ajson_length){
								// 	needSign = hasSign = isIn = true;
								// }
								if(needSign){//未签到
									make_sign_click(userdata['gid']);
								}else if(hasSign || isIn){//已签到
									place_status_click(userdata['gid'], userdata['isin']);
								}
								document.onkeydown=null;
							}

							if(e.keyCode == 27){
								refresh();
								document.onkeydown=null;
							}
						})
					},2000)
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
	//setTimeout("window.location.href='/event/sign_index?eid="+ mzGlobalData.eid + "'", time);
	setTimeout("window.location.href='/sign_index2/'", time);
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
