import unittest
import requests


class MyTest(unittest.TestCase):


    def test_login(self):
        payload = {'username': 'admin', 'password': 'admin123456'}
        r = requests.post("http://127.0.0.1:8000/login_action/", data=payload)
        print(r.status_code)
        print(r.text)



if __name__ == '__main__':
    unittest.main()
