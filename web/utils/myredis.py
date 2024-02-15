import redis
import os

from dotenv import load_dotenv
load_dotenv()

async def add_task(tid, ttitle, tdescription, tcredits):
    try:
        r = redis.Redis(host=os.getenv("REDIS_HOST"), charset="utf-8", decode_responses=True)
        r.set(tid + ":title", ttitle)
        r.set(tid + ":description", tdescription)
        r.set(tid + ":credits", tcredits)
        print("Task info updated.")
        r.quit()
        return True
    except:
        r.quit()
        return False

async def add_sprint_event(rid, rtitle, rintroduction, rduration, rinitiator):
    try:
        r = redis.Redis(host=os.getenv("REDIS_HOST"), charset="utf-8", decode_responses=True)
        r.set(rid + ":title", rtitle)
        r.set(rid + ":introduction", rintroduction)
        r.set(rid + ":duration", rduration)
        r.set(rid + ":initiator", rinitiator)
        print("sprint info added.")
        r.quit()
        return True
    except:
        r.quit()
        return False

async def publish(channel, data):
    try:
        r = redis.Redis(host=os.getenv("REDIS_HOST"), charset="utf-8", decode_responses=True)
        r.publish(channel, data) 
        r.quit()
        return True
    except:
        r.quit()
        return False

async def add_user_sprinter(sprint_id, username):
    r = redis.Redis(host=os.getenv("REDIS_HOST"), charset="utf-8", decode_responses=True)
    res = r.sadd(sprint_id + "sprinter_set", username)
    r.quit()
    return res

async def add_user_ready(sprint_id, username):
    r = redis.Redis(host=os.getenv("REDIS_HOST"), charset="utf-8", decode_responses=True)
    added = r.sadd(sprint_id + ":ready_set", username)
    sprinter_count = int(r.scard(sprint_id + "sprinter_set"))
    ready_count = int(r.scard(sprint_id + ":ready_set"))
    r.quit()
    all_ready = (sprinter_count == ready_count)
    return added, all_ready

