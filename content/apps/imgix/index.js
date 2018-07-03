const get = require('lodash.get')
const parse = require('hjson').parse
const App = require('ghost-app')
const ImgixClient = require('imgix-core-js')

const assetHostUrl = process.env.ASSET_HOST_URL
const assetHostRegexp = new RegExp(assetHostUrl)

const client = new ImgixClient({
  host: process.env.IMGIX_HOST
})

const defaultParams = {
  auto: 'format',
  ch: 'DPR,Width',
  w: 1000, // default to 1000, client-hint should override
  dpr: 2, // default to 2, client-hint should override
}

module.exports = App.extend({
  activate: ghost => {
    ghost.helpers.register('imgix_url', (path, options) => {
      const params = get(options, 'hash.params', '{}')
      const parsedParams = parse(params.replace(/'/g, '"'))

      const relativePath = path.replace(assetHostUrl, '')
      const imgixParams = Object.assign({}, params, defaultParams)

      if (assetHostRegexp.test(path)) {
        return client.buildURL(relativePath, imgixParams)
      }

      return path
    })
  }
})
