from django.http import JsonResponse
from sign.models import Event,Guest
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
import time


#添加发布会接口
def add_event(request):
    eid =  request.POST.get('eid','')                # 发布会id
    name = request.POST.get('name','')               # 发布会标题
    limit = request.POST.get('limit','')             # 限制人数
    status = request.POST.get('status','')           # 状态
    address = request.POST.get('address','')         # 地址
    start_time = request.POST.get('start_time','')   # 发布会时间

    if eid =='' or name == '' or limit == '' or address == '' or start_time == '':
        return JsonResponse({'ststus':10021,'message':'parameter error'})

    result = Event.objects.filter(id = eid)
    if result:
        return JsonResponse({'ststus':10022,'message':'event id already exists'})

    result = Event.objects.filter(name = name)
    if result:
        return JsonResponse({'ststus':10023,'message':'event name already exists'})

    if status == '':
        status=1

    try:
        Event.objects.create(id=eid,name=name,limit=limit,address=address,status=int(status),start_time=start_time)
    except ValidationError as e:
        error = 'start_time format error. It must be in YYYY-MM-DD HH:MM:SS format.'
        return JsonResponse({'ststus':10024,'message':error})

    return JsonResponse({'ststus':200,'message':'add event success'})


# 发布会查询
def get_event_list(request):

    eid = request.GET.get("eid", "")
    name = request.GET.get("name", "")

    if eid == '' and name == '':
        return JsonResponse({'ststus':10021,'message':'parameter error'})

    if eid != '':
        datas = {}
        result = Event.objects.filter(id = eid)
        if result:
            for r in result:
                datas['name'] = r.name
                datas['limit'] = r.limit
                datas['status'] = r.status
                datas['address'] = r.address
                datas['start_time'] = r.start_time
            return JsonResponse({'ststus':200, 'message':'success', 'data':datas})
        else:
            return JsonResponse({'ststus':10022, 'message':'query result is empty'})

    if name != '':
        datas = []
        results = Event.objects.filter(name__contains = name)
        if results:
            event = {}
            for r in results:
                print(r.name)
                event['name'] = r.name
                event['limit'] = r.limit
                event['status'] = r.status
                event['address'] = r.address
                event['start_time'] = r.start_time
                datas.append(event)
            return JsonResponse({'ststus':200, 'message':'success', 'data':datas})
        else:
            return JsonResponse({'ststus':10022, 'message':'query result is empty'})


#嘉宾查询接口
def get_guest_list(request):
    eid = request.GET.get("eid", "")
    phone = request.GET.get("phone", "")

    if eid == '':
        return JsonResponse({'ststus':10021,'message':'eid cannot be empty'})

    if eid != '' and phone == '':
        datas = []
        results = Guest.objects.filter(event_id = eid)
        if results:
            guest = {}
            for r in results:
                guest['realname'] = r.realname
                guest['phone'] = r.phone
                guest['email'] = r.email
                guest['sign'] = r.sign
                datas.append(guest)
            return JsonResponse({'ststus':200, 'message':'success', 'data':datas})
        else:
            return JsonResponse({'ststus':10022, 'message':'query result is empty'})

    if eid != '' and phone != '':
        datas = {}
        results = Guest.objects.filter(phone = phone,event_id = eid)
        if results:
            for r in results:
                datas['realname'] = r.realname
                datas['phone'] = r.phone
                datas['email'] = r.email
                datas['sign'] = r.sign
            return JsonResponse({'ststus':200, 'message':'success', 'data':datas})
        else:
            return JsonResponse({'ststus':10022, 'message':'query result is empty'})


# 添加嘉宾接口
def add_guest(request):
    eid =  request.POST.get('eid','')                # 关联发布会id
    realname = request.POST.get('realname','')       # 姓名
    phone = request.POST.get('phone','')             # 手机号
    email = request.POST.get('email','')             # 邮箱

    if eid =='' or realname == '' or phone == '':
        return JsonResponse({'ststus':10021,'message':'parameter error'})

    result = Event.objects.filter(id = eid)
    if not result:
        return JsonResponse({'ststus':10022,'message':'event id null'})

    result = Event.objects.get(id = eid).status
    if not result:
        return JsonResponse({'ststus':10023,'message':'event status is not available'})

    event_limit = Event.objects.get(id = eid).limit     #发布会限制人数
    guest_limit = Guest.objects.filter(event_id = eid)  #发布会已添加的嘉宾数

    if len(guest_limit) >= event_limit:
        return JsonResponse({'ststus':10024,'message':'event number is full'})

    event_time = Event.objects.get(id = eid).start_time     #发布会时间
    print(event_time)
    etime = str(event_time).split(".")[0]
    timeArray = time.strptime(etime, "%Y-%m-%d %H:%M:%S")
    e_time = int(time.mktime(timeArray))

    now_time = str(time.time())        #当前时间
    ntime = now_time.split(".")[0]
    n_time = int(ntime)

    if n_time >= e_time:
        return JsonResponse({'ststus':10025,'message':'event has started'})

    try:
        Guest.objects.create(realname=realname,phone=int(phone),email=email,sign=0,event_id=int(eid))
    except IntegrityError as e:
        return JsonResponse({'ststus':10026,'message':'the event guest phone number repeat'})

    return JsonResponse({'ststus':200,'message':'add guest success'})


# 用户签到接口
def user_sign(request):
    eid =  request.POST.get('eid','')
    phone =  request.POST.get('phone','')

    if eid =='' or phone == '':
        return JsonResponse({'ststus':10021,'message':'parameter error'})

    result = Event.objects.filter(id = eid)
    if not result:
        return JsonResponse({'ststus':10022,'message':'event id null'})

    result = Event.objects.get(id = eid).status
    if not result:
        return JsonResponse({'ststus':10023,'message':'event status is not available'})

    result = Guest.objects.filter(phone = phone)
    if not result:
        return JsonResponse({'ststus':10024,'message':'user phone null'})

    result = Guest.objects.filter(phone = phone,event_id = eid)
    if not result:
        return JsonResponse({'ststus':10025,'message':'user did not participate in the conference'})

    result = Guest.objects.get(phone = phone).sign
    if result:
        return JsonResponse({'ststus':10026,'message':'user has sign in'})
    else:
        Guest.objects.filter(phone = phone).update(sign = '1')
        return JsonResponse({'ststus':200,'message':'sign success'})
