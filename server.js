require('dotenv').config({ silent: true })

const fs = require('fs')
const cluster = require('cluster')
const ghost = require('ghost')

const utils = require('./node_modules/ghost/core/server/services/url/utils')
const express = require('express')
const session = require('express-session')
const MemcachedStore = require('connect-memjs')(session)
const passport = require('passport')
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy

const parentApp = express()
const router = express.Router()

const isAuthenticated = require('./lib/auth.js').isAuthenticated

passport.use(
  'id',
  new OAuth2Strategy(
    {
      authorizationURL: process.env.ID_AUTH_URL,
      tokenURL: process.env.ID_TOKEN_URL,
      clientID: process.env.ID_APPID,
      clientSecret: process.env.ID_APPSECRET,
      callbackURL: process.env.ID_CALLBACKURL
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile)
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

router.get('/auth/id', passport.authenticate('id'))
router.get(
  '/auth/id/callback',
  passport.authenticate('id'),
  (req, res, next) => {
    res.redirect(utils.getSubdir() + (req.session.returnTo || '/'))
    next()
  }
)

parentApp.use(session({
  secret: 'supersecretghostblogsessionwordcats',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true },
  store: new MemcachedStore({
    servers: [process.env.MEMCACHIER_SERVERS],
    prefix: '_session_'
  }),
}))
parentApp.use(passport.initialize())
parentApp.use(passport.session())
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
  ghost().then(ghostServer => {
    parentApp.use(utils.getSubdir(), isAuthenticated, ghostServer.rootApp)

    ghostServer.start(parentApp).then(() => {
      // write nginx tmp
      // fs.writeFile('/tmp/app-initialized', 'Ready to launch nginx', err => {
      //   if (err) {
      //     console.log(err)
      //   } else {
      //     console.log('The file was saved! Starting Ghost server ...')
      //   }
      // })
    })
  })
}
