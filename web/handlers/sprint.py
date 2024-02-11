import os
import json
import redis
from random import choice
from tornado.web import RequestHandler
from utils.mycookie import get_cookie

from dotenv import load_dotenv
load_dotenv()


class SprintHandler(RequestHandler):

    async def get(self, endpoint):
        # endpoint is sprint_id
        html_file = os.getenv("HTML_PATH") + "/sprint.html"
        with open(html_file) as f:
            self.write(f.read())

    async def post(self, endpoint):
        self.sprint_id = endpoint
        cookie = self.request.headers.get("Cookie")
        sprint_id = get_cookie(cookie, "sprint_id")
        s = self.request.body.decode(encoding="utf-8")
        data = json.loads(s)
        if data["type"] == "get_sprint_info": 
            r = redis.Redis(host=os.getenv("REDIS_HOST"), charset="utf-8", decode_responses=True)
            rtitle = r.get(sprint_id + ":title")
            rintroduction = r.get(sprint_id + ":introduction")
            rduration = r.get(sprint_id + ":duration")
            rinitiator = r.get(sprint_id + ":initiator")
            all_tasks = set()
            for k in r.keys(sprint_id + "+task+*"):
                tid = k.split(":")[0]
                ttitle = r.get(tid + ":title")
                tcredits = r.get(tid + ":credits")
                all_tasks.add((tid, "/task/" + tid, ttitle, tcredits)) # [tlink, ttitle]
            all_tasks = [[tid, link, title, credits] for tid, link, title, credits in all_tasks]
            all_tasks.sort()
            r.quit()
            self.write(json.dumps({
                "type"        : "sprint_info",
                "id"          : sprint_id,
                "title"       : rtitle,
                "introduction": rintroduction,
                "duration"    : rduration,
                "initiator"   : rinitiator,
                "tasks"       : all_tasks
                }))