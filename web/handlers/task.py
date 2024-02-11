import redis
import os
from tornado.web import RequestHandler

class TaskHandler(RequestHandler):

    async def get(self, slug):
        tid = slug
        r = redis.Redis(host=os.getenv("REDIS_HOST"), charset="utf-8", decode_responses=True)
        ttitle = r.get(tid + ":title")
        tdescription = r.get(tid + ":description")
        tcredits = r.get(tid + ":credits")
        html = "<h1>Task: "+ ttitle +"</h1><h3>Credits</h3><p>"+tcredits+"</p><h3>Description</h3><p>"+ tdescription +"</p>"
        self.write(html)

