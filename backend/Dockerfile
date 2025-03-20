FROM python:3.11-slim

WORKDIR /app

# Install curl and clean up in one layer
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/* && \
    pip install --no-cache-dir pip --upgrade

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    PYTHONMALLOC=malloc

# Create logs directory
RUN mkdir -p /app/logs && chmod 777 /app/logs

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8000

# Simple startup command without mentioning reload
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 