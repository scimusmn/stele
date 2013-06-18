#!/bin/bash
# This script adds a 3 minute delay before running browser.py.
# We need this on Windows kiosks that run a local webserver since that takes a few minutes to start up.

sleep 180;
cd ~/Desktop/chromeKiosk/stele && ./browser.py;
