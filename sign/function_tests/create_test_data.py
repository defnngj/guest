#coding=utf-8
'''
创建嘉宾表（sign_guest）测试数据。
'''
f = open("guests.txt",'w')

for i in range(1, 3001):
    id = str(i)
    realname = "张三" + id
    iphone = 13800110000 + i
    email = "zhangsan" + id + "@mail.com"
    sql = 'INSERT INTO sign_guest (id, realname, phone, email, sign, create_time, event_id) VALUES ('+id+',"'+realname+'",'+str(iphone)+ ',"'+email+'",0,NOW(),1 );'
    f.write(sql)
    f.write("\n")

f.close()
