const ImgixClient = require('imgix-core-js')
const parse = require('hjson').parse
const App = require('ghost-app')

const client = new ImgixClient({
  host: 'labs-ghost.imgix.net'
})

const defaultParams = {
  auto: 'compress,format',
  ch: 'DPR,Width',
  dpr: 2, // default to 2, client-hint will override
}

module.exports = App.extend({
  activate: ghost => {
    ghost.helpers.register('imgix_url', (id, params) => {
      const path = id.replace(process.env.ASSET_HOST_URL, '')
      const parsedParams = parse(params.replace(/'/g, '"'))
      const imgixParams = Object.assign({}, parsedParams, defaultParams)
      const url = client.buildURL(path, imgixParams)

      console.log('************* imgix_url', { id, path, params, parsedParams, imgixParams, url })


      return url
    })
  }
})
