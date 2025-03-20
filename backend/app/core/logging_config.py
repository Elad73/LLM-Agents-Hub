import logging
import sys
from pathlib import Path

def configure_logging():
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    # Configure root logger
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("logs/app.log"),
        ]
    )

    # Get the root logger
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)

    # Ensure all other loggers inherit these settings
    for log_name in ['uvicorn', 'uvicorn.access', 'fastapi']:
        log = logging.getLogger(log_name)
        log.handlers = logger.handlers
        log.setLevel(logging.DEBUG)

    return logger 