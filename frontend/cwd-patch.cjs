// Working-directory guard for Node tooling launched with a deleted cwd.
// Resolves this file's own directory rather than a hardcoded path.
try {
  process.cwd();
} catch (e) {
  const dir = __dirname;
  process.cwd = () => dir;
}
