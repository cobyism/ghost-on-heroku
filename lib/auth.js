const util = require('util')

const isAuthenticated = (req, res, next) => {
  // if user logged in or assets/public request, pass through
  if (req.user || /^\/(auth|assets|public)/.test(req.path)) {
    return next()
  }

  req.session.returnTo = req.originalUrl
  res.redirect('/auth/id')
}

module.exports = {
  isAuthenticated
}
