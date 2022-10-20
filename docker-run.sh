#!/bin/sh

# Permissions
chown node:node -R /config /app
chmod 750 -R /app
chmod 750 -R "$CONFIG_DIR"

# Start
node --no-deprecation /app/build/index.js