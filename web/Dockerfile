# Define arguments
ARG PYTHON_VERSION=3.10.12

# Use the specified python version slim image as the base image
FROM python:${PYTHON_VERSION}-slim as base

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

# Environment variables
ENV REDIS_HOST=redis
ENV HTML_PATH=./templates
ENV SECRETS_PATH=/run/secrets

# Set working directory of the application
WORKDIR /app

# Create a non-privileged user that the app will run under.
# See https://docs.docker.com/go/dockerfile-user-best-practices/
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

# Download dependencies as a separate step to utilize Docker's caching.
# Mount a cache volume for pip, allowing docker to reuse downloaded 
# python packages across builds.
# Mounts requirements.txt from host machine to container so that changes 
# are reflected during building.
RUN --mount=type=cache,target=/root/.cache/pip \
    --mount=type=bind,source=requirements.txt,target=requirements.txt \
    python -m pip install -r requirements.txt
# Switch to the non-privileged user to run the application.
USER appuser

# Copy the source code into the container.
COPY . .

# Expose the port that the application listens on.
EXPOSE 443

# Run the application.
CMD python3 server.py