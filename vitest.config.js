import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

// load .env.test and let it win over anything already in the shell
const { parsed } = config({ path: '.env.test', override: true, quiet: true });

export default defineConfig({
  test: {
    env: parsed,                          // values the tests will see
    globalSetup: './tests/globalSetup.js', // runs once before all tests
    setupFiles: ['./tests/setup.js'],      // runs before each test file
    fileParallelism: false,                // all files share one database
    hookTimeout: 30000,
  },
});