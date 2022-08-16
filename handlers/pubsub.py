import os
import json
import redis
import threading
import asyncio
from tornado.websocket import WebSocketHandler

from dotenv import load_dotenv
load_dotenv()


class PubsubHandler(WebSocketHandler):
    def open(self):
        self.r = redis.Redis(charset="utf-8", decode_responses=True)
        self.race_id = json.loads(self.request.headers.get("Cookie"))["race_id"]
        self.listen_thread = threading.Thread(target=self.pubsub_listen)
        self.listen_thread.setDaemon(True)
        self.listen_thread.start()

    def on_message(self, message):
        print(message)
        data = json.loads(message)
        if data["type"] == "join_race":
            session_id = data["session_id"]
            self.username = self.r.get(session_id + ":username")
            self.r.incr(race_id + ":racer_counter", 1)
            self.write_message(json.dumps({
                "type": "new_racer",
                "name": username,
                }))
#        if data["type"] == "ready":
#            session_id = data["session_id"]
#            self.username = self.r.get(session_id + ":username")
#            self.r.incr(race_id + ":ready_counter", 1)
#            if self.r.get(race_id + ":ready_counter") == self.r.get(race_id + ":racer_counter"):
#                self.start_race()
#        if data["type"] == "force_start":
#            self.start_race()

    def on_close(self):
        self.listen_thread.join()

    def pubsub_listen(self):
        asyncio.set_event_loop(asyncio.new_event_loop())
        print("Connected.")
        self.rp = redis.Redis(charset="utf-8", decode_responses=True)
        self.q = self.rp.pubsub()
        print("Subscribing to channel:", "ch+" + self.race_id)
        self.q.subscribe("ch+" + self.race_id)
        for m in self.q.listen():
            print(m)
            json_str = m["data"]
            print("Sending to client:", json_str)
            self.write_message(json.dumps(json_str))


