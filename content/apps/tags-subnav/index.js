const uniqBy = require('lodash.uniqby')
const App = require('ghost-app')

module.exports = App.extend({
  activate: ghost => {
    ghost.helpers.register('tags_subnav', (posts, options) => {
      const {
        hash: { slug }
      } = options
      const allTags = posts.reduce((acc, post) => acc.concat(post.tags), [])
      const uniqTags = uniqBy(allTags, 'slug')
      const navTags = uniqTags.filter(tag => tag.slug !== slug)

      console.log('******** TAGS.tags', navTags)

      return navTags
    })
  }
})
