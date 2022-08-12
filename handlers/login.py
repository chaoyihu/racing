import os
import json
import redis
import uuid
from tornado.web import RequestHandler
from tornado.escape import xhtml_escape

from dotenv import load_dotenv
load_dotenv()


async def register_session(username):
    sid = str(uuid.uuid1())
    r = redis.Redis(charset="utf-8", decode_responses=True)
    r.hset("session_id_to_username", sid, username)
    return sid

class LoginHandler(RequestHandler):

    async def get(self):
        html_file = os.getenv("HTML_PATH") + "/login.html"
        with open(html_file) as f:
            self.write(f.read())

    async def post(self):
        s = self.request.body.decode(encoding="utf-8")
        data = json.loads(s)
        print(data)
        if data["type"] == "login_credential":
            credential = {
                    "type": "password", 
                    "username": data["username"],
                    "password": data["password"]
                    }
        if data["type"] == "session_id":
            credential = {
                    "type": "session_id", 
                    "session_id": data["session_id"]
                    }
        validity, text = await self.credential_check(credential)
        if validity: # Assign or renew session id.
            session_id = text
            self.write(json.dumps({
                "type": "redirect",
                "protocol": "http",
                "url": "/profile/" + session_id,
                "session_id": session_id,
                }))
        else:                   # Alert error.
            error = text
            self.write(json.dumps({
                "type": "alert", 
                "text": error
                }))


    async def credential_check(self, credential):
        r = redis.Redis(charset="utf-8", decode_responses=True)
        if credential["type"] == "password":
            username = credential["username"]
            password = credential["password"]
            db_password = r.hget("username_to_password", username)
            if not db_password:
                return False, "Username does not exist."
            if password != db_password:
                return False, "Wrong password."
        if credential["type"] == "session_id":
            username = r.hget("session_id_to_username", credential["session_id"])
            if not username:
                self.write(json.dumps({
                    "type": "log", 
                    "text": "invalid session id. log in required."
                    }))
                return False, "Invalid session id. Need to log in."
        # assign/renew session id.
        session_id = await register_session(username)
        return True, session_id


