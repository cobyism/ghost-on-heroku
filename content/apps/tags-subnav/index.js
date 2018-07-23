const uniqBy = require('lodash.uniqby')
const sortBy = require('lodash.sortby')
const get = require('lodash.get')
const flatten = require('lodash.flatten')
const intersection = require('lodash.intersection')
const App = require('ghost-app')

const topLevelTagSlugs = ['startup-101', 'foo']

module.exports = App.extend({
  activate: ghost => {
    ghost.helpers.register('tags_subnav', options => {
      const { data } = options
      const { posts: allPosts } = options.hash
      const {
        root: { tag, posts: currentPosts }
      } = data
      const { slug: currentSlug } = tag

      const currentUniqTags = uniqBy(
        flatten(currentPosts.map(post => post.tags)),
        'slug'
      )
      const currentSlugs = currentUniqTags.map(tag => tag.slug)

      const relevantTags = []
      allPosts.forEach(post => {
        const slugs = post.tags.map(tag => get(tag, 'slug'))
        const slugIntersection = intersection(slugs, currentSlugs)

        if (slugIntersection.length > 0) {
          relevantTags.push(post.tags)
        }
      })

      const allUniqTags = uniqBy(flatten(relevantTags), 'slug')
      const subnavTags = allUniqTags.filter(tag => !topLevelTagSlugs.includes(tag.slug))

      // console.log('********* subnavTags', subnavTags)
      // console.log('********* allUniqTags', allUniqTags)

      return options.fn({ tags: sortBy(subnavTags, 'slug') })
    })
  }
})
