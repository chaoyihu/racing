import os
import json
import redis
import uuid
from random import choice
from tornado.web import RequestHandler
from utils.mycookie import get_cookie
from utils.myredis import add_task, add_sprint

from dotenv import load_dotenv
load_dotenv()

RANDOM_PENGUIN = [
    "king", "emperor", "gentoo", "adelie", "chinstrap", "rockhopper", 
    "snares", "macaroni", "fiordland", "humboldt", "magellanic", "galapagos"
    ]
RANDOM_ROLE = [
    "krill-connoisseur", "squid-advocate", "ocean-goer", "iceberg-specialist", 
    "diplomat", "absurdist", "aestheticist", "atheist", "altruist", "agnostic",
    "anarchist", "stoic", "structuralist", "dualist", "materialist", "skeptic", 
    "romanticist", "reductionist", "rationalist", "behavioralist", "idealist", 
    "panpsychist", "objectivist", "subjectivist", "nihilist", "naturalist", 
    "mysticist", "modernist", "pessimist", "individualist", "libertarian", 
    "philanthropist", "determinist", "existentialist", "buddhist", "penguinist", 
    "collectivist", "cynicist", "darwinist", "epicurean", "epiphenomenalist", 
    "fatalist", "formalist", "idealist", "illusionist", "instrumentalist"
    ]

class SprintPlanningHandler(RequestHandler):

    async def get(self):
        html_file = os.getenv("HTML_PATH") + "/sprint_planning.html"
        with open(html_file) as f:
            self.write(f.read())

    async def post(self):
        # generate new sprint_id
        sprint_id = choice(RANDOM_PENGUIN) + "-the-" + choice(RANDOM_ROLE) \
            + "-" + str(uuid.uuid1()).split("-")[0]
        print("New sprint created:", sprint_id)

        session_id = get_cookie(self.request.headers.get("Cookie"), "session_id")
        s = self.request.body.decode(encoding="utf-8")
        data = json.loads(s)

        # write sprint info to database
        sprint_info = data["sprint_info"]
        rtitle = sprint_info["title"]
        rintroduction = sprint_info["introduction"]
        rduration = sprint_info["duration"]
        r = redis.Redis(host=os.getenv("REDIS_HOST"), charset="utf-8", decode_responses=True)
        username = r.get(session_id + ":username")
        r.quit()
        _ = await add_sprint(sprint_id, rtitle, rintroduction, rduration, username)

        # write task info to database
        for task in data["tasks"]:
            tid = sprint_id + "+" + task["tid"]
            ttitle = task["ttitle"]
            tdescription = task["tdescription"]
            tcredits = task["tcredits"]
            # Visit database: create the task entry and return the task link.
            success = await add_task(tid, ttitle, tdescription, tcredits)
            if not success:
                self.write(json.dumps({
                    "type"     : "alert",
                    "message"  : "tid: "+ tid + ", database error"
                    }))
            
        # redirect to sprint page
        self.write(json.dumps({
            "type"         : "redirect",
            "sprint_id"    : sprint_id,
            "protocol"     : "https",
            "redirect_url" : "/sprint/" + sprint_id
            }))