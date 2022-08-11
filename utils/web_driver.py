####################################################### 
# Author: Chaoyi Hu, 2022

####################################################### 
# Leetcode data scraper on Chrome
# ref: https://medium.com/@vladbezden/execute-blocking-code-on-a-different-thread-using-asyncio-db4baa956d1f

from typing import *
import os
import time
import json
import tornado.ioloop
from tornado import httpclient
from apscheduler.schedulers.tornado import TornadoScheduler

from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.webdriver import WebDriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains

from dotenv import load_dotenv
load_dotenv()

class MyChromeDriver:
    """
    One chromedriver instance will use one port to talk to 2 subjects:
    1. Leetcode server: to get submissions list.
    2. DriverWebSocketHandler: so that ClientWebSocketHandler can be notified to send the updates to clients.
    """
    def __init__(self, client):
        chrome_options = Options()
        chrome_options.binary_location = os.getenv("GOOGLE_CHROME_BIN")
        chrome_options.headless = True
        chrome_options.add_argument('--disable-gpu')
        # https://stackoverflow.com/questions/53902507/unknown-error-session-deleted-because-of-page-crash-from-unknown-error-cannot
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        self.driver = WebDriver(os.getenv("CHROMEDRIVER_PATH"), options = chrome_options)     # headless by default
        self.client = client  # The client the web driver is responsible for.
        self.server_conn = httpclient.AsyncHTTPClient()
        self.submissions_list = None  # Store result from the most recent poll as List[str].Initialized as None.      

    def shut_down(self):
        try:
            self.scheduler.shutdown()
            self.driver.close()
        except:
            pass

    def scheduled_polling(self):
        # Selenium uses a blocking api, so we execute scheduled polling in a seperate worker.
        self.scheduler = TornadoScheduler()
        interval_length = 5
        self.scheduler.add_job(self.check_and_update, trigger='interval', seconds=interval_length)
        self.scheduler.start()
        print("Start scheduled polling every %d second(s) to get (%s) AC history." %  (interval_length, self.client.username))

    async def check_and_update(self):
        """
        Check if any newly solved problems. If any, send updates back to host/driver_return via http post request.
        """
        old_subs_list = self.submissions_list
        new_subs_list = await self.get_submissions_list()
        if len(new_subs_list) == 0: # occasionally the page text does not load and returns an empty list, then we simply abort the poll
            return
        self.submissions_list = new_subs_list # update the property
        new_records = self.compare(old_subs_list, new_subs_list)
        if new_records:
            msg = []
            for record in new_records:
                msg.append(self.client.username +" solved "+ record +"!")
            url = "http://" + os.getenv("HOST") + "/driver_return" 
            obj = json.dumps({"username": self.client.username, "update": msg})
            headers = {"Content-Type": "application/json"}
            response = await self.server_conn.fetch(url, method="POST", headers=headers, body=obj)
        else:
            print("No newly solved problem.")
    
    async def get_submissions_list(self):
        """
        This function polls list of acceptance (only AC) when webdriver is NOT logged in.
        """
        url = os.getenv("LC_HOME_URL") + "/" + self.client.username
        print("###### Accessing user profile page %s." % url)
        #print("###### Session id:", self.driver.session_id)
        self.driver.get(url)
        try:
            WebDriverWait(self.driver, 10).until(presence_of_element_with_non_empty_text((By.XPATH, "//span[@class='text-label-1 dark:text-dark-label-1 font-medium line-clamp-1']"))) # custom expected condition
        except:
            print("TimeoutException")
        print("Parsing html.")
        elems = self.driver.find_elements("xpath", "//span[@class='text-label-1 dark:text-dark-label-1 font-medium line-clamp-1']")
        return [elem.get_attribute('textContent') for elem in elems] 

 
    def compare(self, old_subs_list: List[str], new_subs_list: List[str]) -> List[str]:
        """
        Return list of new submissions since last poll. Return None if no new submission has been made. 
        Both arguments can be an empty list.
        """
        print("old", old_subs_list)
        print("new", new_subs_list)
        if not new_subs_list:
            return []
        if old_subs_list is None:
            return []
        if not old_subs_list:
            return new_subs_list
        p_old, p_new = 0, 0
        new_records = []
        while old_subs_list[p_old] != new_subs_list[p_new]:
            new_records.append(new_subs_list[p_new])
            p_new += 1
            if p_new >= len(new_subs_list):
                break
        return new_records

def presence_of_element_with_non_empty_text(locator):
    def _predicate(driver):
        try:
            element_text = driver.find_element(*locator).text.strip()
            return element_text != ""
        except:
            return False
    return _predicate

###################### Archived code ############################

## Used for login. Not needed any more.
#def element_actually_clickable(locator):
#    '''
#    Using EC.element_to_be_clickable will raise `ElementClickInterceptedException` because it does not really guarantee we click on the desired element. Instead, when chromedriver clicks on the `signin_btn` element, it was still overlayed by the loading page. Thus we define this customed expected condition.
#    '''
#    def _predicate(driver):
#        try:
#            btn = driver.find_element(*locator)
#            btn.click()
#        except:
#            return False
#        return True
#
#    return _predicate


# # User login not needed when accessing the public profile page. I gave up on logging in from web driver even if that allows me to access all submissions (both AC and non-AC), because the double logins of driver and user affects the user experience significantly - sometimes causing forced logout or failure in code submission. I now poll instead from leetcode.com/username (public profile page) that contains user acceptance list (only AC).
#     def user_login(self, username, password):
#         """
#         Log in to LeetCode for subsequent data queries.
#         """
#         url = CONFIG["LC_HOME_URL"] + "accounts/login/"
#         self.driver.get(url)
#         print("Accessing login page %s." % url)
# 
#         TIMEOUT = 10  # seconds
#         try:
#             wait1 = WebDriverWait(self.driver, TIMEOUT).until(EC.presence_of_element_located((By.ID, "id_login")))
#             wait2 = WebDriverWait(self.driver, TIMEOUT).until(EC.presence_of_element_located((By.ID, "id_password")))
#             wait1.send_keys(self.client.username)      # fill in username
#             wait2.send_keys(self.client.password)      # fill in password
#             WebDriverWait(self.driver, TIMEOUT).until(element_actually_clickable((By.XPATH, '//button[@id="signin_btn"]'))) # Custom expected condition. Do not call button.click() seperately because button will be clicked before we jump out of the checking loop.  
#         except TimeoutException:
#             print("TimeoutException!!!!")


# from bs4 import BeautifulSoup
# # This function polls list of all submissions (AC & non-AC) when webdriver is logged in.
#     def get_submissions_list(self):
#         """
#         Check submissions page, parse html for the list of recent submissions.
#         """
#         url = CONFIG["LC_HOME_URL"] + "submissions/"
#         print("Accessing submissions page %s." % url)
#         self.driver.get(url)
# 
#         WebDriverWait(self.driver, 5).until(EC.visibility_of_element_located((By.XPATH, "//table"))) # wait for table to load.
#         print("Capturing html", time.ctime(time.time()))
#         html = self.driver.page_source
# 
#         print("Parsing html.")
#         soup = BeautifulSoup(html, features = "lxml")
#         table = soup.find("table", attrs = {"class": "table table-striped table-bordered table-hover"})
#         table_body = table.find('tbody')
#         rows = table_body.find_all('tr')
#         new_subs_list = []
#         for row in rows:
#             cols = row.find_all('td')
#             cols = [ele.text.strip() for ele in cols]
#             new_subs_list.append(cols[1:])
#         return new_subs_list


