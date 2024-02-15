import os
import json
import redis
import threading
import asyncio
from tornado.websocket import WebSocketHandler
from utils.mycookie import get_cookie
from utils.myredis import add_user_sprinter, add_user_ready, publish

from dotenv import load_dotenv
load_dotenv()


class PubsubHandler(WebSocketHandler):
    
    async def open(self):
        self.r = redis.Redis(host=os.getenv("REDIS_HOST"), charset="utf-8", decode_responses=True)
        self.sprint_id = get_cookie(self.request.headers.get("Cookie"), "sprint_id")
        self.session_id = get_cookie(self.request.headers.get("Cookie"), "session_id")
        self.listen_thread = threading.Thread(target=self.pubsub_listen)
        self.listen_thread.setDaemon(True)
        self.listen_thread.start()

    async def on_message(self, message):
        print("Server receive message:", message)
        data = json.loads(message)
        if data["type"] == "join_sprint":
            username = self.r.get(self.session_id + ":username")
            data = {
                "type": "new_sprinter",
                "name": username
            }
            success = await publish("ch+" + self.sprint_id, json.dumps(data))
            success = await add_user_sprinter(self.sprint_id, username)
        if data["type"] == "chat_message":
            username = self.r.get(self.session_id + ":username")
            data["publisher"] = username
            success = await publish("ch+" + self.sprint_id, json.dumps(data))
        if data["type"] == "ready":
            username = self.r.get(self.session_id + ":username")
            data["publisher"] = username
            added, all_ready = await add_user_ready(self.sprint_id, username)
            if added:    # send user ready message
                success = await publish("ch+" + self.sprint_id, json.dumps(data))
            if all_ready:
                data = {
                    "type": "start_sprint"
                }
                success = await publish("ch+" + self.sprint_id, json.dumps(data))
        if data["type"] == "finish_task":
            username = self.r.get(self.session_id + ":username")
            data["publisher"] = username
            success = await publish("ch+" + self.sprint_id, json.dumps(data))

        if success:
            print("Publish successful! Channel:", self.sprint_id)
        else:
            print("Publish failed! Channel:", self.sprint_id)

            
    async def on_close(self):
        self.listen_thread.join()

    def pubsub_listen(self):
        asyncio.set_event_loop(asyncio.new_event_loop())
        print("Connected.")
        self.rp = redis.Redis(host=os.getenv("REDIS_HOST"), charset="utf-8", decode_responses=True)
        self.q = self.rp.pubsub()
        print("Subscribing to channel:", "ch+" + self.sprint_id)
        self.q.subscribe("ch+" + self.sprint_id)
        for m in self.q.listen():
            print(m)
            json_str = m["data"]
            print("Sending to client:", json_str)
            self.write_message(json.dumps(json_str))