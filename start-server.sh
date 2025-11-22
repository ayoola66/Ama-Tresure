#!/bin/bash

# Kill any existing server on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null

# Wait a moment for port to be released
sleep 1

# Start the server
echo "Starting HTTP server on port 8000..."
echo "Access your game at: http://localhost:8000/"
echo "Press Ctrl+C to stop the server"
python3 -m http.server 8000

