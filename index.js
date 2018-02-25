const majorVersion = parseInt(process.versions.node.split('.')[0], 10);
if (majorVersion <= 5) {
  console.log('Node.js v5.x and below will no longer be supported in the future');
  module.exports = require('./lib/YoutubeChannel');
} else {
  module.exports = require('./src/YoutubeChannel');
}