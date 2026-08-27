const app = require('./app');
const config = require('./config/env');

app.listen(config.port, () => {
  console.log(`\n╔═══════════════════════════════════════════════╗`);
  console.log(`║     AdBez Systems API — Operational           ║`);
  console.log(`║     Port: ${config.port}  |  ENV: ${config.nodeEnv.padEnd(12)}   ║`);
  console.log(`╚═══════════════════════════════════════════════╝\n`);
});
