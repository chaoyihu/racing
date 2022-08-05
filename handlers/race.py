import os
import json
from tornado.websocket import WebSocketHandler

from dotenv import load_dotenv
load_dotenv()

class RaceHandler(WebSocketHandler):

    def open(self):
        html_file = os.getenv("HTML_PATH") + "/race.html"
        with open(html_file) as f:
            self.write(f.read())

    def on_message(self):
        pass

    def on_close(self):
        pass

    def heartbeat(self):
        pass

