import os
import json
from tornado.web import RequestHandler

from dotenv import load_dotenv
load_dotenv()

class InitiateRaceHandler(RequestHandler):

    async def get(self):
        html_file = os.getenv("HTML_PATH") + "/initiate_race.html"
        with open(html_file) as f:
            self.write(f.read())

