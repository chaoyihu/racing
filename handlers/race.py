import os
import json
import redis
from tornado.web import RequestHandler
from utils.mycookie import get_cookie

from dotenv import load_dotenv
load_dotenv()

class RaceHandler(RequestHandler):

    async def get(self, slug): 
        html_file = os.getenv("HTML_PATH") + "/race.html"
        with open(html_file) as f:
            self.write(f.read())

    async def post(self, slug):
        self.race_id = slug
        cookie = self.request.headers.get("Cookie")
        race_id = get_cookie(cookie, "race_id")
        s = self.request.body.decode(encoding="utf-8")
        data = json.loads(s)
        if data["type"] == "get_race_info": 
            r = redis.Redis(host=os.getenv("REDIS_HOST"), charset="utf-8", decode_responses=True)
            rtitle = r.get(race_id + ":title")
            rintroduction = r.get(race_id + ":introduction")
            rduration = r.get(race_id + ":duration")
            rinitiator = r.get(race_id + ":initiator")
            all_tasks = set()
            for k in r.keys(race_id + "+task+*"):
                tid = k.split(":")[0]
                ttitle = r.get(tid + ":title")
                tcredits = r.get(tid + ":credits")
                all_tasks.add((tid, "/task/" + tid, ttitle, tcredits)) # [tlink, ttitle]
            all_tasks = [[tid, link, title, credits] for tid, link, title, credits in all_tasks]
            all_tasks.sort()
            r.quit()
            self.write(json.dumps({
                "type"        : "race_info",
                "id"          : race_id,
                "title"       : rtitle,
                "introduction": rintroduction,
                "duration"    : rduration,
                "initiator"   : rinitiator,
                "tasks"       : all_tasks
                }))


