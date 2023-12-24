# Racing: Team Taskboard for Progress Sharing, with Timer!

## Run source
Note: When ran locally, this app will act as a single-person timed taskboard unless your local machine has a public ip and allows connection on port 8000.
#### Step 1: Download source code
Run `git clone git@github.com:zoehcycy/racing.git`.
#### Step 2: Run app
Run `cd racing`.
Run `docker compose up`.
#### Step 3: Visit the app
Visit `localhost:8000`.


## Run docker image

#### Step 1: Create the compose file
Create `compose.yaml` and paste the following:
```
services:
  redis:
    image: "redis:alpine"
  web:
    image: "zoehcycy/racing:latest"
    environment:
      - REDIS_HOST=redis
      - HTML_PATH=./templates
    ports:
      - 8000:8000
```
#### Step 2: Run app
From the dir where you place the compose file, run `docker compose up`.
#### Step 3: Visit the app
Visit `localhost:8000`.
