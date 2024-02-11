import os
import json
import redis
from tornado.web import RequestHandler

from utils.mycookie import get_cookie

from dotenv import load_dotenv
load_dotenv()


class ProfileViewHandler(RequestHandler):

    async def get(self, endpoint):
        _ = endpoint   # username
        html_file = os.getenv("HTML_PATH") + "/profile.html"
        with open(html_file) as f:
            self.write(f.read())

class ProfileActionHandler(RequestHandler):

    async def get(self, endpoint):
        if endpoint == "get_user_info":
            print("getting user data...")
            session_id = get_cookie(self.request.headers.get("Cookie"), "session_id")
            print(session_id)
            r = redis.Redis(host=os.getenv("REDIS_HOST"), charset="utf-8", decode_responses=True)
            username = r.get(session_id + ":username")
            self.write(json.dumps({
                "type": "user_data",
                "username": username,
                "user_history": ["history1", "history2"],
                "user_level": 0
                }))