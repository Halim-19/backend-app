export const assertTestDatabase = () => {
  const url = process.env.DATABASE_URL;
  const dbName = url ? new URL(url).pathname.slice(1) : '';
  if (!dbName.endsWith('_test')) {
    throw new Error(
      `Refusing to run tests: database "${dbName}" is not a test database (name must end with _test)`
    );
  }
};