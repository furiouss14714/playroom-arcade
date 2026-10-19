const path = require('node:path');
const { spawnSync } = require('node:child_process');

const env = {
  ...process.env,
  ELECTRON_BUILDER_CACHE: path.join(__dirname, '.cache', 'electron-builder')
};
const builderArgs = ['node_modules/electron-builder/cli.js', '--win', 'nsis', ...process.argv.slice(2)];
if (!builderArgs.includes('--publish') && !builderArgs.some((arg) => arg.startsWith('--publish='))) {
  builderArgs.push('--publish', 'never');
}
const result = spawnSync(process.execPath, builderArgs, {
  cwd: __dirname,
  env,
  stdio: 'inherit'
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);

