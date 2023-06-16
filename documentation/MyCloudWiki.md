## Running Migrations
The project uses a migration framework for managing database schema changes. The following scripts are available for running migrations:

### Upgrading the Database Schema
To apply pending migrations and upgrade the database schema, run the following command:
```bash
npm run migrate:up
```

### Rolling Back Database Changes
If you need to rollback the database changes and revert to a previous state, use the following command:
```bash
npm run migrate:down
```

### Checking Migration Status
To check the status of migrations and view which migrations have been applied or are pending, use the following command:
```bash
npm run migrate:status
```
### Creating New Migration
To create a new migration, use the following command:
```bash
npm run migrate:create <migration-name>
```
### Additional Information
- The migrations are located in the migrations directory. Each migration file represents a specific database schema change and is named with a timestamp prefix and a descriptive name.
- Configuration file - `migrate-mongo-config.js`.