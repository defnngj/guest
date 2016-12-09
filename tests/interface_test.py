# coding=utf-8
import unittest
import requests


class AddEventTest(unittest.TestCase):

    def setUp(self):
        self.base_url = "http://127.0.0.1:8000/api/add_event/"

    def test_add_event_all_null(self):
        ''' 所有参数为空 '''
        payload = {'eid':1,'':'','limit':'','address':"",'start_time':''}
        r = requests.post(self.base_url, data=payload)
        result = r.json()
        self.assertEqual(result['status'], 10021)
        self.assertEqual(result['message'], 'parameter error')

    def test_add_event_eid_exist(self):
        ''' id已经存在 '''
        payload = {'eid':1,'name':'一加4发布会','limit':2000,'address':"深圳宝体",'start_time':'2017'}
        r = requests.post(self.base_url, data=payload)
        result = r.json()
        self.assertEqual(result['status'], 10022)
        self.assertEqual(result['message'], 'event id already exists')

    def test_add_event_name_exist(self):
        ''' 名称已经存在 '''
        payload = {'eid':11,'name':'一加3手机发布会','limit':2000,'address':"深圳宝体",'start_time':'2017'}
        r = requests.post(self.base_url,data=payload)
        result = r.json()
        self.assertEqual(result['status'], 10023)
        self.assertEqual(result['message'], 'event name already exists')

    def test_add_event_data_type_error(self):
        ''' 日期格式错误 '''
        payload = {'eid':11,'name':'一加4手机发布会','limit':2000,'address':"深圳宝体",'start_time':'2017'}
        r = requests.post(self.base_url,data=payload)
        result = r.json()
        self.assertEqual(result['status'], 10024)
        self.assertIn('start_time format error.', result['message'])

    def test_add_event_success(self):
        ''' 添加成功 '''
        payload = {'eid':11,'name':'一加4手机发布会','limit':2000,'address':"深圳宝体",'start_time':'2017-05-10 12:00:00'}
        r = requests.post(self.base_url,data=payload)
        result = r.json()
        self.assertEqual(result['status'], 200)
        self.assertEqual(result['message'], 'add event success')


class GetEventListTest(unittest.TestCase):

    def setUp(self):
        self.base_url = "http://127.0.0.1:8000/api/get_event_list/"

    def test_get_event_list_eid_null(self):
        ''' eid 参数为空 '''
        r = requests.get(self.base_url, params={'eid':''})
        result = r.json()
        self.assertEqual(result['status'], 10021)
        self.assertEqual(result['message'], 'parameter error')

    def test_get_event_list_eid_error(self):
        ''' eid=901 查询结果为空 '''
        r = requests.get(self.base_url, params={'eid':901})
        result = r.json()
        self.assertEqual(result['status'], 10022)
        self.assertEqual(result['message'], 'query result is empty')

    def test_get_event_list_eid_success(self):
        ''' 根据 eid 查询结果成功 '''
        r = requests.get(self.base_url, params={'eid':1})
        result = r.json()
        self.assertEqual(result['status'], 200)
        self.assertEqual(result['message'], 'success')
        self.assertEqual(result['data']['name'],u'mx6发布会')
        self.assertEqual(result['data']['address'],u'北京国家会议中心')

    def test_get_event_list_nam_result_null(self):
        ''' 关键字‘abc’查询 '''
        r = requests.get(self.base_url, params={'name':'abc'})
        result = r.json()
        self.assertEqual(result['status'], 10022)
        self.assertEqual(result['message'], 'query result is empty')

    def test_get_event_list_name_find(self):
        ''' 关键字‘发布会’模糊查询 '''
        r = requests.get(self.base_url, params={'name':'发布会'})
        result = r.json()
        self.assertEqual(result['status'], 200)
        self.assertEqual(result['message'], 'success')
        self.assertEqual(result['data'][0]['name'],u'mx6发布会')
        self.assertEqual(result['data'][0]['address'],u'北京国家会议中心')


class AddGuessTest(unittest.TestCase):

    def setUp(self):
        self.base_url = "http://127.0.0.1:8000/api/add_guest/"

    def test_add_guest_all_null(self):
        ''' 参数为空 '''
        payload = {'eid':'','realname':'','phone':''}
        r = requests.get(self.base_url, data=payload)
        result = r.json()
        self.assertEqual(result['status'], 10021)
        self.assertEqual(result['message'], 'parameter error')

    def test_add_guest_eid_null(self):
        ''' eid=901 查询为空 '''
        payload = {'eid':901,'realname':'tom','phone':13711001100}
        r = requests.post(self.base_url, data=payload)
        result = r.json()
        self.assertEqual(result['status'], 10022)
        self.assertEqual(result['message'], 'event id null')

    def test_add_guest_status_close(self):
        ''' eid=2 状态未开启 '''
        payload = {'eid':2,'realname':'tom','phone':13711001100}
        r = requests.post(self.base_url,data=payload)
        result = r.json()
        self.assertEqual(result['status'], 10023)
        self.assertEqual(result['message'], 'event status is not available')

    def test_add_guest_limit_full(self):
        ''' eid=3 发布会人数已满 '''
        payload = {'eid':3,'realname':'tom','phone':13711001100}
        r = requests.post(self.base_url,data=payload)
        result = r.json()
        self.assertEqual(result['status'], 10024)
        self.assertEqual(result['message'], 'event number is full')

    def test_add_guest_time_start(self):
        ''' eid=4 发布会已开始 '''
        payload = {'eid':4,'realname':'tom','phone':13711001100}
        r = requests.post(self.base_url,data=payload)
        result = r.json()
        self.assertEqual(result['status'], 10025)
        self.assertEqual(result['message'], 'event has started')

    def test_add_guest_phone_repeat(self):
        ''' phone=13800113001 手机号重复 '''
        payload = {'eid':1,'realname':'tom','phone':13800113001}
        r = requests.post(self.base_url,data=payload)
        result = r.json()
        self.assertEqual(result['status'], 10026)
        self.assertEqual(result['message'], 'the event guest phone number repeat')

    def test_add_guest_success(self):
        ''' 添加成功 '''
        payload = {'eid':1,'realname':'tom','phone':13711001100}
        r = requests.post(self.base_url,data=payload)
        result = r.json()
        self.assertEqual(result['status'], 200)
        self.assertEqual(result['message'], 'add guest success')


class GetGuestListTest(unittest.TestCase):

    def setUp(self):
        self.base_url = "http://127.0.0.1:8000/api/get_guest_list/"

    def test_get_guest_list_eid_null(self):
        ''' eid 参数为空 '''
        r = requests.get(self.base_url, params={'eid':''})
        result = r.json()
        self.assertEqual(result['status'], 10021)
        self.assertEqual(result['message'], 'eid cannot be empty')

    def test_get_event_list_eid_error(self):
        ''' 根据 eid 查询结果为空 '''
        r = requests.get(self.base_url, params={'eid':901})
        result = r.json()
        self.assertEqual(result['status'], 10022)
        self.assertEqual(result['message'], 'query result is empty')

    def test_get_event_list_eid_success(self):
        ''' 根据 eid 查询结果成功 '''
        r = requests.get(self.base_url, params={'eid':2})
        result = r.json()
        self.assertEqual(result['status'], 200)
        self.assertEqual(result['message'], 'success')
        self.assertEqual(result['data'][0]['realname'],'alen')
        self.assertEqual(result['data'][0]['phone'],'18633003301')

    def test_get_event_list_eid_phone_null(self):
        ''' 根据 eid 和phone 查询结果为空 '''
        r = requests.get(self.base_url, params={'eid':2,'phone':'10000000000'})
        result = r.json()
        self.assertEqual(result['status'], 10022)
        self.assertEqual(result['message'], 'query result is empty')

    def test_get_event_list_eid_phone_success(self):
        ''' 根据 eid 和phone 查询结果成功 '''
        r = requests.get(self.base_url, params={'eid':2,'phone':'18633003301'})
        result = r.json()
        self.assertEqual(result['status'], 200)
        self.assertEqual(result['message'], 'success')
        self.assertEqual(result['data']['realname'],'alen')
        self.assertEqual(result['data']['phone'],'18633003301')


class UserSignTest(unittest.TestCase):

    def setUp(self):
        self.base_url =  "http://127.0.0.1:8000/api/user_sign/"

    def test_user_sign_all_null(self):
        ''' 参数为空 '''
        payload = {'eid':'','phone':''}
        r = requests.post(self.base_url,data=payload)
        result = r.json()
        self.assertEqual(result['status'], 10021)
        self.assertEqual(result['message'], 'parameter error')

    def test_user_sign_eid_error(self):
        ''' eid=901 查询结果不存在 '''
        payload = {'eid':901,'phone':13711001100}
        r = requests.post(self.base_url,data=payload)
        result = r.json()
        self.assertEqual(result['status'], 10022)
        self.assertEqual(result['message'], 'event id null')

    def test_user_sign_status_close(self):
        ''' eid=2 发布会状态关闭 '''
        payload = {'eid':2,'phone':13711001100}
        r = requests.post(self.base_url,data=payload)
        result = r.json()
        self.assertEqual(result['status'], 10023)
        self.assertEqual(result['message'], 'event status is not available')

    def test_user_sign_time_start(self):
        ''' eid=3 发布会已开始 '''
        payload = {'eid':3,'phone':13711001100}
        r = requests.post(self.base_url,data=payload)
        result = r.json()
        self.assertEqual(result['status'], 10024)
        self.assertEqual(result['message'], 'event has started')

    def test_user_sign_phone_error(self):
        ''' phone=10100001111 手机号不存在 '''
        payload = {'eid':1,'phone':10100001111}
        r = requests.post(self.base_url,data=payload)
        result = r.json()
        self.assertEqual(result['status'], 10025)
        self.assertEqual(result['message'], 'user phone null')

    def test_user_sign_eid_phone_error(self):
        '''eid=1, phone=18633003301 手机号与发布会不匹配 '''
        payload = {'eid':1,'phone':18633003301}
        r = requests.post(self.base_url,data=payload)
        result = r.json()
        self.assertEqual(result['status'], 10026)
        self.assertEqual(result['message'], 'user did not participate in the conference')

    def test_user_sign_has_sign_in(self):
        ''' 已签到 '''
        payload = {'eid':1,'phone':13800113001}
        r = requests.post(self.base_url,data=payload)
        result = r.json()
        self.assertEqual(result['status'], 10027)
        self.assertEqual(result['message'], 'user has sign in')

    def test_user_sign_success(self):
        ''' 签到成功 '''
        payload = {'eid':1,'phone':13800112999}
        r = requests.post(self.base_url,data=payload)
        result = r.json()
        self.assertEqual(result['status'], 200)
        self.assertEqual(result['message'], 'sign success')


if __name__ == '__main__':
    unittest.main()


#===========
#部分用例数据还原
#DELETE FROM `sign_event` WHERE id = 11;
#DELETE FROM `sign_guest` WHERE event_id=1 AND phone=13711001100;
#UPDATE `sign_guest` SET SIGN=0   WHERE event_id=1 AND phone=13800112999;
#===========
