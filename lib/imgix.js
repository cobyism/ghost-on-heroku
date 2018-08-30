const ImgixClient = require('imgix-core-js')

const assetHostUrl = process.env.ASSET_HOST_URL

const client = new ImgixClient({
  host: process.env.IMGIX_HOST
})

const defaultParams = {
  auto: 'format',
  ch: 'DPR,Width',
  w: 1000, // default to 1000, client-hint should override
  dpr: 2, // default to 2, client-hint should override
}

const buildURL = (path, params) => {
  const relativePath = path.replace(assetHostUrl, '')
  const imgixParams = Object.assign({}, params, defaultParams)

  return client.buildURL(relativePath, imgixParams)
}

module.exports = buildURL
