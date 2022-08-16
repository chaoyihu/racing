# Utils
import os
import json

# Handlers
from handlers.index import IndexHandler
## user
from handlers.login import LoginHandler
from handlers.register import RegisterHandler
from handlers.profile import ProfileHandler
## race
from handlers.initiate_race import InitiateRaceHandler 
from handlers.race import RaceHandler
from handlers.task import TaskHandler
from handlers.pubsub import PubsubHandler
## static
from tornado.web import StaticFileHandler

# Main
from tornado.web import Application
from tornado.ioloop import IOLoop

# Others
from tornado.log import enable_pretty_logging
enable_pretty_logging() # Writes logs to stdout
from dotenv import load_dotenv
load_dotenv()

##########################################################
#                     Run the app                        #
##########################################################
def make_app():
    routing_table = [
            (r"/",                IndexHandler),
            # user
            (r"/login",           LoginHandler),
            (r"/register",        RegisterHandler),
            (r"/profile/([^/]+)", ProfileHandler),
            # race
            (r"/initiate-race",  InitiateRaceHandler),
            (r"/race/([^/]+)",    RaceHandler),
            (r"/task/([^/]+)",    TaskHandler),
            (r"/pubsub",          PubsubHandler), # websocket
            # static
            (r"/static/(.*)",     StaticFileHandler, {"path": "./static/"}),
            (r"/(favicon.ico)",   StaticFileHandler, {"path": "./static/imgs/"})
        ]
    return Application(routing_table)

if __name__ == "__main__":    
    app = make_app()
    #port = os.environ.get('PORT', 5000) # for Heroku
    port = 8000 # for localhost debugging
    app.listen(port)
    print("Server listening on port %s ...\n" % port)
    main_loop = IOLoop.current()
    main_loop.start()


