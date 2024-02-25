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
        r = redis.Redis(host=os.getenv("REDIS_HOST"), charset="utf-8", decode_responses=True)
        print("checking if username is available.")
        exists = r.exists(data["username"] + ":password")
        if exists:
            self.write(json.dumps({
                "type": "alert",
                "message": "Username already exists."
                }))
        else:
            print("Assign a session id. Redirect to user profile page.")
            r.set(data["username"] + ":password", data["password"])
            session_id = await register_session(data["username"])
            self.write(json.dumps({
                "type": "redirect",
                "protocol": "http",
                "redirect_url": "/sprinting/profile/user/" + data["username"],
                "session_id": session_id,
                }))
            print(data["username"], r.get(session_id +":username"))

