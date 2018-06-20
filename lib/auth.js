const util = require('util')

const isAuthenticated = (req, res, next) => {
  // if user logged in or assets/public request, pass through
  if (req.session.user || /^\/(auth|assets|public)/.test(req.path)) {
    return next()
  }

  console.log('\n******* redirecting to /auth/id, returnTo:', req.originalUrl, req.user, util.inspect(req.session))

  req.session.returnTo = req.originalUrl
  res.redirect('/auth/id')
}

module.exports = {
  isAuthenticated
}
