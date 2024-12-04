#!/bin/bash

# Start the Node.js server
echo "Starting Node.js server..."
node server.js 

# Start the posture detection script
echo "Starting posture detection script..."
python3 posture_detection.py &

# Wait for all background processes to finish
wait
