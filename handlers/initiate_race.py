import os
import json
import redis
import uuid
from tornado.web import RequestHandler

from dotenv import load_dotenv
load_dotenv()


async def update_task(tid, ttitle, tdescription, tcredits):
    r = redis.Redis(charset="utf-8", decode_responses=True)
    if r.hexists("task_id_to_task_link", tid):
        tlink = r.hget("task_id_to_task_link", tid)
    else:
        tlink = "/task/" + tid
    r.hset("task_id_to_task_title", tid, ttitle)
    r.hset("task_id_to_task_title", tid, tdescription)
    r.hset("task_id_to_task_title", tid, tcredits)
    return tlink 


class InitiateRaceHandler(RequestHandler):

    async def get(self):
        html_file = os.getenv("HTML_PATH") + "/initiate_race.html"
        with open(html_file) as f:
            self.write(f.read())

    async def post(self):
        s = self.request.body.decode(encoding="utf-8")
        data = json.loads(s)
        if data["type"] == "task_info":
            tid = data["id"]
            ttitle = data["title"]
            tdescription = data["description"]
            tcredits = data["credits"]
            # Visit database: create/update the task entry and return the task link.
            tlink = update_task(tid, ttitle, tdescription, tcredits)
            self.write(json.dumps({
                "type"        : "task_info",
                "id"          : tid,
                "href"        : tlink
                }))
        if data["type"] == "initiate_race":
            pass
