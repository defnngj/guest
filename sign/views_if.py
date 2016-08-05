from django.http import JsonResponse
from sign.models import Event,Guest

# 用户签到接口
def user_sign(request):
    eventid =  request.POST.get('eid','')
    phone =  request.POST.get('phone','')

    if eventid =='' or phone == '':
        return JsonResponse({'ststus':10021,'message':'parameter error'})

    result = Event.objects.filter(id = eventid)
    if not result:
        return JsonResponse({'ststus':10022,'message':'eventid null'})

    result = Event.objects.get(id = eventid).status
    if not result:
        return JsonResponse({'ststus':10023,'message':'event status is not available'})

    result = Guest.objects.filter(phone = phone)
    if not result:
        return JsonResponse({'ststus':10024,'message':'user phone null'})

    result = Guest.objects.filter(phone = phone,event_id = eventid)
    if not result:
        return JsonResponse({'ststus':10025,'message':'user did not participate in the conference'})

    result = Guest.objects.get(phone = phone).sign
    if result:
        return JsonResponse({'ststus':10026,'message':'user has sign in'})
    else:
        Guest.objects.filter(phone = phone).update(sign = '1')
        return JsonResponse({'ststus':200,'message':'sign success'})
