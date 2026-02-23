# Run migrations/schema sync and seed initial data
npx prisma db push --accept-data-loss
npx prisma db seed

# Start the application
node server.js
