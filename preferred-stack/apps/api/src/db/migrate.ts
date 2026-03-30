import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/taskboard_preferred';

const migrationClient = postgres(connectionString, { max: 1 });
const db = drizzle(migrationClient, { schema });

async function main() {
  console.log('Running migrations...');
  try {
      await migrate(db, { migrationsFolder: './src/db/migrations' });
      console.log('Migrations complete!');
      process.exit(0);
  } catch (err) {
      console.error('Migration failed!');
      console.error(err);
      process.exit(1);
  }
}

main();
