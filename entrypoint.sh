#!/bin/sh
# Run migrations/schema sync
npx prisma db push --accept-data-loss

# Start the application
node server.js
