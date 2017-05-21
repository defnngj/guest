from suds.client import Client

# 使用库 suds_jurko： https://bitbucket.org/jurko/suds
# web service 查询： http://www.webxml.com.cn/zh_cn/web_services.aspx
# 电话号码归属地查询


url = 'http://ws.webxml.com.cn/WebServices/MobileCodeWS.asmx?wsdl'
client = Client(url)
#print(client)
result = client.service.getMobileCodeInfo(18611001100)
print(result)