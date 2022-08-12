import os
import json
import redis
import uuid
from random import choice
from tornado.web import RequestHandler

from dotenv import load_dotenv
load_dotenv()
RANDOM_PENGUIN = ["king", "emperor", "gentoo", "adelie", "chinstrap", "rockhopper", "snares", "macaroni", "fiordland", "humboldt", "magellanic", "galapagos"]
RANDOM_ROLE = ["krill-connoisseur", "squid-advocate", "ocean-goer", "iceberg-specialist", "diplomat", "absurdist", "aestheticist", "atheist", "altruist", "agnostic", "anarchist", "stoic", "structuralist", "dualist", "materialist", "skeptic", "romanticist", "reductionist", "rationalist", "behavioralist", "idealist", "panpsychist", "objectivist", "subjectivist", "nihilist", "naturalist", "mysticist", "modernist", "pessimist", "individualist", "libertarian", "philanthropist", "determinist", "existentialist", "buddhist", "penguinist", "collectivist", "cynicist", "darwinist", "epicurean", "epiphenomenalist", "fatalist", "formalist", "idealist", "illusionist", "instrumentalist"]


async def update_task(tid, ttitle, tdescription, tcredits):
    try:
        print("visiting database")
        r = redis.Redis(charset="utf-8", decode_responses=True)
        r.hset("task_id_to_task_title", tid, ttitle)
        r.hset("task_id_to_task_description", tid, tdescription)
        r.hset("task_id_to_task_credits", tid, tcredits)
        print("database set.")
        print(r.hget("task_id_to_task_title", tid))
        return True
    except:
        return False


class InitiateRaceBaseHandler(RequestHandler):

    async def get(self):
        html_file = os.getenv("HTML_PATH") + "/initiate_race_base.html"
        with open(html_file) as f:
            self.write(f.read())

    async def post(self):
        s = self.request.body.decode(encoding="utf-8")
        data = json.loads(s)
        if data["type"] != "request_race":
            print(data)
            print("Unknown message from client.")
            return
        new_race_id = choice(RANDOM_PENGUIN) + "-the-" + choice(RANDOM_ROLE) + "-" + str(uuid.uuid1()).split("-")[0]
        print("new race", new_race_id)
        self.write(json.dumps({
            "type": "redirect",
            "protocol": "http",
            "url": "/initiate-race/" + new_race_id,
            "race_id": new_race_id
            }))


class InitiateRaceHandler(RequestHandler):

    async def get(self, slug):
        race_id = slug
        html_file = os.getenv("HTML_PATH") + "/initiate_race.html"
        with open(html_file) as f:
            self.write(f.read())

    async def post(self, slug):
        race_id = slug
        s = self.request.body.decode(encoding="utf-8")
        data = json.loads(s)
        if data["type"] == "task_info":
            tid = data["id"]
            ttitle = data["title"]
            tdescription = data["description"]
            tcredits = data["credits"]
            # Visit database: create/update the task entry and return the task link.
            success = await update_task(tid, ttitle, tdescription, tcredits)
            status = "updated" if success else "database error"

            self.write(json.dumps({
                "type"        : "task_info",
                "id"          : tid,
                "status"      : status
                }))
        if data["type"] == "initiate_race":
            race_id = data["race_id"]
            self.write(json.dumps({
                "type": "redirect",
                "protocol": "ws",
                "url": "/race/" + new_race_id
                }))
