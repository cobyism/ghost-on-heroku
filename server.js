var fs = require('fs');
var cluster = require('cluster');
var ghost = require('ghost');
var utils = require('./node_modules/ghost/core/server/services/url/utils');
var express = require('express');
var parentApp = express();

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
    //
    parentApp
      .get('/test', function (req, res) {
        res.send('GET request to the test page')
      })
      .use(utils.getSubdir(), ghostServer.rootApp)
      // .listen('/tmp/nginx.socket', function () {
      //   if (process.env.DYNO) {
      //     console.log('This is on Heroku!!');
      //     // fs.openSync('/tmp/app-initialized', 'w');
      //   }

      //   console.log('Node server started on ' + process.env.PORT + ' at ' + Date(new Date()));
      // });

    //
    ghostServer.start(parentApp).then(function () {
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
