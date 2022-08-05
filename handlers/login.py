import os
import json
from tornado.web import RequestHandler

from dotenv import load_dotenv
load_dotenv()

class LoginHandler(RequestHandler):

    async def get(self):
        html_file = os.getenv("HTML_PATH") + "/login.html"
        with open(html_file) as f:
            self.write(f.read())

