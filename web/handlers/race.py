import os
import json
import redis
import uuid
from random import choice
from tornado.web import RequestHandler
from utils.mycookie import get_cookie
from utils.myredis import update_task, delete_task, add_race

from dotenv import load_dotenv
load_dotenv()

RANDOM_PENGUIN = ["king", "emperor", "gentoo", "adelie", "chinstrap", "rockhopper", "snares", "macaroni", "fiordland", "humboldt", "magellanic", "galapagos"]
RANDOM_ROLE = ["krill-connoisseur", "squid-advocate", "ocean-goer", "iceberg-specialist", "diplomat", "absurdist", "aestheticist", "atheist", "altruist", "agnostic", "anarchist", "stoic", "structuralist", "dualist", "materialist", "skeptic", "romanticist", "reductionist", "rationalist", "behavioralist", "idealist", "panpsychist", "objectivist", "subjectivist", "nihilist", "naturalist", "mysticist", "modernist", "pessimist", "individualist", "libertarian", "philanthropist", "determinist", "existentialist", "buddhist", "penguinist", "collectivist", "cynicist", "darwinist", "epicurean", "epiphenomenalist", "fatalist", "formalist", "idealist", "illusionist", "instrumentalist"]

class RaceHandler(RequestHandler):

    async def get(self, endpoint):
        if endpoint == "new_race":
            session_id = get_cookie(self.request.headers.get("Cookie"), "session_id")
            if "session_id" == "": 
                self.write(json.dumps({
                    "type": "redirect",
                    "protocol": "https",
                    "url": "/login"
                    }))
            else:
                html_file = os.getenv("HTML_PATH") + "/new_race.html"
                with open(html_file) as f:
                    self.write(f.read())
        else: # endpoint is race_id
            html_file = os.getenv("HTML_PATH") + "/race.html"
            with open(html_file) as f:
                self.write(f.read())

    async def post(self, endpoint):
        if endpoint == "confirm_new_race":
            new_race_id = choice(RANDOM_PENGUIN) + "-the-" + choice(RANDOM_ROLE) + "-" + str(uuid.uuid1()).split("-")[0]
            print("new race", new_race_id)
            race_id = get_cookie(self.request.headers.get("Cookie"), "race_id")
            session_id = get_cookie(self.request.headers.get("Cookie"), "session_id")
            r = redis.Redis(host=os.getenv("REDIS_HOST"), charset="utf-8", decode_responses=True)
            username = r.get(session_id + ":username")
            r.quit()
            rtitle = data["title"]
            rintroduction = data["introduction"]
            rduration = data["duration"]
            _ = await add_race(race_id, rtitle, rintroduction, rduration, username)
            self.write(json.dumps({
                "race_id"     : new_race_id,
                "protocol"    : "https",
                "redirect_url": "/race/" + race_id
                }))
        elif endpoint == "task_info":
            tid = data["id"]
            ttitle = data["title"]
            tdescription = data["description"]
            tcredits = data["credits"]
            # Visit database: create/update the task entry and return the task link.
            success = await update_task(tid, ttitle, tdescription, tcredits)
            status = "updated" if success else "database error"
            self.write(json.dumps({
                "type"        : "log",
                "text"        : "tid: "+ tid + ", " + status
                }))
        elif endpoint == "delete_task":
            tid = data["id"]
            # Visit database: create/update the task entry and return the task link.
            success = await delete_task(tid)
            status = "deleted" if success else "database error"
            self.write(json.dumps({
                "type"        : "log",
                "text"        : "tid: "+ tid + ", " + status
                }))
        else:
            self.race_id = endpoint
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