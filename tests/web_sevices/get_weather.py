from suds.client import Client
from suds.xsd.doctor import ImportDoctor, Import


imp = Import('http://www.w3.org/2001/XMLSchema',
location='http://www.w3.org/2001/XMLSchema.xsd')
imp.filter.add('http://WebXml.com.cn/')


url = 'http://ws.webxml.com.cn/WebServices/WeatherWS.asmx?wsdl'
client = Client(url, plugins=[ImportDoctor(imp)])
#print(client)

result = client.service.getWeather("北京")
print(result)
