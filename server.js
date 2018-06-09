require("dotenv").config({ silent: true });

var fs = require("fs");
var cluster = require("cluster");
var ghost = require("ghost");

var utils = require("./node_modules/ghost/core/server/services/url/utils");
var express = require("express");
var parentApp = express();
// var router = express.Router();

var passport = require("passport");
var OAuth2Strategy = require("passport-oauth").OAuth2Strategy;

passport.use(
  "id",
  new OAuth2Strategy(
    {
      authorizationURL: "https://id-staging.wework.com/oauth/authorize",
      tokenURL: "https://id-staging.wework.com/oauth/token",
      clientID: process.env.ID_APPID,
      clientSecret: process.env.ID_APPSECRET,
      callbackURL: process.env.ID_CALLBACKURL
    },
    function(accessToken, refreshToken, profile, done) {
      console.log("*************", {
        accessToken,
        refreshToken,
        profile
      });

      done(null, {});
    }
  )
);

parentApp.use(passport.initialize());
parentApp.get("/auth/id", passport.authenticate("id"));
parentApp.get(
  "/auth/id/callback",
  passport.authenticate("id", {
    successRedirect: "/",
    failureRedirect: "/fail",
    session: false
  })
);

parentApp.get("/fail", function(req, res, next) {
  res.send("FAIL!");
});

// Heroku sets `WEB_CONCURRENCY` to the number of available processor cores.
var WORKERS = process.env.WEB_CONCURRENCY || 1;

if (cluster.isMaster) {
  // Master starts all workers and restarts them when they exit.
  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `Starting a new worker because PID: ${
        worker.process.pid
      } exited code ${code} from ${signal} signal.`
    );
    cluster.fork();
  });

  for (var i = 0; i < WORKERS; i++) {
    cluster.fork();
  }
} else {
  // Run Ghost in each worker / processor core.
  ghost().then(function(ghostServer) {
    parentApp.use(utils.getSubdir(), ghostServer.rootApp);

    ghostServer.start(parentApp).then(function() {
      // write nginx tmp
      fs.writeFile("/tmp/app-initialized", "Ready to launch nginx", function(
        err
      ) {
        if (err) {
          console.log(err);
        } else {
          console.log("The file was saved! Starting Ghost server ...");
        }
      });
    });
  });
}
