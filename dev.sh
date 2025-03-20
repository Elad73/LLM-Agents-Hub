#!/bin/bash

# Watch for file changes and restart the backend container
while true; do
  inotifywait -r -e modify,create,delete ./backend/app
  docker-compose restart backend
done 