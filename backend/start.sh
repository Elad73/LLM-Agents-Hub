#!/bin/sh

# Create log directory if it doesn't exist
mkdir -p /app/logs

# Start uvicorn with specific reload directory
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --reload \
    --reload-dir /app/app \
    --log-level debug \
    --log-config /app/log_config.json 