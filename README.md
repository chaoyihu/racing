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


## Deploy on azure
#### Step 1:
Run `docker run -it mcr.microsoft.com/azure-cli`.
#### Step 2:
Run `az container create     --resource-group [resource-group]    --name racing-server  --ports 8000   --image registry.hub.docker.com/zoehcycy/racing:azure   --ip-address public`.
View Azure dashboardand copy the public ip address of racing server.
#### Step 3:
Visit `[racing-server-public-ip]:8000` to access the app.
