import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * ManageHub PostgreSQL Backup Script
 *
 * Runs `pg_dump` on the configured DATABASE_URL and creates timestamped custom-format dumps.
 */
async function runBackup() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('ERROR: DATABASE_URL is not set in environment.');
    process.exit(1);
  }

  const backupDir = path.resolve(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `managehub_backup_${timestamp}.sql`;
  const filepath = path.join(backupDir, filename);

  console.log(`Starting PostgreSQL backup to: ${filepath}`);

  const pgDump = spawn('pg_dump', ['--dbname', dbUrl, '--format=custom', '--blobs', '--verbose', '--file', filepath], {
    stdio: ['ignore', 'inherit', 'inherit'],
  });

  pgDump.on('error', (error) => {
    console.error('Backup failed:', error.message);
    process.exitCode = 1;
  });

  pgDump.on('close', (code) => {
    if (code !== 0) {
      console.error(`Backup failed: pg_dump exited with code ${code}`);
      process.exitCode = 1;
      return;
    }
    console.log(`Backup completed successfully! Saved to: ${filepath}`);
    console.log(`To restore: pg_restore --clean --if-exists --dbname <TARGET_DB_URL> --verbose "${filepath}"`);
  });
}

runBackup();
