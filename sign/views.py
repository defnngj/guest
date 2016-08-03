from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect
from sign.models import Event,Guest
from django.contrib import auth
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger


# Create your views here.
# 首页(登录)
def index(request):
    return render(request,"index2.html")


# 登录动作
def login_action(request):
    if request.method == "POST":
        # 寻找名为 "username"和"password"的POST参数，而且如果参数没有提交，返回一个空的字符串。
        username = request.POST.get("username","")
        password = request.POST.get("password","")
        if username == '' or password == '':
            return render(request,"index.html",{"error":"username or password null!"})

        user = auth.authenticate(username = username, password = password)
        if user is not None:
            auth.login(request, user) # 验证登录
            response = HttpResponseRedirect('/event_manage/') # 登录成功跳转发布会管理
            request.session['username'] = username    # 将 session 信息写到服务器
            return response
        else:
            return render(request,"index2.html",{"error":"username or password error!"})


# 退出登录
@login_required
def logout(request):
    #del request.session['username']
    auth.logout(request) #退出登录
    response = HttpResponseRedirect('/index/')
    return response



# 发布会管理（登录之后默认页面）
@login_required
def event_manage(request):
    event_list = Event.objects.all()
    username = request.session.get('username', '')
    return render(request, "event_manage.html", {"user": username,"events":event_list})


# 发布会名称搜索
@login_required
def sreach_name(request):
    username = request.session.get('username', '')
    sreach_name = request.GET.get("name", "")
    sreach_name_bytes = sreach_name.encode(encoding="utf-8")
    event_list = Event.objects.filter(name__contains=sreach_name_bytes)
    return render(request, "event_manage.html", {"user": username, "events": event_list})


# 嘉宾管理
@login_required
def guest_manage(request):
    guest_list = Guest.objects.all()
    username = request.session.get('username', '')

    paginator = Paginator(guest_list, 10)
    page = request.GET.get('page')
    try:
        contacts = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        contacts = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g. 9999), deliver last page of results.
        contacts = paginator.page(paginator.num_pages)
    return render(request, "guest_manage.html", {"user": username, "guests": contacts})


# 嘉宾手机号的查询
@login_required
def sreach_phone(request):
    username = request.session.get('username', '')
    sreach_phone = request.GET.get("phone", "")
    #sreach_name_bytes = sreach_phone.encode(encoding="utf-8")
    guest_list = Guest.objects.filter(phone__contains=sreach_phone)
    username = request.session.get('username', '')

    paginator = Paginator(guest_list, 10)
    page = request.GET.get('page')
    try:
        contacts = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        contacts = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g. 9999), deliver last page of results.
        contacts = paginator.page(paginator.num_pages)

    return render(request, "guest_manage.html", {"user": username, "guests": contacts})



# 签到页面
def sign_index(request, event_id):
    event = get_object_or_404(Event, id=event_id)
    guest_list = Guest.objects.filter(event_id=event_id)  # 签到人数
    sign_list = Guest.objects.filter(sign="1")            # 已签到数
    guest_data = str(len(guest_list))
    sign_data = str(len(sign_list))
    return render(request, 'sign_index.html', {'event': event,
                                               'guest':guest_data,
                                               'sign':sign_data})


# 签到动作
def sign_index_action(request,event_id):

    event = get_object_or_404(Event, id=event_id)
    guest_list = Guest.objects.filter(event_id=event_id)
    sign_list = Guest.objects.filter(sign="1")
    guest_data = str(len(guest_list))
    sign_data = str(len(sign_list)+1)

    phone =  request.POST.get('phone','')

    result = Guest.objects.filter(phone = phone)
    if not result:
        return render(request, 'sign_index.html', {'event': event,'hint': '手机号为空或不存在','guest':guest_data,'sign':sign_data})

    result = Guest.objects.filter(phone = phone,event_id = event_id)
    if not result:
        return render(request, 'sign_index.html', {'event': event,'hint': '该用户未参加此次发布会','guest':guest_data,'sign':sign_data})

    result = Guest.objects.get(phone = phone)

    if result.sign:
        return render(request, 'sign_index.html', {'event': event,'hint': "已签到",'guest':guest_data,'sign':sign_data})
    else:
        Guest.objects.filter(phone = phone).update(sign = '1')
        return render(request, 'sign_index.html', {'event': event,'hint':'签到成功!','user': result,'guest':guest_data,'sign':sign_data})


#签到接口
def sign_aciton(request):
    eventid =  request.POST.get('eid','')
    phone =  request.POST.get('phone','')

    if eventid =='' or phone == '':
        return HttpResponse('parameter error')

    result = Event.objects.filter(id = eventid)
    if not result:
        return HttpResponse('eventid null')

    result = Event.objects.get(id = eventid).status
    if not result:
        return HttpResponse('event status is not available')

    result = Guest.objects.filter(phone = phone)
    if not result:
        return HttpResponse('user phone null')

    result = Guest.objects.filter(phone = phone,event_id = eventid)
    if not result:
        return HttpResponse('user did not participate in the conference')

    result = Guest.objects.get(phone = phone).sign
    if result:
        return HttpResponse("user has sign in")
    else:
        Guest.objects.filter(phone = phone).update(sign = '1')
        return HttpResponse("sign success")




'''
get方法是从数据库的取得一个匹配的结果，返回一个对象，如果记录不存在的话，它会报错。
filter方法是从数据库的取得匹配的结果，返回一个对象列表，如果记录不存在的话，它会返回[]。
'''
