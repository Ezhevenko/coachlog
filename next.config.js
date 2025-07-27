const fs = require('fs');
const path = require('path');
const tsconfig = require('./tsconfig.json');

const alias = {};
const paths = tsconfig.compilerOptions && tsconfig.compilerOptions.paths || {};
for (const key of Object.keys(paths)) {
  const target = paths[key][0];
  alias[key] = path.resolve(__dirname, target);
}

module.exports = {
  webpack(config) {
    config.resolve.alias = { ...(config.resolve.alias || {}), ...alias };
    return config;
  }
};
