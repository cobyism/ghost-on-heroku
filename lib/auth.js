const isAuthenticated = (req, res, next) => {
  if (req.user) {
    return next()
  }

  // IF USER NOT LOGGED IN
  req.session.returnTo = req.path
  res.redirect('/auth/id')
}

module.exports = {
  isAuthenticated
}
