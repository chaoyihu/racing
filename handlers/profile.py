import os
import json
from tornado.web import RequestHandler

from dotenv import load_dotenv
load_dotenv()

class ProfileHandler(RequestHandler):

    async def get(self):
        html_file = os.getenv("HTML_PATH") + "/profile.html"
        with open(html_file) as f:
            self.write(f.read())

