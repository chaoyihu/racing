import os
import json
import redis
import threading
import asyncio
from tornado.websocket import WebSocketHandler
from utils.mycookie import get_cookie
from utils.myredis import *

from dotenv import load_dotenv
load_dotenv()


class PubsubHandler(WebSocketHandler):
    
    async def open(self):
        self.r = redis.Redis(charset="utf-8", decode_responses=True)
        self.race_id = get_cookie(self.request.headers.get("Cookie"), "race_id")
        self.session_id = get_cookie(self.request.headers.get("Cookie"), "session_id")
        self.listen_thread = threading.Thread(target=self.pubsub_listen)
        self.listen_thread.setDaemon(True)
        self.listen_thread.start()

    async def on_message(self, message):
        print(message)
        data = json.loads(message)
        if data["type"] == "join_race":
            username = self.r.get(self.session_id + ":username")
            data = {
                    "type": "new_racer",
                    "name": username
                }
            success = await publish("ch+" + self.race_id, json.dumps(data))
            success = await incr_racer_count(self.race_id)

        if data["type"] == "chat_message":
            username = self.r.get(self.session_id + ":username")
            data["publisher"] = username
            success = await publish("ch+" + self.race_id, json.dumps(data))

        if data["type"] == "ready":
            username = self.r.get(self.session_id + ":username")
            data["publisher"] = username
            success = await publish("ch+" + self.race_id, json.dumps(data))
            num_of_ready = await incr_ready_count(self.race_id)
            num_of_racer = await get_racer_count(self.race_id)
            if num_of_ready == num_of_racer:
                data = {
                        "type": "start_race"
                    }
                success = await publish("ch+" + self.race_id, json.dumps(data))

        if data["type"] == "finish_task":
            username = self.r.get(self.session_id + ":username")
            data["publisher"] = username
            success = await publish("ch+" + self.race_id, json.dumps(data))

            
    async def on_close(self):
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


