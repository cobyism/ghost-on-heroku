// const fs = require('fs')
// const path = require('path')
// const _ = require('underscore')
// const when = require('when')
// const express = require('express')
// const GhostPlugin = require('../../../core/server/plugins/GhostPlugin')
// const knex = require('../../../core/server/models/base').Knex

// const KudosPlugin = function(ghost) {
//   _.bindAll(this, 'addKudosToPost')

//   var templateContents = fs
//     .readFileSync(path.join(__dirname, 'assets', 'kudos.tpl'))
//     .toString()

//   this.htmlTemplate = _.template(templateContents)

//   GhostPlugin.call(this, ghost)
// }

// _.extend(KudosPlugin.prototype, GhostPlugin.prototype)

// _.extend(KudosPlugin.prototype, {
//   install: function() {
//     // Create table to hold kudos counts for posts
//     return when.all([
//       knex.Schema.createTable('posts_kudos', function(t) {
//         t.integer('post_id').primary()

//         t.integer('kudos').defaultTo(0)
//       })
//     ])
//   },

//   uninstall: function() {
//     // Drop our table to hold kudos counts
//     return when.all([knex.Schema.dropTableIfExists('posts_kudos')])

//     // TODO: How do I unregister the scripts folder and routes?
//   },

//   activate: function() {
//     var self = this

//     // Register the assets folder as /plugins/Kudos
//     this.app.server.use(
//       '/plugins/kudos/assets',
//       express.static(path.join(__dirname, 'assets'))
//     )

//     // Register the route for incrementing kudos
//     this.app.server.post('/plugins/kudos/api/', function(req, res) {
//       // TODO: Request throttling or something?
//       var postId = req.param('postId', 0)

//       if (!postId) {
//         return res.send(404, 'Post Not Found with id ' + postId)
//       }

//       self.incrementPostKudos(postId).then(
//         function() {
//           res.json({ success: true })
//         },
//         function(e) {
//           res.json({ error: e.message })
//         }
//       )
//     })

//     // Add the css reference for our kudos functionality
//     this.app.registerFilter('ghost_head', this.addCSSReference)
//     // Add the script reference for our kudos functionality
//     this.app.registerFilter('ghost_foot', this.addScriptReference)
//     // Add the html for the kudos view to the bottom of the post
//     this.app.registerFilter('prePostsRender', this.addKudosToPost)

//     // TODO: Would be nice to have a filter for when a post is created, so that we could insert the post_kudos default row
//   },

//   deactivate: function() {
//     // Add the css reference for our kudos functionality
//     this.app.unregisterFilter('ghost_head', this.addCSSReference)
//     // Add the script reference for our kudos functionality
//     this.app.unregisterFilter('ghost_foot', this.addScriptReference)
//     // Add the html for the kudos view to the bottom of the post
//     this.app.unregisterFilter('prePostsRender', this.addKudosToPost)
//   },

//   incrementPostKudos: function(postId) {
//     return knex('posts_kudos')
//       .increment('kudos', 1)
//       .where('post_id', postId)
//   },

//   addKudosToPost: function(post) {
//     if (_.isArray(post)) {
//       // Don't do anything on the list view, just for single posts
//       return post
//     }

//     return this.addKudosContent(post)
//   },

//   addCSSReference: function(styles) {
//     styles.push(
//       '<link rel="stylesheet" type="text/css" href="/plugins/kudos/assets/kudos.css">'
//     )

//     return styles
//   },

//   addScriptReference: function(scripts) {
//     // TODO: Check existing scripts for underscore/backbone already loaded
//     // TODO: The underscore and backbone additions could just be there own plugins
//     scripts.push(
//       '<script src="//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js"></script>'
//     )
//     scripts.push(
//       '<script src="//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min.js"></script>'
//     )
//     scripts.push('<script src="/plugins/kudos/assets/kudos.js"></script>')

//     return scripts
//   },

//   addKudosContent: function(post) {
//     var self = this

//     // Add Kudo count from database
//     return knex('posts_kudos')
//       .select('kudos')
//       .where({
//         post_id: post.id
//       })
//       .then(function(kudosVal) {
//         // Default to 0
//         var kudosCount = kudosVal && kudosVal.length > 0 ? kudosVal[0].kudos : 0

//         // Add the kudo figure html
//         post.html += self.htmlTemplate({
//           kudos: kudosCount
//         })

//         // Add the post id to the Kudo object
//         // TODO: This should be made available by Ghost somewhere on the page
//         post.html +=
//           '\n<script>window.Kudo = window.Kudo || {}; window.Kudo.postId = ' +
//           post.id +
//           ';</script>'

//         if (kudosVal.length < 1) {
//           // Add the default kudos row
//           return knex('posts_kudos')
//             .insert({
//               post_id: post.id,
//               kudos: 0
//             })
//             .then(function() {
//               return when.resolve(post)
//             })
//         }

//         return when.resolve(post)
//       })
//       .otherwise(function(e) {
//         console.log('Problem loading post kudos', e)
//       })
//   }
// })

// module.exports = KudosPlugin


// module.exports = App.extend({
//   install: ghost => {

//   },
//   activate: ghost => {
//     ghost.helpers.register('imgix_url', (path, options) => {
//       const params = get(options, 'hash.params', '{}')
//       const parsedParams = parse(params.replace(/'/g, '"'))

//       const relativePath = path.replace(assetHostUrl, '')
//       const imgixParams = Object.assign({}, params, defaultParams)

//       if (assetHostRegexp.test(path)) {
//         return client.buildURL(relativePath, imgixParams)
//       }

//       return path
//     })
//   }
// })
