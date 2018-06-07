var fs = require('fs');
var cluster = require('cluster');
var ghost = require('ghost');
// var utils = require('./node_modules/ghost/core/server/services/url/utils');
// var express = require('express');
// var parentApp = express();

// Heroku sets `WEB_CONCURRENCY` to the number of available processor cores.
var WORKERS = process.env.WEB_CONCURRENCY || 1;

if (cluster.isMaster) {
  // Master starts all workers and restarts them when they exit.
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Starting a new worker because PID: ${worker.process.pid} exited code ${code} from ${signal} signal.`);
    cluster.fork();
  });

  for (var i = 0; i < WORKERS; i++) {
    cluster.fork();
  }
} else {
  // Run Ghost in each worker / processor core.
  ghost().then(function (ghostServer) {
    // parentApp
    //   .use(utils.getSubdir(), ghostServer.rootApp)

    //
    ghostServer.start().then(function () {
      // write nginx tmp
      fs.writeFile("/tmp/app-initialized", "Ready to launch nginx", function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("The file was saved!");
        }
      });
    });
  });
}
