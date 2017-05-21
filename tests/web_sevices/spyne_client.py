from suds.client import Client

url = "http://127.0.0.1:8000/?wsdl"
client = Client(url)

result = client.service.say_hello("tom", 5)
print(result)
