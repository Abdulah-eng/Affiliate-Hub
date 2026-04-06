const { execSync } = require('child_process');

try {
  const output = execSync('npx prisma validate', { encoding: 'utf-8' });
  console.log("SUCCESS:\n", output);
} catch (e) {
  console.log("ERROR:\n", e.stderr.toString());
}
