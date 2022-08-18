import redis

async def update_task(tid, ttitle, tdescription, tcredits):
    try:
        r = redis.Redis(charset="utf-8", decode_responses=True)
        r.set(tid + ":title", ttitle)
        r.set(tid + ":description", tdescription)
        r.set(tid + ":credits", tcredits)
        print("Task info updated.")
        r.quit()
        return True
    except:
        r.quit()
        return False

async def delete_task(tid):
    try:
        r = redis.Redis(charset="utf-8", decode_responses=True)
        r.delete(tid + ":title")
        r.delete(tid + ":description")
        r.delete(tid + ":credits")
        print("Task info deleted.")
        r.quit()
        return True
    except:
        r.quit()
        return False

async def add_race(rid, rtitle, rintroduction, rduration, rinitiator):
    try:
        r = redis.Redis(charset="utf-8", decode_responses=True)
        r.set(rid + ":title", rtitle)
        r.set(rid + ":introduction", rintroduction)
        r.set(rid + ":duration", rduration)
        r.set(rid + ":initiator", rinitiator)
        print("Race info added.")
        r.quit()
        return True
    except:
        r.quit()
        return False

async def publish(channel, data):
    try:
        r = redis.Redis(charset="utf-8", decode_responses=True)
        r.publish(channel, data) 
        r.quit()
        return True
    except:
        r.quit()
        return False

