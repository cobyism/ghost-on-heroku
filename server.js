require('dotenv').config({ silent: true })

const fs = require('fs')
const cluster = require('cluster')
const ghost = require('ghost')

const utils = require('./node_modules/ghost/core/server/services/url/utils')
const express = require('express')
const session = require("express-session")

const parentApp = express()
const router = express.Router()

const passport = require('passport')
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy
// const Auth0Strategy = require('passport-auth0')

// Configure Passport to use Auth0
// passport.use(
//   'auth0',
//   new Auth0Strategy(
//     {
//       domain: process.env.AUTH0_DOMAIN,
//       clientID: process.env.AUTH0_CLIENT_ID,
//       clientSecret: process.env.AUTH0_CLIENT_SECRET,
//       callbackURL: 'http://localhost:3000/callback' //process.env.AUTH0_DOMAIN
//     },
//     (accessToken, refreshToken, extraParams, profile, done) => {
//       return done(null, profile)
//     }
//   )
// )

passport.use(
  'id',
  new OAuth2Strategy(
    {
      authorizationURL: 'https://id-staging.wework.com/oauth/authorize',
      tokenURL: 'https://id-staging.wework.com/oauth/token',
      clientID: process.env.ID_APPID,
      clientSecret: process.env.ID_APPSECRET,
      callbackURL: process.env.ID_CALLBACKURL
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, accessToken)
    }
  )
)

// This can be used to keep a smaller payload
passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

// Perform the login
// router.get(
//   '/login',
//   passport.authenticate('auth0', {
//     clientID: process.env.AUTH0_CLIENT_ID,
//     domain: process.env.AUTH0_DOMAIN,
//     redirectUri: process.env.AUTH0_CALLBACK_URL,
//     audience: 'https://' + process.env.AUTH0_DOMAIN + '/userinfo',
//     responseType: 'code',
//     scope: 'openid'
//   }),
//   (req, res) => {
//     res.redirect(utils.getSubdir())
//   }
// )

// // Perform session logout and redirect to homepage
// router.get('/logout', (req, res) => {
//   req.logout()
//   res.redirect('/')
// })

// Perform the final stage of authentication and redirect to '/user'
// router.get(
//   '/callback',
//   passport.authenticate('auth0', {
//     failureRedirect: '/'
//   }),
//   (req, res) => {
//     res.redirect(req.session.returnTo || '/user')
//   }
// )

router.get('/auth/id', passport.authenticate('id'))
router.get('/auth/id/callback',
  passport.authenticate('id', {
    // successRedirect: "/blog",
    // failureRedirect: "/fail",
    session: false
  }),
  (req, res, next) => {
    res.cookie('ID_auth_token', req.user, { maxAge: 2592000000, httpOnly: true })
    res.send(JSON.stringify(req.user))
    // res.redirect('/blog')
    return next()
  }
)

// parentApp.use(session({ secret: 'supersecretghostblogsessionwordcats' }))
parentApp.use(passport.initialize())
// parentApp.use(passport.session())
parentApp.use(router)

// Heroku sets `WEB_CONCURRENCY` to the number of available processor cores.
var WORKERS = process.env.WEB_CONCURRENCY || 1

if (cluster.isMaster) {
  // Master starts all workers and restarts them when they exit.
  cluster.on('exit', (worker, code, signal) => {
    console.log(
      `Starting a new worker because PID: ${
        worker.process.pid
      } exited code ${code} from ${signal} signal.`
    )
    cluster.fork()
  })

  for (var i = 0; i < WORKERS; i++) {
    cluster.fork()
  }
} else {
  // Run Ghost in each worker / processor core.
  ghost().then((ghostServer) => {
    parentApp.use(utils.getSubdir(), ghostServer.rootApp)

    ghostServer.start(parentApp).then(() => {
      // write nginx tmp
      fs.writeFile('/tmp/app-initialized', 'Ready to launch nginx', ( err) => {
        if (err) {
          console.log(err)
        } else {
          console.log('The file was saved! Starting Ghost server ...')
        }
      })
    })
  })
}
