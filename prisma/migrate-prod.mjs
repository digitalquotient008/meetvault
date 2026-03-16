import { execSync } from 'child_process';

/**
 * Production migration script.
 *
 * Runs `prisma migrate deploy`. If the initial migration fails because
 * tables already exist (e.g. from a prior `prisma db push`), it baselines
 * the initial migration and retries. Subsequent migrations are applied
 * normally.
 */

const INITIAL_MIGRATION = '20260316000000_init';

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

try {
  run('npx prisma migrate deploy');
} catch {
  console.log(`\nBaselining migration "${INITIAL_MIGRATION}" (tables already exist from db push)...\n`);
  try {
    run(`npx prisma migrate resolve --applied ${INITIAL_MIGRATION}`);
    run('npx prisma migrate deploy');
  } catch (e) {
    console.error('Migration failed after baselining:', e.message);
    process.exit(1);
  }
}
