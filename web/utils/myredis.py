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

async def add_sprint(rid, rtitle, rintroduction, rduration, rinitiator):
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

async def incr_sprinter_count(sprint_id):
    r = redis.Redis(host=os.getenv("REDIS_HOST"), charset="utf-8", decode_responses=True)
    res = r.incr(sprint_id + ":NUM_OF_sprinter") 
    r.quit()
    return res

async def add_user_ready(sprint_id, username):
    r = redis.Redis(host=os.getenv("REDIS_HOST"), charset="utf-8", decode_responses=True)
    added = r.sadd(sprint_id + ":ready", ) 
    r.quit()
    return added


async def get_sprinter_count(sprint_id):
    r = redis.Redis(host=os.getenv("REDIS_HOST"), charset="utf-8", decode_responses=True)
    res = r.get(sprint_id + ":NUM_OF_sprinter") 
    r.quit()
    return int(res)

async def get_ready_count(sprint_id):
    r = redis.Redis(host=os.getenv("REDIS_HOST"), charset="utf-8", decode_responses=True)
    res = r.get(sprint_id + ":NUM_OF_READY") 
    r.quit()
    return int(res)

