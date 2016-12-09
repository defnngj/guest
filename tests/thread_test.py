#coding=utf-8
import requests
import threading
from time import time, strftime

base_url = "http://127.0.0.1:8000/sign/user_sign/"
'''
datas = {"eid":1,"phone":13800113000}
r = requests.post(base_url,data=datas)
print(r.text)
'''

#签到线程
def sign_thread(start_user,end_user):
    for i in range(start_user,end_user):
        phone = 13800110000 + i
        datas = {"eid":1,"phone":phone}
        r = requests.post(base_url,data=datas)
        #print("sign user:" + str(phone))
        result = r.json()
        try:
            assert result['message'] == "sign success"
        except AssertionError:
            print("phone:" + str(phone) + ",user sign fail!")
        else:
            print("phone:" + str(phone) + ",user sign success!")


#设置用户分组
lists = {1:1001,1001:2001,2001:3001}
#lists = {1:10}
#创建线程数组
threads = []

#创建线程
for start_user,end_user in lists.items():
    t = threading.Thread(target=sign_thread,args=(start_user,end_user))
    threads.append(t)


if __name__ == '__main__':
    #主线程
    start_time = time()

    #启动线程
    for i in range(len(lists)):
        threads[i].start()
    for i in range(len(lists)):
        threads[i].join()

    #主线程
    end_time = time()
    run_time = end_time - start_time
    print("Run time:%ss" %str(run_time))




# 签到状态修改
#UPDATE sign_guest SET SIGN=0;
