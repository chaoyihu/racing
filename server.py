import os
import json
from concurrent.futures.thread import ThreadPoolExecutor
from handlers.index import IndexHandler
from handlers.login import LoginHandler
from handlers.register import RegisterHandler
from handlers.profile import ProfileHandler
from handlers.initiate_race import InitiateRaceHandler
from handlers.join_race import JoinRaceHandler
from handlers.race import RaceHandler
from tornado.ioloop import IOLoop
from tornado.web import StaticFileHandler
from tornado.web import Application
from tornado.log import enable_pretty_logging
enable_pretty_logging() # Writes logs to stdout
from dotenv import load_dotenv
load_dotenv()

###################################################### 
#                   Run the app                      #
###################################################### 
def make_app():
    routing_table = [
            (r"/",                IndexHandler),
            # user
            (r"/login",           LoginHandler),
            (r"/register",        RegisterHandler),
            (r"/profile/([^/]+)", ProfileHandler),
            # race
            (r"/initiate-race",   InitiateRaceHandler),
            (r"/join-race",       JoinRaceHandler),
            (r"/race/([^/]+)",    RaceHandler),
            # static
            (r"/static/(.*)",     StaticFileHandler, {"path": "./static/"}),
            (r"/(favicon.ico)",   StaticFileHandler, {"path": "./static/imgs/"})
        ]
    return Application(routing_table)

if __name__ == "__main__":    
    app = make_app()
    #port = os.environ.get('PORT', 5000) # for production
    port = 8000 # for localhost debugging
    app.listen(port)
    print("Server listening on port %s ...\n" % port)
    main_loop = IOLoop.current()
    main_loop.set_default_executor(ThreadPoolExecutor(max_workers=4))
    main_loop.start()


