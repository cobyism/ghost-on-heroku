var fs = require('fs');
var ghost = require('ghost');
var cluster = require('cluster');
// var express = require('express');
// var parentApp = express();

// var passport = require('passport');
// var GoogleStrategy = require('passport-google-oauth').OAuthStrategy;

// write nginx tmp
fs.writeFile("/tmp/app-initialized", "Ready to launch nginx", function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("The file was saved!");
  }
});


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
  // Use the GoogleStrategy within Passport.
  // Strategies in passport require a `verify` function, which accept
  // credentials (in this case, a token, tokenSecret, and Google profile), and
  // invoke a callback with a user object.
  // passport.use(new GoogleStrategy({
  //   consumerKey: GOOGLE_CONSUMER_KEY,
  //   consumerSecret: GOOGLE_CONSUMER_SECRET,
  //   callbackURL: "http://www.example.com/auth/google/callback"
  // },
  //   function (token, tokenSecret, profile, done) {
  //     User.findOrCreate({ googleId: profile.id }, function (err, user) {
  //       return done(err, user);
  //     });
  //   }
  // ));

  // Run Ghost in each worker / processor core.
  ghost().then(function (ghostServer) {
    // ghostServer.start(parentApp);
    ghostServer.start();
  });
}
