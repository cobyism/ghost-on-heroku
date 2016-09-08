// Temporary fix for lodash issue: https://github.com/TryGhost/Ghost/issues/7336
require('ghost/core/server/overrides');

var path = require('path');
var ghost = require('ghost');

ghost({
  config: path.join(__dirname, 'config.js')
}).then(function (ghostServer) {
  ghostServer.start();
});
