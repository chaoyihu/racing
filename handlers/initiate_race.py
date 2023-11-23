import os
import json
import redis
import uuid
from random import choice
from tornado.web import RequestHandler
from utils.myredis import update_task, delete_task, add_race 
from utils.mycookie import get_cookie

from dotenv import load_dotenv
load_dotenv()

RANDOM_PENGUIN = ["king", "emperor", "gentoo", "adelie", "chinstrap", "rockhopper", "snares", "macaroni", "fiordland", "humboldt", "magellanic", "galapagos"]
RANDOM_ROLE = ["krill-connoisseur", "squid-advocate", "ocean-goer", "iceberg-specialist", "diplomat", "absurdist", "aestheticist", "atheist", "altruist", "agnostic", "anarchist", "stoic", "structuralist", "dualist", "materialist", "skeptic", "romanticist", "reductionist", "rationalist", "behavioralist", "idealist", "panpsychist", "objectivist", "subjectivist", "nihilist", "naturalist", "mysticist", "modernist", "pessimist", "individualist", "libertarian", "philanthropist", "determinist", "existentialist", "buddhist", "penguinist", "collectivist", "cynicist", "darwinist", "epicurean", "epiphenomenalist", "fatalist", "formalist", "idealist", "illusionist", "instrumentalist"]


class InitiateRaceHandler(RequestHandler):

    async def get(self):
        session_id = get_cookie(self.request.headers.get("Cookie"), "session_id")
        if "session_id" == "": 
            self.write(json.dumps({
                "type": "redirect",
                "protocol": "http",
                "url": "/login"
                }))
        else:
            html_file = os.getenv("HTML_PATH") + "/initiate_race.html"
            with open(html_file) as f:
                self.write(f.read())

    async def post(self):
        s = self.request.body.decode(encoding="utf-8")
        data = json.loads(s)
        
        if data["type"] == "request_race":
            new_race_id = choice(RANDOM_PENGUIN) + "-the-" + choice(RANDOM_ROLE) + "-" + str(uuid.uuid1()).split("-")[0]
            print("new race", new_race_id)
            self.write(json.dumps({
                "type": "cookie",
                "race_id": new_race_id
                }))

        if data["type"] == "task_info":
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

        if data["type"] == "delete_task":
            tid = data["id"]
            # Visit database: create/update the task entry and return the task link.
            success = await delete_task(tid)
            status = "deleted" if success else "database error"
            self.write(json.dumps({
                "type"        : "log",
                "text"        : "tid: "+ tid + ", " + status
                }))

        if data["type"] == "initiate_race":
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
                "type": "redirect",
                "protocol": "http",
                "url": "/race/" + race_id
                }))

