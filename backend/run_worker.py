#!/usr/bin/env python3
"""
Entry point for the FPL Notification Worker

Run with: python run_worker.py
Deploy on Render as a Background Worker
"""

import asyncio
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.notification_worker import NotificationWorker


async def main():
    print("=" * 50)
    print("FPL Assistant Notification Worker")
    print("=" * 50)
    print("Starting background notification service...")
    print("This worker monitors live FPL games and sends")
    print("push notifications when your players score,")
    print("get cards, or are substituted.")
    print("=" * 50)
    
    worker = NotificationWorker()
    
    try:
        await worker.start()
    except KeyboardInterrupt:
        print("\nShutting down gracefully...")
        worker.stop()
    except Exception as e:
        print(f"Worker crashed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())

