# Utils
import os

# Handlers
from handlers.index import IndexHandler
## user
from handlers.login import LoginHandler
from handlers.register import RegisterHandler
from handlers.profile import ProfileViewHandler, ProfileActionHandler
## race
from handlers.race import RaceHandler
from handlers.task import TaskHandler
from handlers.pubsub import PubsubHandler
## static
from tornado.web import StaticFileHandler

# Main
from tornado.web import Application
from tornado.ioloop import IOLoop
from tornado.httpserver import HTTPServer

# Others
from tornado.log import enable_pretty_logging
enable_pretty_logging() # Writes logs to stdout

from dotenv import load_dotenv
load_dotenv()

##########################################################
#                     Run the app                        #
##########################################################
def main():
    routing_table = [
            (r"/",                IndexHandler),
            # user
            (r"/login",           LoginHandler),
            (r"/register",        RegisterHandler),
            (r"/profile/user/([^/]+)",   ProfileViewHandler),
            (r"/profile/action/([^/]+)", ProfileActionHandler),
            # race
            (r"/race/([^/]+)",    RaceHandler),
            (r"/task/([^/]+)",    TaskHandler),
            (r"/pubsub",          PubsubHandler),    # websocket
            # static
            (r"/static/(.*)",     StaticFileHandler, {"path": "./static/"}),
            (r"/(favicon.ico)",   StaticFileHandler, {"path": "./static/imgs/"})
        ]
    
    application = Application(routing_table)
    server = HTTPServer(
        application,
        ssl_options = {
            "certfile": os.path.join(os.getenv("SECRETS_PATH"), "ssl_certfile"),
            "keyfile" : os.path.join(os.getenv("SECRETS_PATH"), "ssl_keyfile")
        }
    )
    port = 443
    server.listen(port)
    print("Server listening on port %s ...\n" % port)

    main_loop = IOLoop.current()
    main_loop.start()

if __name__ == "__main__":  
    main()