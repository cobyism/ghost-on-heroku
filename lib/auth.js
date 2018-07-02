// const util = require('util')
const device = require('device')

const isAuthenticated = (req, res, next) => {
  const useragent = req.headers['user-agent']
  const userDevice = device(useragent)
  const isBot = userDevice.is('bot')

  // TODO: look into how we can read these values in our
  // .hbs views so we can limit who can see content
  // (crawlers vs logged in user -- see below)
  res.locals.user = req.user
  res.locals.authenticated = !!req.user

  // FIXME: Hacky workaround to let crawlers (FB, Slack, Twitter etc
  // to see and crawl the blog posts for link sharing. Need to look into
  // a better way to handle this w/o allowing access to all the content.
  // Ideally, we would have a separate view that only renders meta data
  // for the crawlers to pick up and not the entire full content.
  if (isBot) return next()

  // if user logged in OR assets/public request, pass through
  if (req.user || /^\/(auth|assets|public)/.test(req.path)) {
    return next()
  }

  req.session.returnTo = req.originalUrl
  res.redirect('/auth/id')
}

module.exports = {
  isAuthenticated
}
