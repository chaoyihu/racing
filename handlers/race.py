import os
import json
from tornado.web import RequestHandler

from dotenv import load_dotenv
load_dotenv()

class RaceHandler(RequestHandler):

    async def get(self, slug): 
        self.race_id = slug
        html_file = os.getenv("HTML_PATH") + "/race.html"
        with open(html_file) as f:
            self.write(f.read())

