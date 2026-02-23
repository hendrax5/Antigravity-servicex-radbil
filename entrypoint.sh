# Run migrations/schema sync and seed initial data
npx prisma@5.22.0 db push --accept-data-loss
npx prisma@5.22.0 db seed

# Start the application
node server.js
