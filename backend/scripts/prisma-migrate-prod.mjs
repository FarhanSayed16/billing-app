/**
 * Apply Prisma migrations for production.
 *
 * If the DB was created with `db push` (non-empty schema, no migration
 * history), Prisma returns P3005. We baseline by marking existing
 * migrations as already applied, then retry deploy. Data is never wiped.
 */
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

function run(cmd, { allowFail = false } = {}) {
  const result = spawnSync(cmd, {
    shell: true,
    encoding: 'utf8',
    env: process.env,
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0 && !allowFail) {
    const err = new Error(`Command failed (${result.status}): ${cmd}`);
    err.stdout = result.stdout || '';
    err.stderr = result.stderr || '';
    err.status = result.status;
    throw err;
  }
  return result;
}

function listMigrations() {
  const dir = join(process.cwd(), 'prisma', 'migrations');
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d{14}_/.test(d.name))
    .map((d) => d.name)
    .sort();
}

function isP3005(err) {
  const text = `${err.stderr || ''}\n${err.stdout || ''}\n${err.message || ''}`;
  return text.includes('P3005') || text.includes('schema is not empty');
}

function baselineExistingDb() {
  const migrations = listMigrations();
  console.log(
    `Baselining ${migrations.length} migration(s) for existing production schema…`,
  );
  for (const name of migrations) {
    run(`npx prisma migrate resolve --applied "${name}"`, { allowFail: true });
  }
}

export function migrateProd() {
  try {
    run('npx prisma migrate deploy');
  } catch (err) {
    if (!isP3005(err)) throw err;
    console.warn(
      'Prisma P3005: database already has a schema but no migration history.',
    );
    baselineExistingDb();
    run('npx prisma migrate deploy');
  }
}

const isMain =
  process.argv[1] &&
  (process.argv[1].endsWith('prisma-migrate-prod.mjs') ||
    process.argv[1].includes('prisma-migrate-prod'));

if (isMain) {
  migrateProd();
}
