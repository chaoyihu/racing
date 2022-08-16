import redis
from tornado.web import RequestHandler

class TaskHandler(RequestHandler):

    async def get(self, slug):
        tid = slug
        r = redis.Redis(charset="utf-8", decode_responses=True)
        ttitle = r.get(tid + ":title")
        tdescription = r.get(tid + ":description")
        tcredits = r.get(tid + ":credits")
        html = "<h3>"+ ttitle +"</h3><h5>Credits</h5><p>"+tcredits+"</p><h5>Description</h5><p>"+ tdescription +"</p>"
        self.write(html)

