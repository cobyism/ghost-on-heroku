const uniq = require('lodash.uniq')
const uniqBy = require('lodash.uniqby')
const sortBy = require('lodash.sortby')
const get = require('lodash.get')
const flatten = require('lodash.flatten')
const intersection = require('lodash.intersection')
const App = require('ghost-app')

module.exports = App.extend({
  activate: ghost => {
    ghost.helpers.register('tags_subnav', options => {
      const { data } = options
      const { posts: allPosts } = options.hash
      const {
        root: { tag, posts: currentPosts }
      } = data
      const { slug: currentSlug } = tag

      const currentTags = flatten(currentPosts.map(post => post.tags))
      const currentSlugs = currentTags.map(tag => tag.slug)
      const currentUniqSlugs = uniq(currentSlugs)

      console.log('******** currentSlugs', currentSlugs)
      console.log('******** currentUniqSlugs', currentUniqSlugs)

      const relevantTags = []
      allPosts.forEach(post => {
        const slugs = post.tags.map(tag => get(tag, 'slug'))
        const slugIntersection = intersection(slugs, currentSlugs)

        console.log('******** slugIntersection', { slugs, currentSlugs })

        if (slugIntersection.length > 0) {
          relevantTags.push(post.tags)
        }
      })

      const allUniqTags = uniqBy(flatten(relevantTags), 'slug')

      return options.fn({ tags: sortBy(allUniqTags, 'slug') })
    })
  }
})
