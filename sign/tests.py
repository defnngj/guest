#coding=utf-8
from django.core.urlresolvers import resolve
from django.template.loader import render_to_string
from django.http import HttpRequest
from django.test import TestCase
from django.test import Client
from datetime import datetime,timezone
from unittest import mock

from sign.views import index
from django.contrib.auth.models import User
from sign.models import Event
import time


# Create your tests here.

class IndexPageTest(TestCase):
    ''' 测试index登录首页'''

    def test_root_url_resolves_to_index_page(self):
        ''' 测试根url是否解析到登录页 '''
        found = resolve('/')
        self.assertEqual(found.func, index)

    def test_index_page_returns_correct_html(self):
        ''' 测试调用index函数返回的页与模板加载的index2.html是否相等 '''
        request = HttpRequest()
        response = index(request)
        expected_html = render_to_string('index2.html')
        self.assertEqual(response.content.decode(), expected_html)



class LoginActionTest(TestCase):
    ''' 测试登录动作'''

    def setUp(self):
        User.objects.create_user('admin', 'admin@mail.com', 'admin123456')

    def test_login_action_username_password_error(self):
        ''' 用户名密码为空 '''
        c = Client()
        response = c.post('/login_action/', {'username':'','password':''})
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"username or password null!", response.content)

    def test_login_action_username_password_error(self):
        ''' 用户名密码错误 '''
        c = Client()
        response = c.post('/login_action/', {'username':'abc','password':'123'})
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"username or password error!", response.content)

    def test_login_action_success(self):
        ''' 登录成功 '''
        c = Client()
        response = c.post('/login_action/', data = {'username':'admin','password':'admin123456'})
        print(response.status_code)
        self.assertEqual(response.status_code, 302)


class  EventMangeTest(TestCase):

    def setUp(self):
        Event.objects.create(name="xiaomi5",limit=2000,address='beijing',status=1,start_time=timezone.now())


    def test_data(self):
        event = User.objects.get(name="xiaomi5")
        self.assertEqual(event.address, "beijing")

    def test_event_mange_aaa(self):
        ''' 测试发布会管理 '''
        c = Client()
        response = c.post('/event_manage/')
        print(response.status_code)
        print(response.content)
        #self.assertEqual(response.status_code, 200)
        #self.assertIn(b"username or password null!", response.content)



'''
class MyTest2(TestCase):

    def setUp(self):
        User.objects.create_user('admin', 'admin@mail.com', 'admin123456')

    def atest_add_author_email(self):
        """test add auhor useranme and  password"""
        user = User.objects.get(username="admin")
        self.assertEqual(user.username, "admin")
        #self.assertEqual(user.password, "admin123456")

    def setUp(self):
        number = input("Enter a number:")
        self.number = int(number)

    def aatest_case(self):
        self.assertEqual(self.number, 10, msg="Your input is not 10!")

'''
