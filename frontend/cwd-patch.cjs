try {
  process.cwd();
} catch (e) {
  process.cwd = () => '/Users/ankanghosh/Desktop/projects/ATSlens/frontend';
}
