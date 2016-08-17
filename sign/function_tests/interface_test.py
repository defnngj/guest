#coding=utf-8
import unittest
import requests


class AddEventTest(unittest.TestCase):

    def setUp(self):
        self.base_url = "http://127.0.0.1:8000/sign/add_event/"

    def test_add_event_all_null(self):
        ''' 所有参数为空 '''
        r = requests.post(self.base_url)
        result = r.json()
        self.assertEqual(result['ststus'], 10021)
        self.assertEqual(result['message'], 'parameter error')

if __name__ == '__main__':
    unittest.main()
