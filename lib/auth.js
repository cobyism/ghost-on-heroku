const isAuthenticated = (req, res, next) => {
  console.log('************** isAuthenticated', req.user, req.originalUrl)

  if (req.user) {
    return next()
  }

  // IF USER NOT LOGGED IN
  req.session.returnTo = req.originalUrl
  res.redirect('/auth/id')

  return next()
}

module.exports = {
  isAuthenticated
}
