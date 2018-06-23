const get = require('lodash.get')
const ImgixClient = require('imgix-core-js')
const parse = require('hjson').parse
const App = require('ghost-app')

const client = new ImgixClient({
  host: process.env.ASSET_HOST_URL
})

const defaultParams = {
  auto: 'compress,format',
  ch: 'DPR,Width',
  dpr: 2, // default to 2, client-hint will override
}

module.exports = App.extend({
  activate: ghost => {
    ghost.helpers.register('imgix_url', (path, options) => {
      const relativePath = path.replace(process.env.ASSET_HOST_URL, '')
      const params = get(options, 'hash.params', '{}')
      const parsedParams = parse(params.replace(/'/g, '"'))
      const imgixParams = Object.assign({}, parsedParams, defaultParams)

      console.log('***** imgix', {
        path,
        hostUrl: process.env.ASSET_HOST_URL,
        relativePath,
        params,
        parsedParams,
        defaultParams,
        options
      })

      if (path && /`${process.env.ASSET_HOST_URL}`/.test(path)) {

        const url = client.buildURL(relativePath, imgixParams)

        console.log('***** imgix.url', {
          url
        })

        return url
      }

      return path
    })
  }
})
