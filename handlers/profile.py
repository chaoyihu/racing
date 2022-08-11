import os
import json
import redis
from tornado.web import RequestHandler

from dotenv import load_dotenv
load_dotenv()


class ProfileHandler(RequestHandler):

    async def get(self, slug):
        html_file = os.getenv("HTML_PATH") + "/profile.html"
        with open(html_file) as f:
            self.write(f.read())

    async def post(self, slug):
        print("getting user data...")
        session_id = slug
        r = redis.Redis(charset="utf-8", decode_responses=True)
        username = r.hget("session_id_to_username", session_id)
        self.write(json.dumps({
            "type": "user_data",
            "username": username,
            "user_history": ["history1", "history2"],
            "user_level": 999
            }))
        


