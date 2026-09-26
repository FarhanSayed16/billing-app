/**
 * Production start: migrate (with P3005 baseline), then boot Nest.
 */
import { execSync } from 'node:child_process';
import { migrateProd } from './prisma-migrate-prod.mjs';

migrateProd();
execSync('node dist/src/main', { stdio: 'inherit', env: process.env });
