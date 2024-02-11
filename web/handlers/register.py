import os
import json
import redis
from tornado.web import RequestHandler
from handlers.login import register_session

from dotenv import load_dotenv
load_dotenv()

class RegisterHandler(RequestHandler):

    async def get(self):
        html_file = os.getenv("HTML_PATH") + "/register.html"
        with open(html_file) as f:
            self.write(f.read())

    async def post(self):
        s = self.request.body.decode(encoding="utf-8")
        data = json.loads(s)
        print(data)
        if data["type"] != "register_info":
            print(f"Unknown message type from client: ", data["type"])
            return None
        r = redis.Redis(host=os.getenv("REDIS_HOST"), charset="utf-8", decode_responses=True)
        print("checking if username is available.")
        exists = r.exists(data["username"] + ":password")
        if exists:
            self.write(json.dumps({
                "type": "alert",
                "text": "Username already exists."
                }))
        else:
            print("assign a session id")
            r.set(data["username"] + ":password", data["password"])
            session_id = await register_session(data["username"])
            self.write(json.dumps({
                "type": "redirect",
                "protocol": "https",
                "url": "/profile/" + session_id,
                "session_id": session_id,
                }))
            print(data["username"], r.get(session_id +":username"))
