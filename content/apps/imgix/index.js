const ImgixClient = require('imgix-core-js')
const parse = require('hjson').parse
const App = require('ghost-app')

const client = new ImgixClient({
  host: 'labs-ghost.imgix.net'
})

module.exports = App.extend({
  activate: ghost => {
    ghost.helpers.register('imgix_url', (id, params) => {
      return client.buildURL(id, parse(params.replace(/'/g, '"')))
    })
  }
})
