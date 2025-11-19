#!/bin/bash

# Start Notifications Service
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║    🔔 Starting Notifications Service                     ║"
echo "║    Port: 3005                                            ║"
echo "║    Database: auth_service (referentiels schema)          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"
node server.js
