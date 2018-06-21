const handlebarsImgix = require('handlebars-imgix').default
const App = require('ghost-app')

const ImgixHelper = App.extend({
  activate: ghost => {
    console.log('ImgixHelper: activate()', ghost)
    // ghost.helpers.register('imgix', handlebarsImgix({
    //   host: 'wework-com.imgix.net'
    // }))
  }
})

module.exports = ImgixHelper
