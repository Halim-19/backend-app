import { execSync } from 'node:child_process';
import { assertTestDatabase } from './guard.js';

export default function setup() {
  assertTestDatabase();
  // bring the test database up to date with your migrations
  execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env });
}