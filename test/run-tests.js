const { spawnSync } = require('child_process');
require('./imports.test.js');
const env = { ...process.env, TS_NODE_TRANSPILE_ONLY: '1' }
let r = spawnSync('npx', ['ts-node', '-r', 'tsconfig-paths/register', '--compiler-options', '{"module":"commonjs"}', 'test/workoutExercises.test.ts'], { stdio: 'inherit', env })
if (r.status !== 0) process.exit(r.status)

r = spawnSync('npx', ['ts-node', '-r', 'tsconfig-paths/register', '--compiler-options', '{"module":"commonjs"}', 'test/exerciseCategories.test.ts'], { stdio: 'inherit', env })
if (r.status !== 0) process.exit(r.status)
r = spawnSync('npx', ['ts-node', '-r', 'tsconfig-paths/register', '--compiler-options', '{"module":"commonjs"}', 'test/packageUsage.test.ts'], { stdio: 'inherit', env })
if (r.status !== 0) process.exit(r.status)
r = spawnSync(
  'npx',
  [
    'ts-node',
    '-r',
    'tsconfig-paths/register',
    '--compiler-options',
    '{"module":"commonjs","jsx":"react-jsx"}',
    'test/inviteLink.test.tsx'
  ],
  { stdio: 'inherit', env }
)

process.exit(r.status)
