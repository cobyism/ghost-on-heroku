define('ghost/templates/-floating-header', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("Published");
  }

function program3(depth0,data) {
  
  
  data.buffer.push("Written");
  }

function program5(depth0,data) {
  
  var stack1;
  stack1 = helpers._triageMustache.call(depth0, "author.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }

function program7(depth0,data) {
  
  var stack1;
  stack1 = helpers._triageMustache.call(depth0, "author.email", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  }

function program9(depth0,data) {
  
  
  data.buffer.push("\n            <span class=\"hidden\">Edit Post</span>\n        ");
  }

function program11(depth0,data) {
  
  
  data.buffer.push("\n            <span class=\"hidden\">Post Settings</span>\n        ");
  }

function program13(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n            ");
  data.buffer.push(escapeExpression((helper = helpers.render || (depth0 && depth0.render),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "post-settings-menu", "model", options) : helperMissing.call(depth0, "render", "post-settings-menu", "model", options))));
  data.buffer.push("\n        ");
  return buffer;
  }

  data.buffer.push("<header class=\"floatingheader\">\n    <button type=\"button\" class=\"button-back\" href=\"#\">Back</button>\n    <button type=\"button\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("featured:featured:unfeatured")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" title=\"Feature this post\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleFeatured", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n        <span class=\"hidden\">Star</span>\n    </button>\n    <small>\n        <span class=\"status\">");
  stack1 = helpers['if'].call(depth0, "isPublished", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n        <span class=\"normal\">by</span>\n        <span class=\"author\">");
  stack1 = helpers['if'].call(depth0, "author.name", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n    </small>\n    <section class=\"post-controls\">\n        ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'class': ("post-edit"),
    'title': ("Edit Post")
  },hashTypes:{'class': "STRING",'title': "STRING"},hashContexts:{'class': depth0,'title': depth0},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "editor.edit", "", options) : helperMissing.call(depth0, "link-to", "editor.edit", "", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  stack1 = (helper = helpers['gh-popover-button'] || (depth0 && depth0['gh-popover-button']),options={hash:{
    'popoverName': ("post-settings-menu"),
    'classNames': ("post-settings"),
    'title': ("Post Settings")
  },hashTypes:{'popoverName': "STRING",'classNames': "STRING",'title': "STRING"},hashContexts:{'popoverName': depth0,'classNames': depth0,'title': depth0},inverse:self.noop,fn:self.program(11, program11, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-popover-button", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  stack1 = (helper = helpers['gh-popover'] || (depth0 && depth0['gh-popover']),options={hash:{
    'name': ("post-settings-menu"),
    'classNames': ("post-settings-menu menu-drop-right")
  },hashTypes:{'name': "STRING",'classNames': "STRING"},hashContexts:{'name': depth0,'classNames': depth0},inverse:self.noop,fn:self.program(13, program13, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-popover", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </section>\n</header>\n");
  return buffer;
  
}); });

define('ghost/templates/-import-errors', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var stack1, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n<table class=\"table\">\n");
  stack1 = helpers.each.call(depth0, "importErrors", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</table>\n");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <tr><td>");
  stack1 = helpers._triageMustache.call(depth0, "message", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</td></tr>\n");
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, "importErrors", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  
}); });

define('ghost/templates/-navbar', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n                ");
  data.buffer.push(escapeExpression((helper = helpers['gh-activating-list-item'] || (depth0 && depth0['gh-activating-list-item']),options={hash:{
    'route': ("settings"),
    'title': ("Settings"),
    'classNames': ("settings js-close-sidebar")
  },hashTypes:{'route': "STRING",'title': "STRING",'classNames': "STRING"},hashContexts:{'route': depth0,'title': depth0,'classNames': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-activating-list-item", options))));
  data.buffer.push("\n            ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    ");
  stack1 = helpers['if'].call(depth0, "session.user.image", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    <span class=\"name\">");
  stack1 = helpers._triageMustache.call(depth0, "session.user.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n                ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                    <img class=\"avatar\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("session.user.image")
  },hashTypes:{'src': "STRING"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" alt=\"Avatar\" />\n                    ");
  return buffer;
  }

function program6(depth0,data) {
  
  
  data.buffer.push("\n                    <img class=\"avatar\" src=\"/shared/img/user-image.png\" alt=\"Avatar\" />\n                    ");
  }

function program8(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n                        <li class=\"usermenu-profile\">");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "settings.users.user", "session.user.slug", options) : helperMissing.call(depth0, "link-to", "settings.users.user", "session.user.slug", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</li>\n                        <li class=\"divider\"></li>\n                        <li class=\"usermenu-help\"><a href=\"http://support.ghost.org/\">Help / Support</a></li>\n                        <li class=\"divider\"></li>\n                        <li class=\"usermenu-signout\">");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "signout", options) : helperMissing.call(depth0, "link-to", "signout", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</li>\n                ");
  return buffer;
  }
function program9(depth0,data) {
  
  
  data.buffer.push("Your Profile");
  }

function program11(depth0,data) {
  
  
  data.buffer.push("Sign Out");
  }

  data.buffer.push("<header id=\"global-header\" class=\"navbar\">\n    \n    <button ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleSidebarOrGoHome", {hash:{
    'target': ("view")
  },hashTypes:{'target': "STRING"},hashContexts:{'target': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" class=\"ghost-logo ghost-logo-button\">\n        <span class=\"hidden\">Ghost</span>\n    </button>\n    <a class=\"ghost-logo ghost-logo-link\">\n        <span class=\"hidden\">Ghost</span>\n    </a>\n\n    <nav id=\"global-nav\" role=\"navigation\">\n        <ul id=\"main-menu\" >\n            ");
  data.buffer.push(escapeExpression((helper = helpers['gh-activating-list-item'] || (depth0 && depth0['gh-activating-list-item']),options={hash:{
    'route': ("posts"),
    'title': ("Content"),
    'classNames': ("content js-close-sidebar")
  },hashTypes:{'route': "STRING",'title': "STRING",'classNames': "STRING"},hashContexts:{'route': depth0,'title': depth0,'classNames': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-activating-list-item", options))));
  data.buffer.push("\n            ");
  data.buffer.push(escapeExpression((helper = helpers['gh-activating-list-item'] || (depth0 && depth0['gh-activating-list-item']),options={hash:{
    'route': ("editor.new"),
    'title': ("New Post"),
    'classNames': ("editor js-close-sidebar")
  },hashTypes:{'route': "STRING",'title': "STRING",'classNames': "STRING"},hashContexts:{'route': depth0,'title': depth0,'classNames': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-activating-list-item", options))));
  data.buffer.push("\n            ");
  stack1 = helpers.unless.call(depth0, "session.user.isAuthor", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n            <li id=\"usermenu\" class=\"usermenu subnav\">\n                ");
  stack1 = (helper = helpers['gh-popover-button'] || (depth0 && depth0['gh-popover-button']),options={hash:{
    'popoverName': ("user-menu"),
    'classNames': ("dropdown")
  },hashTypes:{'popoverName': "STRING",'classNames': "STRING"},hashContexts:{'popoverName': depth0,'classNames': depth0},inverse:self.noop,fn:self.program(3, program3, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-popover-button", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  stack1 = (helper = helpers['gh-popover'] || (depth0 && depth0['gh-popover']),options={hash:{
    'tagName': ("ul"),
    'classNames': ("overlay"),
    'name': ("user-menu"),
    'closeOnClick': ("true")
  },hashTypes:{'tagName': "STRING",'classNames': "STRING",'name': "STRING",'closeOnClick': "STRING"},hashContexts:{'tagName': depth0,'classNames': depth0,'name': depth0,'closeOnClick': depth0},inverse:self.noop,fn:self.program(8, program8, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-popover", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </li>\n        </ul>\n    </nav>\n</header>\n");
  return buffer;
  
}); });

define('ghost/templates/-publish-bar', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n                    <span class=\"hidden\">Post Settings</span>\n                ");
  }

function program3(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n                    ");
  data.buffer.push(escapeExpression((helper = helpers.render || (depth0 && depth0.render),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "post-settings-menu", "model", options) : helperMissing.call(depth0, "render", "post-settings-menu", "model", options))));
  data.buffer.push("\n                ");
  return buffer;
  }

  data.buffer.push("<footer id=\"publish-bar\">\n    <nav>\n        ");
  data.buffer.push(escapeExpression((helper = helpers.render || (depth0 && depth0.render),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "post-tags-input", options) : helperMissing.call(depth0, "render", "post-tags-input", options))));
  data.buffer.push("\n\n        <div class=\"right\">\n\n            <section id=\"entry-controls\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("isNew:unsaved")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                ");
  stack1 = (helper = helpers['gh-popover-button'] || (depth0 && depth0['gh-popover-button']),options={hash:{
    'popoverName': ("post-settings-menu"),
    'classNames': ("post-settings"),
    'title': ("Post Settings")
  },hashTypes:{'popoverName': "STRING",'classNames': "STRING",'title': "STRING"},hashContexts:{'popoverName': depth0,'classNames': depth0,'title': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-popover-button", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  stack1 = (helper = helpers['gh-popover'] || (depth0 && depth0['gh-popover']),options={hash:{
    'name': ("post-settings-menu"),
    'classNames': ("post-settings-menu menu-right")
  },hashTypes:{'name': "STRING",'classNames': "STRING"},hashContexts:{'name': depth0,'classNames': depth0},inverse:self.noop,fn:self.program(3, program3, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-popover", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </section>\n\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "editor-save-button", {hash:{
    'id': ("entry-actions")
  },hashTypes:{'id': "STRING"},hashContexts:{'id': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\n        </div>\n    </nav>\n</footer>\n");
  return buffer;
  
}); });

define('ghost/templates/application', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n    ");
  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "navbar", options) : helperMissing.call(depth0, "partial", "navbar", options))));
  data.buffer.push("\n");
  return buffer;
  }

  stack1 = helpers.unless.call(depth0, "hideNav", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n<main role=\"main\" id=\"main\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'data-notification-count': ("topNotificationCount")
  },hashTypes:{'data-notification-count': "ID"},hashContexts:{'data-notification-count': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n    ");
  data.buffer.push(escapeExpression((helper = helpers['gh-notifications'] || (depth0 && depth0['gh-notifications']),options={hash:{
    'location': ("top"),
    'notify': ("topNotificationChange")
  },hashTypes:{'location': "STRING",'notify': "STRING"},hashContexts:{'location': depth0,'notify': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-notifications", options))));
  data.buffer.push("\n    ");
  data.buffer.push(escapeExpression((helper = helpers['gh-notifications'] || (depth0 && depth0['gh-notifications']),options={hash:{
    'location': ("bottom")
  },hashTypes:{'location': "STRING"},hashContexts:{'location': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-notifications", options))));
  data.buffer.push("\n\n    ");
  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</main>\n");
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "modal", options) : helperMissing.call(depth0, "outlet", "modal", options))));
  data.buffer.push("\n");
  return buffer;
  
}); });

define('ghost/templates/components/gh-activating-list-item', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  stack1 = helpers._triageMustache.call(depth0, "title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  stack1 = helpers._triageMustache.call(depth0, "yield", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  return buffer;
  }

  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'alternateActive': ("active")
  },hashTypes:{'alternateActive': "ID"},hashContexts:{'alternateActive': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "route", options) : helperMissing.call(depth0, "link-to", "route", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
}); });

define('ghost/templates/components/gh-file-upload', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression;


  data.buffer.push("    <input data-url=\"upload\" class=\"button-add\" type=\"file\" name=\"importfile\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'accept': ("options.acceptEncoding")
  },hashTypes:{'accept': "ID"},hashContexts:{'accept': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n    <button type=\"submit\" class=\"button-save\" id=\"startupload\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'disabled': ("uploadButtonDisabled")
  },hashTypes:{'disabled': "ID"},hashContexts:{'disabled': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "upload", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n        ");
  stack1 = helpers._triageMustache.call(depth0, "uploadButtonText", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </button>\n");
  return buffer;
  
}); });

define('ghost/templates/components/gh-markdown', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push(escapeExpression((helper = helpers['gh-format-markdown'] || (depth0 && depth0['gh-format-markdown']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "markdown", options) : helperMissing.call(depth0, "gh-format-markdown", "markdown", options))));
  data.buffer.push("\n");
  return buffer;
  
}); });

define('ghost/templates/components/gh-modal-dialog', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("<header class=\"modal-header\"><h1>");
  stack1 = helpers._triageMustache.call(depth0, "title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h1></header>");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '';
  data.buffer.push("<a class=\"close\" href=\"\" title=\"Close\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "closeModal", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("><span class=\"hidden\">Close</span></a>");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            <footer class=\"modal-footer\">\n                <button type=\"button\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("acceptButtonClass :js-button-accept")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "confirm", "accept", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">\n                    ");
  stack1 = helpers._triageMustache.call(depth0, "confirm.accept.text", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </button>\n                <button type=\"button\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("rejectButtonClass :js-button-reject")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "confirm", "reject", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">\n                    ");
  stack1 = helpers._triageMustache.call(depth0, "confirm.reject.text", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </button>\n            </footer>\n            ");
  return buffer;
  }

  data.buffer.push("<div id=\"modal-container\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "closeModal", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n    <article ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("klass :js-modal")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n        <section class=\"modal-content\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, {hash:{
    'bubbles': (false),
    'preventDefault': (false)
  },hashTypes:{'bubbles': "BOOLEAN",'preventDefault': "BOOLEAN"},hashContexts:{'bubbles': depth0,'preventDefault': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n            ");
  stack1 = helpers['if'].call(depth0, "title", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  stack1 = helpers['if'].call(depth0, "showClose", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            <section class=\"modal-body\">\n                ");
  stack1 = helpers._triageMustache.call(depth0, "yield", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </section>\n            ");
  stack1 = helpers['if'].call(depth0, "confirm", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </section>\n    </article>\n</div>\n<div class=\"modal-background fade\"></div>\n");
  return buffer;
  
}); });

define('ghost/templates/components/gh-notification', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', escapeExpression=this.escapeExpression;


  data.buffer.push("<section ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":js-notification typeClass")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n    <span class=\"notification-message\">\n        ");
  data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "message.message", {hash:{
    'unescaped': ("true")
  },hashTypes:{'unescaped': "STRING"},hashContexts:{'unescaped': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n    </span>\n    <button class=\"close\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "closeNotification", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("><span class=\"hidden\">Close</span></button>\n</section>");
  return buffer;
  
}); });

define('ghost/templates/components/gh-notifications', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n    ");
  data.buffer.push(escapeExpression((helper = helpers['gh-notification'] || (depth0 && depth0['gh-notification']),options={hash:{
    'message': ("")
  },hashTypes:{'message': "ID"},hashContexts:{'message': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-notification", options))));
  data.buffer.push("\n");
  return buffer;
  }

  stack1 = helpers.each.call(depth0, "messages", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
}); });

define('ghost/templates/components/gh-role-selector', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n<option ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'value': ("id")
  },hashTypes:{'value': "ID"},hashContexts:{'value': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</option>\n");
  return buffer;
  }

  data.buffer.push("<select ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'id': ("selectId"),
    'name': ("selectName")
  },hashTypes:{'id': "ID",'name': "ID"},hashContexts:{'id': depth0,'name': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n");
  stack1 = helpers.each.call(depth0, "roles", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</select>\n");
  return buffer;
  
}); });

define('ghost/templates/debug', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n                <fieldset>\n                    <div class=\"form-group\">\n                        <label>Import</label>\n                        ");
  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "import-errors", options) : helperMissing.call(depth0, "partial", "import-errors", options))));
  data.buffer.push("\n                        ");
  data.buffer.push(escapeExpression((helper = helpers['gh-file-upload'] || (depth0 && depth0['gh-file-upload']),options={hash:{
    'id': ("importfile"),
    'uploadButtonText': ("uploadButtonText")
  },hashTypes:{'id': "STRING",'uploadButtonText': "ID"},hashContexts:{'id': depth0,'uploadButtonText': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-file-upload", options))));
  data.buffer.push("\n                        <p>Import from another Ghost installation. If you import a user, this will replace the current user & log you out.</p>\n                    </div>\n                </fieldset>\n            ");
  return buffer;
  }

  data.buffer.push("<div class=\"wrapper settings-debug\">\n    <aside class=\"settings-sidebar\" role=\"complementary\">\n        <header>\n            <h1 class=\"title\">Ugly Debug Tools</h1>\n        </header>\n    </aside>\n\n    <section class=\"settings-content active\">\n        <section class=\"content\">\n            <form id=\"settings-export\">\n                <fieldset>\n                    <div class=\"form-group\">\n                        <label>Export</label>\n                        <a class=\"button-save\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "exportData", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Export</a>\n                        <p>Export the blog settings and data.</p>\n                    </div>\n                </fieldset>\n            </form>\n            ");
  stack1 = (helper = helpers['gh-form'] || (depth0 && depth0['gh-form']),options={hash:{
    'id': ("settings-import"),
    'enctype': ("multipart/form-data")
  },hashTypes:{'id': "STRING",'enctype': "STRING"},hashContexts:{'id': depth0,'enctype': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-form", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            <form id=\"settings-resetdb\">\n                <fieldset>\n                    <div class=\"form-group\">\n                        <label>Delete all Content</label>\n                        <a href=\"javascript:void(0);\" class=\"button-delete js-delete\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openModal", "deleteAll", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">Delete</a>\n                        <p>Delete all posts and tags from the database.</p>\n                    </div>\n                </fieldset>\n            </form>\n            <form id=\"settings-testmail\">\n                <fieldset>\n                    <div class=\"form-group\">\n                        <label>Send a test email</label>\n                        <button type=\"submit\" id=\"sendtestmail\" class=\"button-save\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "sendTestEmail", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Send</button>\n                        <p>Sends a test email to your address.</p>\n                    </div>\n                </fieldset>\n            </form>\n        </section>\n    </section>\n</div>\n");
  return buffer;
  
}); });

define('ghost/templates/editor-save-button', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("\n    <span class=\"hidden\">Post Settings</span>\n");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <li ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("controller.willPublish:active")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n        <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "setSaveType", "publish", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" href=\"#\">");
  stack1 = helpers._triageMustache.call(depth0, "view.publishText", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a>\n    </li>\n    <li ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("controller.willPublish::active")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n        <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "setSaveType", "draft", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" href=\"#\">");
  stack1 = helpers._triageMustache.call(depth0, "view.draftText", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a>\n    </li>\n");
  return buffer;
  }

  data.buffer.push("<button type=\"button\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "save", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.isDangerous:button-delete:button-save :js-publish-button")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n    ");
  stack1 = helpers._triageMustache.call(depth0, "view.save-text", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</button>\n");
  stack1 = (helper = helpers['gh-popover-button'] || (depth0 && depth0['gh-popover-button']),options={hash:{
    'popoverName': ("post-save-menu"),
    'classNameBindings': ("open:active :options :up"),
    'title': ("Post Settings")
  },hashTypes:{'popoverName': "STRING",'classNameBindings': "STRING",'title': "STRING"},hashContexts:{'popoverName': depth0,'classNameBindings': depth0,'title': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-popover-button", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" \n");
  stack1 = (helper = helpers['gh-popover'] || (depth0 && depth0['gh-popover']),options={hash:{
    'name': ("post-save-menu"),
    'closeOnClick': ("true"),
    'tagName': ("ul"),
    'classNames': ("editor-options overlay"),
    'publishTextBinding': ("view.publish-text"),
    'draftTextBinding': ("view.draft-text")
  },hashTypes:{'name': "STRING",'closeOnClick': "STRING",'tagName': "STRING",'classNames': "STRING",'publishTextBinding': "STRING",'draftTextBinding': "STRING"},hashContexts:{'name': depth0,'closeOnClick': depth0,'tagName': depth0,'classNames': depth0,'publishTextBinding': depth0,'draftTextBinding': depth0},inverse:self.noop,fn:self.program(3, program3, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-popover", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  return buffer;
  
}); });

define('ghost/templates/editor/edit', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<header>\n    <section class=\"box entry-title\">\n        ");
  data.buffer.push(escapeExpression((helper = helpers['gh-trim-focus-input'] || (depth0 && depth0['gh-trim-focus-input']),options={hash:{
    'type': ("text"),
    'id': ("entry-title"),
    'placeholder': ("Your Post Title"),
    'value': ("titleScratch"),
    'tabindex': ("1"),
    'focus': ("shouldFocusTitle")
  },hashTypes:{'type': "STRING",'id': "STRING",'placeholder': "STRING",'value': "ID",'tabindex': "STRING",'focus': "ID"},hashContexts:{'type': depth0,'id': depth0,'placeholder': depth0,'value': depth0,'tabindex': depth0,'focus': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-trim-focus-input", options))));
  data.buffer.push("\n    </section>\n</header>\n\n<section class=\"entry-markdown active\">\n    <header class=\"floatingheader\" id=\"entry-markdown-header\">\n        <small>Markdown</small>\n        <a class=\"markdown-help\" href=\"\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openModal", "markdown", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push("><span class=\"hidden\">What is Markdown?</span></a>\n    </header>\n    <section id=\"entry-markdown-content\" class=\"entry-markdown-content\">\n        ");
  data.buffer.push(escapeExpression((helper = helpers['gh-codemirror'] || (depth0 && depth0['gh-codemirror']),options={hash:{
    'value': ("scratch"),
    'scrollInfo': ("view.markdownScrollInfo"),
    'setCodeMirror': ("setCodeMirror")
  },hashTypes:{'value': "ID",'scrollInfo': "ID",'setCodeMirror': "STRING"},hashContexts:{'value': depth0,'scrollInfo': depth0,'setCodeMirror': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-codemirror", options))));
  data.buffer.push("\n    </section>\n</section>\n\n<section class=\"entry-preview\">\n    <header class=\"floatingheader\" id=\"entry-preview-header\">\n        <small>Preview <span class=\"entry-word-count js-entry-word-count\">");
  data.buffer.push(escapeExpression((helper = helpers['gh-count-words'] || (depth0 && depth0['gh-count-words']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "scratch", options) : helperMissing.call(depth0, "gh-count-words", "scratch", options))));
  data.buffer.push("</span></small>\n    </header>\n    <section class=\"entry-preview-content\">\n        ");
  data.buffer.push(escapeExpression((helper = helpers['gh-markdown'] || (depth0 && depth0['gh-markdown']),options={hash:{
    'markdown': ("scratch"),
    'scrollPosition': ("view.scrollPosition"),
    'uploadStarted': ("disableCodeMirror"),
    'uploadFinished': ("enableCodeMirror"),
    'uploadSuccess': ("handleImgUpload")
  },hashTypes:{'markdown': "ID",'scrollPosition': "ID",'uploadStarted': "STRING",'uploadFinished': "STRING",'uploadSuccess': "STRING"},hashContexts:{'markdown': depth0,'scrollPosition': depth0,'uploadStarted': depth0,'uploadFinished': depth0,'uploadSuccess': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-markdown", options))));
  data.buffer.push("\n    </section>\n</section>\n\n");
  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "publish-bar", options) : helperMissing.call(depth0, "partial", "publish-bar", options))));
  data.buffer.push("\n");
  return buffer;
  
}); });

define('ghost/templates/error', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <section class=\"error-stack\">\n        <h3>Stack Trace</h3>\n        <p><strong>");
  stack1 = helpers._triageMustache.call(depth0, "message", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</strong></p>\n        <ul class=\"error-stack-list\">\n            ");
  stack1 = helpers.each.call(depth0, "stack", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n    </section>\n");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                <li>\n                    at\n                    ");
  stack1 = helpers['if'].call(depth0, "function", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    <span class=\"error-stack-file\">(");
  stack1 = helpers._triageMustache.call(depth0, "at", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(")</span>\n                </li>\n            ");
  return buffer;
  }
function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("<em class=\"error-stack-function\">");
  stack1 = helpers._triageMustache.call(depth0, "function", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</em>");
  return buffer;
  }

  data.buffer.push("<section class=\"error-content error-404 js-error-container\">\n    <section class=\"error-details\">\n         <figure class=\"error-image\">\n             <img class=\"error-ghost\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("ghostPaths.errorImageSrc"),
    'srcset': ("ghostPaths.errorImageSrcSet")
  },hashTypes:{'src': "ID",'srcset': "ID"},hashContexts:{'src': depth0,'srcset': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" />\n         </figure>\n         <section class=\"error-message\">\n             <h1 class=\"error-code\">");
  stack1 = helpers._triageMustache.call(depth0, "code", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h1>\n             <h2 class=\"error-description\">");
  stack1 = helpers._triageMustache.call(depth0, "message", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h2>\n             <a class=\"error-link\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'href': ("ghostPaths.blogRoot")
  },hashTypes:{'href': "ID"},hashContexts:{'href': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">Go to the front page →</a>\n         </section>\n    </section>\n</section>\n\n");
  stack1 = helpers['if'].call(depth0, "stack", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
}); });

define('ghost/templates/forgotten', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<section class=\"forgotten-box js-forgotten-box fade-in\">\n    <form id=\"forgotten\" class=\"forgotten-form\" method=\"post\" novalidate=\"novalidate\">\n        <div class=\"email-wrap\">\n            ");
  data.buffer.push(escapeExpression((helper = helpers['gh-trim-focus-input'] || (depth0 && depth0['gh-trim-focus-input']),options={hash:{
    'value': ("email"),
    'class': ("email"),
    'type': ("email"),
    'placeholder': ("Email Address"),
    'name': ("email"),
    'autofocus': ("autofocus"),
    'autocapitalize': ("off"),
    'autocorrect': ("off")
  },hashTypes:{'value': "ID",'class': "STRING",'type': "STRING",'placeholder': "STRING",'name': "STRING",'autofocus': "STRING",'autocapitalize': "STRING",'autocorrect': "STRING"},hashContexts:{'value': depth0,'class': depth0,'type': depth0,'placeholder': depth0,'name': depth0,'autofocus': depth0,'autocapitalize': depth0,'autocorrect': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-trim-focus-input", options))));
  data.buffer.push("\n        </div>\n        <button class=\"button-save\" type=\"submit\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "submit", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'disabled': ("submitting")
  },hashTypes:{'disabled': "ID"},hashContexts:{'disabled': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">Send new password</button>\n    </form>\n</section>\n");
  return buffer;
  
}); });

define('ghost/templates/modals/delete-all', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("\n\n    <p>This is permanent! No backups, no restores, no magic undo button. <br /> We warned you, ok?</p>\n\n");
  }

  stack1 = (helper = helpers['gh-modal-dialog'] || (depth0 && depth0['gh-modal-dialog']),options={hash:{
    'action': ("closeModal"),
    'type': ("action"),
    'style': ("wide,centered"),
    'animation': ("fade"),
    'title': ("Would you really like to delete all content from your blog?"),
    'confirm': ("confirm")
  },hashTypes:{'action': "STRING",'type': "STRING",'style': "STRING",'animation': "STRING",'title': "STRING",'confirm': "ID"},hashContexts:{'action': depth0,'type': depth0,'style': depth0,'animation': depth0,'title': depth0,'confirm': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-modal-dialog", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
}); });

define('ghost/templates/modals/delete-post', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("\n\n    <p>This is permanent! No backups, no restores, no magic undo button. <br /> We warned you, ok?</p>\n\n");
  }

  stack1 = (helper = helpers['gh-modal-dialog'] || (depth0 && depth0['gh-modal-dialog']),options={hash:{
    'action': ("closeModal"),
    'showClose': (true),
    'type': ("action"),
    'style': ("wide,centered"),
    'animation': ("fade"),
    'title': ("Are you sure you want to delete this post?"),
    'confirm': ("confirm")
  },hashTypes:{'action': "STRING",'showClose': "BOOLEAN",'type': "STRING",'style': "STRING",'animation': "STRING",'title': "STRING",'confirm': "ID"},hashContexts:{'action': depth0,'showClose': depth0,'type': depth0,'style': depth0,'animation': depth0,'title': depth0,'confirm': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-modal-dialog", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
}); });

define('ghost/templates/modals/delete-user', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var stack1, helper, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("\n\n    <p>All posts and associated data will also be deleted. There is no way to recover this data.\n    </p>\n\n");
  }

  stack1 = (helper = helpers['gh-modal-dialog'] || (depth0 && depth0['gh-modal-dialog']),options={hash:{
    'action': ("closeModal"),
    'showClose': (true),
    'type': ("action"),
    'style': ("wide,centered"),
    'animation': ("fade"),
    'title': ("Are you sure you want to delete this user?"),
    'confirm': ("confirm")
  },hashTypes:{'action': "STRING",'showClose': "BOOLEAN",'type': "STRING",'style': "STRING",'animation': "STRING",'title': "STRING",'confirm': "ID"},hashContexts:{'action': depth0,'showClose': depth0,'type': depth0,'style': depth0,'animation': depth0,'title': depth0,'confirm': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-modal-dialog", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  
}); });

define('ghost/templates/modals/invite-new-user', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n\n        <fieldset>\n            <div class=\"form-group\">\n                <label for=\"new-user-email\">Email Address</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'action': ("confirmAccept"),
    'class': ("email"),
    'id': ("new-user-email"),
    'type': ("email"),
    'placeholder': ("Email Address"),
    'name': ("email"),
    'autofocus': ("autofocus"),
    'autocapitalize': ("off"),
    'autocorrect': ("off"),
    'value': ("email")
  },hashTypes:{'action': "STRING",'class': "STRING",'id': "STRING",'type': "STRING",'placeholder': "STRING",'name': "STRING",'autofocus': "STRING",'autocapitalize': "STRING",'autocorrect': "STRING",'value': "ID"},hashContexts:{'action': depth0,'class': depth0,'id': depth0,'type': depth0,'placeholder': depth0,'name': depth0,'autofocus': depth0,'autocapitalize': depth0,'autocorrect': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n            </div>\n\n            <div class=\"form-group for-select\">\n                <label for=\"new-user-role\">Role</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers['gh-role-selector'] || (depth0 && depth0['gh-role-selector']),options={hash:{
    'initialValue': ("authorRole"),
    'onChange': ("setRole"),
    'selectId': ("new-user-role")
  },hashTypes:{'initialValue': "ID",'onChange': "STRING",'selectId': "STRING"},hashContexts:{'initialValue': depth0,'onChange': depth0,'selectId': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-role-selector", options))));
  data.buffer.push("\n            </div>\n\n        </fieldset>\n\n");
  return buffer;
  }

  stack1 = (helper = helpers['gh-modal-dialog'] || (depth0 && depth0['gh-modal-dialog']),options={hash:{
    'action': ("closeModal"),
    'showClose': (true),
    'type': ("action"),
    'animation': ("fade"),
    'title': ("Invite a New User"),
    'confirm': ("confirm"),
    'class': ("invite-new-user")
  },hashTypes:{'action': "STRING",'showClose': "BOOLEAN",'type': "STRING",'animation': "STRING",'title': "STRING",'confirm': "ID",'class': "STRING"},hashContexts:{'action': depth0,'showClose': depth0,'type': depth0,'animation': depth0,'title': depth0,'confirm': depth0,'class': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-modal-dialog", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
}); });

define('ghost/templates/modals/leave-editor', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("\n\n    <p>Hey there! It looks like you're in the middle of writing something and you haven't saved all of your\n    content.</p>\n    \n    <p>Save before you go!</p>\n\n");
  }

  stack1 = (helper = helpers['gh-modal-dialog'] || (depth0 && depth0['gh-modal-dialog']),options={hash:{
    'action': ("closeModal"),
    'showClose': (true),
    'type': ("action"),
    'style': ("wide,centered"),
    'animation': ("fade"),
    'title': ("Are you sure you want to leave this page?"),
    'confirm': ("confirm")
  },hashTypes:{'action': "STRING",'showClose': "BOOLEAN",'type': "STRING",'style': "STRING",'animation': "STRING",'title': "STRING",'confirm': "ID"},hashContexts:{'action': depth0,'showClose': depth0,'type': depth0,'style': depth0,'animation': depth0,'title': depth0,'confirm': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-modal-dialog", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
}); });

define('ghost/templates/modals/markdown', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("\n    <section class=\"markdown-help-container\">\n        <table class=\"modal-markdown-help-table\">\n            <thead>\n            <tr>\n                <th>Result</th>\n                <th>Markdown</th>\n                <th>Shortcut</th>\n            </tr>\n            </thead>\n            <tbody>\n            <tr>\n                <td><strong>Bold</strong></td>\n                <td>**text**</td>\n                <td>Ctrl/⌘ + B </td>\n            </tr>\n            <tr>\n                <td><em>Emphasize</em></td>\n                <td>*text*</td>\n                <td>Ctrl/⌘ + I</td>\n            </tr>\n            <tr>\n                <td><del>Strike-through</del></td>\n                <td>~~text~~</td>\n                <td>Ctrl + Alt + U</td>\n            </tr>\n            <tr>\n                <td><a href=\"#\">Link</a></td>\n                <td>[title](http://)</td>\n                <td>Ctrl/⌘ + K</td>\n            </tr>\n            <tr>\n                <td><code>Inline Code</code></td>\n                <td>`code`</td>\n                <td>Ctrl/⌘ + Shift + K</td>\n            </tr>\n            <tr>\n                <td>Image</td>\n                <td>![alt](http://)</td>\n                <td>Ctrl/⌘ + Shift + I</td>\n            </tr>\n            <tr>\n                <td>List</td>\n                <td>* item</td>\n                <td>Ctrl + L</td>\n            </tr>\n            <tr>\n                <td>Blockquote</td>\n                <td>> quote</td>\n                <td>Ctrl + Q</td>\n            </tr>\n            <tr>\n                <td>H1</td>\n                <td># Heading</td>\n                <td>Ctrl + Alt + 1</td>\n            </tr>\n            <tr>\n                <td>H2</td>\n                <td>## Heading</td>\n                <td>Ctrl + Alt + 2</td>\n            </tr>\n            <tr>\n                <td>H3</td>\n                <td>### Heading</td>\n                <td>Ctrl + Alt + 3</td>\n            </tr>\n            </tbody>\n        </table>\n        For further Markdown syntax reference: <a href=\"http://daringfireball.net/projects/markdown/syntax\" target=\"_blank\">Markdown Documentation</a>\n    </section>\n");
  }

  stack1 = (helper = helpers['gh-modal-dialog'] || (depth0 && depth0['gh-modal-dialog']),options={hash:{
    'action': ("closeModal"),
    'showClose': (true),
    'style': ("wide"),
    'animation': ("fade"),
    'title': ("Markdown Help")
  },hashTypes:{'action': "STRING",'showClose': "BOOLEAN",'style': "STRING",'animation': "STRING",'title': "STRING"},hashContexts:{'action': depth0,'showClose': depth0,'style': depth0,'animation': depth0,'title': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-modal-dialog", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
}); });

define('ghost/templates/modals/transfer-owner', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("\n\n    <p>Are you sure you want to transfer the ownership of this blog? You will not be able to undo this action.</p>\n\n");
  }

  stack1 = (helper = helpers['gh-modal-dialog'] || (depth0 && depth0['gh-modal-dialog']),options={hash:{
    'action': ("closeModal"),
    'showClose': (true),
    'type': ("action"),
    'style': ("wide,centered"),
    'animation': ("fade"),
    'title': ("Transfer Ownership"),
    'confirm': ("confirm")
  },hashTypes:{'action': "STRING",'showClose': "BOOLEAN",'type': "STRING",'style': "STRING",'animation': "STRING",'title': "STRING",'confirm': "ID"},hashContexts:{'action': depth0,'showClose': depth0,'type': depth0,'style': depth0,'animation': depth0,'title': depth0,'confirm': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-modal-dialog", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
}); });

define('ghost/templates/modals/upload', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n  <section class=\"js-drop-zone\">\n      <img class=\"js-upload-target\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("src")
  },hashTypes:{'src': "ID"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" alt=\"logo\">\n      <input data-url=\"upload\" class=\"js-fileupload main\" type=\"file\" name=\"uploadimage\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'accept': ("acceptEncoding")
  },hashTypes:{'accept': "ID"},hashContexts:{'accept': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" >\n  </section>\n\n");
  return buffer;
  }

  stack1 = (helper = helpers['gh-upload-modal'] || (depth0 && depth0['gh-upload-modal']),options={hash:{
    'action': ("closeModal"),
    'close': (true),
    'type': ("action"),
    'style': ("wide"),
    'model': ("model"),
    'imageType': ("imageType"),
    'animation': ("fade")
  },hashTypes:{'action': "STRING",'close': "BOOLEAN",'type': "STRING",'style': "STRING",'model': "ID",'imageType': "ID",'animation': "STRING"},hashContexts:{'action': depth0,'close': depth0,'type': depth0,'style': depth0,'model': depth0,'imageType': depth0,'animation': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-upload-modal", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
}); });

define('ghost/templates/post-settings-menu', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<form>\n	<table class=\"plain\">\n		<tbody>\n			<tr class=\"post-setting\">\n				<td class=\"post-setting-label\">\n					<label for=\"url\">URL</label>\n				</td>\n				<td class=\"post-setting-field\">\n					");
  data.buffer.push(escapeExpression((helper = helpers['gh-blur-input'] || (depth0 && depth0['gh-blur-input']),options={hash:{
    'class': ("post-setting-slug"),
    'id': ("url"),
    'value': ("slugValue"),
    'name': ("post-setting-slug"),
    'action': ("updateSlug"),
    'placeholder': ("slugPlaceholder"),
    'selectOnClick': ("true"),
    'stopEnterKeyDownPropagation': ("true")
  },hashTypes:{'class': "STRING",'id': "STRING",'value': "ID",'name': "STRING",'action': "STRING",'placeholder': "ID",'selectOnClick': "STRING",'stopEnterKeyDownPropagation': "STRING"},hashContexts:{'class': depth0,'id': depth0,'value': depth0,'name': depth0,'action': depth0,'placeholder': depth0,'selectOnClick': depth0,'stopEnterKeyDownPropagation': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-blur-input", options))));
  data.buffer.push("\n				</td>\n			</tr>\n			<tr class=\"post-setting\">\n				<td class=\"post-setting-label\">\n					<label for=\"pub-date\">Pub Date</label>\n				</td>\n				<td class=\"post-setting-field\">\n					");
  data.buffer.push(escapeExpression((helper = helpers['gh-blur-input'] || (depth0 && depth0['gh-blur-input']),options={hash:{
    'class': ("post-setting-date"),
    'value': ("publishedAtValue"),
    'name': ("post-setting-date"),
    'action': ("setPublishedAt"),
    'placeholder': ("publishedAtPlaceholder"),
    'stopEnterKeyDownPropagation': ("true")
  },hashTypes:{'class': "STRING",'value': "ID",'name': "STRING",'action': "STRING",'placeholder': "ID",'stopEnterKeyDownPropagation': "STRING"},hashContexts:{'class': depth0,'value': depth0,'name': depth0,'action': depth0,'placeholder': depth0,'stopEnterKeyDownPropagation': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-blur-input", options))));
  data.buffer.push("\n				</td>\n			</tr>\n			<tr class=\"post-setting\">\n				<td class=\"post-setting-label\">\n			<label for=\"post-setting-author\">Author</label>\n		</td>\n		<td class=\"post-setting-field\">\n			<span class=\"gh-select\">\n				");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'name': ("post-setting-author"),
    'content': ("authors"),
    'optionValuePath': ("content.id"),
    'optionLabelPath': ("content.name"),
    'selection': ("selectedAuthor")
  },hashTypes:{'name': "STRING",'content': "ID",'optionValuePath': "STRING",'optionLabelPath': "STRING",'selection': "ID"},hashContexts:{'name': depth0,'content': depth0,'optionValuePath': depth0,'optionLabelPath': depth0,'selection': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n			</span>\n		</td>\n		</tr>\n		<tr class=\"post-setting\">\n		<td class=\"post-setting-label\">\n					<label class=\"label\" for=\"static-page\">Static Page</label>\n				</td>\n				<td class=\"post-setting-item\">\n					");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("checkbox"),
    'name': ("static-page"),
    'id': ("static-page"),
    'class': ("post-setting-static-page"),
    'checked': ("page")
  },hashTypes:{'type': "STRING",'name': "STRING",'id': "STRING",'class': "STRING",'checked': "ID"},hashContexts:{'type': depth0,'name': depth0,'id': depth0,'class': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n					<label class=\"checkbox\" for=\"static-page\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "togglePage", {hash:{
    'bubbles': ("false")
  },hashTypes:{'bubbles': "STRING"},hashContexts:{'bubbles': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("></label>\n				</td>\n			</tr>\n		</tbody>\n	</table>\n</form>\n<button type=\"button\" class=\"delete\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openModal", "delete-post", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","STRING","ID"],data:data})));
  data.buffer.push(">Delete This Post</button>\n");
  return buffer;
  
}); });

define('ghost/templates/post-tags-input', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    ");
  stack1 = helpers.view.call(depth0, "view.tagView", {hash:{
    'tag': ("")
  },hashTypes:{'tag': "ID"},hashContexts:{'tag': depth0},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        ");
  stack1 = helpers._triageMustache.call(depth0, "view.tag.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    ");
  stack1 = helpers.view.call(depth0, "view.suggestionView", {hash:{
    'suggestion': ("")
  },hashTypes:{'suggestion': "ID"},hashContexts:{'suggestion': depth0},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  ");
  return buffer;
  }
function program5(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <a href=\"javascript:void(0);\">");
  stack1 = helpers._triageMustache.call(depth0, "view.suggestion.highlightedName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</a>\n    ");
  return buffer;
  }

  data.buffer.push("<label class=\"tag-label\" for=\"tags\" title=\"Tags\"><span class=\"hidden\">Tags</span></label>\n<div class=\"tags\">\n");
  stack1 = helpers.each.call(depth0, "controller.tags", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n<input type=\"hidden\" class=\"tags-holder\" id=\"tags-holder\">\n");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.tagInputView", {hash:{
    'class': ("tag-input"),
    'id': ("tags"),
    'value': ("newTagText")
  },hashTypes:{'class': "STRING",'id': "STRING",'value': "ID"},hashContexts:{'class': depth0,'id': depth0,'value': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n<ul class=\"suggestions overlay\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'style': ("view.overlayStyles")
  },hashTypes:{'style': "ID"},hashContexts:{'style': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n  ");
  stack1 = helpers.each.call(depth0, "suggestions", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</ul>\n");
  return buffer;
  
}); });

define('ghost/templates/posts', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("<span class=\"hidden\">New Post</span>");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <ol class=\"posts-list\">\n        ");
  stack1 = helpers.each.call(depth0, {hash:{
    'itemController': ("posts/post"),
    'itemView': ("post-item-view"),
    'itemTagName': ("li")
  },hashTypes:{'itemController': "STRING",'itemView': "STRING",'itemTagName': "STRING"},hashContexts:{'itemController': depth0,'itemView': depth0,'itemTagName': depth0},inverse:self.noop,fn:self.program(4, program4, data),contexts:[],types:[],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </ol>\n    ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n        ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'class': ("permalink"),
    'title': ("Edit this post")
  },hashTypes:{'class': "STRING",'title': "STRING"},hashContexts:{'class': depth0,'title': depth0},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "posts.post", "", options) : helperMissing.call(depth0, "link-to", "posts.post", "", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program5(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <h3 class=\"entry-title\">");
  stack1 = helpers._triageMustache.call(depth0, "title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h3>\n        <section class=\"entry-meta\">\n            <span class=\"status\">\n                ");
  stack1 = helpers['if'].call(depth0, "isPublished", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(11, program11, data),fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </span>\n        </section>\n        ");
  return buffer;
  }
function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                ");
  stack1 = helpers['if'].call(depth0, "page", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  return buffer;
  }
function program7(depth0,data) {
  
  
  data.buffer.push("\n                <span class=\"page\">Page</span>\n                ");
  }

function program9(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n                <time datetime=\"");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "published_at", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\" class=\"date published\">\n                    Published ");
  data.buffer.push(escapeExpression((helper = helpers['gh-format-timeago'] || (depth0 && depth0['gh-format-timeago']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "published_at", options) : helperMissing.call(depth0, "gh-format-timeago", "published_at", options))));
  data.buffer.push("\n                </time>\n                ");
  return buffer;
  }

function program11(depth0,data) {
  
  
  data.buffer.push("\n                <span class=\"draft\">Draft</span>\n                ");
  }

  data.buffer.push("<section class=\"content-list js-content-list\">\n    <header class=\"floatingheader\">\n        <section class=\"content-filter\">\n            <small>All Posts</small>\n        </section>\n        ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'class': ("button button-add"),
    'title': ("New Post")
  },hashTypes:{'class': "STRING",'title': "STRING"},hashContexts:{'class': depth0,'title': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "editor.new", options) : helperMissing.call(depth0, "link-to", "editor.new", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </header>\n    ");
  stack1 = helpers.view.call(depth0, "content-list-content-view", {hash:{
    'tagName': ("section")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["STRING"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</section>\n<section class=\"content-preview js-content-preview\">\n    ");
  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</section>\n");
  return buffer;
  
}); });

define('ghost/templates/posts/index', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("<button type=\"button\" class=\"button-add large\" title=\"New Post\">Write a new Post</button>");
  }

  data.buffer.push("<div class=\"no-posts-box\">\n    <div class=\"no-posts\">\n        <h3>You Haven't Written Any Posts Yet!</h3>\n        ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "editor.new", options) : helperMissing.call(depth0, "link-to", "editor.new", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n</div>\n");
  return buffer;
  
}); });

define('ghost/templates/posts/post', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n    <div class=\"wrapper\">\n        <h1>");
  stack1 = helpers._triageMustache.call(depth0, "title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</h1>\n        ");
  data.buffer.push(escapeExpression((helper = helpers['gh-format-html'] || (depth0 && depth0['gh-format-html']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "html", options) : helperMissing.call(depth0, "gh-format-html", "html", options))));
  data.buffer.push("\n    </div>\n");
  return buffer;
  }

  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "floating-header", options) : helperMissing.call(depth0, "partial", "floating-header", options))));
  data.buffer.push("\n\n");
  stack1 = helpers.view.call(depth0, "content-preview-content-view", {hash:{
    'tagName': ("section")
  },hashTypes:{'tagName': "STRING"},hashContexts:{'tagName': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
}); });

define('ghost/templates/reset', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  data.buffer.push("<section class=\"reset-box js-reset-box fade-in\">\n    <form id=\"reset\" class=\"reset-form\" method=\"post\" novalidate=\"novalidate\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "submit", {hash:{
    'on': ("submit")
  },hashTypes:{'on': "STRING"},hashContexts:{'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n        <div class=\"password-wrap\">\n            ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("passwords.newPassword"),
    'class': ("password"),
    'type': ("password"),
    'placeholder': ("Password"),
    'name': ("newpassword"),
    'autofocus': ("autofocus")
  },hashTypes:{'value': "ID",'class': "STRING",'type': "STRING",'placeholder': "STRING",'name': "STRING",'autofocus': "STRING"},hashContexts:{'value': depth0,'class': depth0,'type': depth0,'placeholder': depth0,'name': depth0,'autofocus': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n        </div>\n        <div class=\"password-wrap\">\n            ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("passwords.ne2Password"),
    'class': ("password"),
    'type': ("password"),
    'placeholder': ("Confirm Password"),
    'name': ("ne2password")
  },hashTypes:{'value': "ID",'class': "STRING",'type': "STRING",'placeholder': "STRING",'name': "STRING"},hashContexts:{'value': depth0,'class': depth0,'type': depth0,'placeholder': depth0,'name': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n        </div>\n        <button class=\"button-save\" type=\"submit\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'disabled': ("submitButtonDisabled")
  },hashTypes:{'disabled': "STRING"},hashContexts:{'disabled': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">Reset Password</button>\n    </form>\n</section>\n");
  return buffer;
  
}); });

define('ghost/templates/settings', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n                ");
  stack1 = helpers.unless.call(depth0, "session.user.isEditor", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n                ");
  data.buffer.push(escapeExpression((helper = helpers['gh-activating-list-item'] || (depth0 && depth0['gh-activating-list-item']),options={hash:{
    'route': ("settings.users"),
    'title': ("Users"),
    'classNames': ("users")
  },hashTypes:{'route': "STRING",'title': "STRING",'classNames': "STRING"},hashContexts:{'route': depth0,'title': depth0,'classNames': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-activating-list-item", options))));
  data.buffer.push("\n\n            ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n                    ");
  data.buffer.push(escapeExpression((helper = helpers['gh-activating-list-item'] || (depth0 && depth0['gh-activating-list-item']),options={hash:{
    'route': ("settings.general"),
    'title': ("General"),
    'classNames': ("general")
  },hashTypes:{'route': "STRING",'title': "STRING",'classNames': "STRING"},hashContexts:{'route': depth0,'title': depth0,'classNames': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-activating-list-item", options))));
  data.buffer.push("\n                ");
  return buffer;
  }

  data.buffer.push("<aside class=\"settings-sidebar\" role=\"complementary\">\n    <header>\n        <h1 class=\"title\">Settings</h1>\n    </header>\n    <nav class=\"settings-menu\">\n        <ul>\n            ");
  stack1 = helpers.unless.call(depth0, "session.user.isAuthor", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n    </nav>\n</aside>\n\n");
  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
}); });

define('ghost/templates/settings/apps', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, self=this, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("Back");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <tr>\n            <td>\n                ");
  stack1 = helpers['if'].call(depth0, "package", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </td>\n            <td>\n                <button type=\"button\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleApp", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["ID","ID"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":js-button-active activeClass:button-delete inactiveClass:button-add activeClass:js-button-deactivate")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                    ");
  stack1 = helpers._triageMustache.call(depth0, "buttonText", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </button>\n            </td>\n        </tr>\n        ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1;
  stack1 = helpers._triageMustache.call(depth0, "package.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" - ");
  stack1 = helpers._triageMustache.call(depth0, "package.version", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', stack1;
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" - package.json missing :(");
  return buffer;
  }

  data.buffer.push("<header class=\"settings-content-header\">\n    ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'class': ("button-back button")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "settings", options) : helperMissing.call(depth0, "link-to", "settings", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <h2 class=\"title\">Apps</h2>\n</header>\n\n<section class=\"content settings-apps\">\n    <table class=\"js-apps\">\n        <thead>\n            <th>App name</th>\n            <th>Status</th>\n        </thead>\n        <tbody>\n        ");
  stack1 = helpers.each.call(depth0, {hash:{
    'itemController': ("settings/app")
  },hashTypes:{'itemController': "STRING"},hashContexts:{'itemController': depth0},inverse:self.noop,fn:self.program(3, program3, data),contexts:[],types:[],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </tbody>\n    </table>\n</section>\n");
  return buffer;
  
}); });

define('ghost/templates/settings/general', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("Back");
  }

function program3(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                    <button type=\"button\" class=\"js-modal-logo\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openModal", "upload", "", "logo", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0,depth0],types:["STRING","STRING","ID","STRING"],data:data})));
  data.buffer.push("><img id=\"blog-logo\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("logo")
  },hashTypes:{'src': "ID"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" alt=\"logo\"></button>\n                ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                    <button type=\"button\" class=\"button-add js-modal-logo\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openModal", "upload", "", "logo", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0,depth0],types:["STRING","STRING","ID","STRING"],data:data})));
  data.buffer.push(">Upload Image</button>\n                ");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                    <button type=\"button\" class=\"js-modal-cover\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openModal", "upload", "", "cover", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0,depth0],types:["STRING","STRING","ID","STRING"],data:data})));
  data.buffer.push("><img id=\"blog-cover\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("cover")
  },hashTypes:{'src': "ID"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" alt=\"cover photo\"></button>\n                ");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                    <button type=\"button\" class=\"button-add js-modal-cover\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openModal", "upload", "", "cover", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0,depth0],types:["STRING","STRING","ID","STRING"],data:data})));
  data.buffer.push(">Upload Image</button>\n                ");
  return buffer;
  }

  data.buffer.push("<header class=\"settings-content-header\">\n    <h2 class=\"title\">General</h2>\n\n    <div class=\"settings-header-inner\">\n	");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'class': ("button-back button")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "settings", options) : helperMissing.call(depth0, "link-to", "settings", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <section class=\"page-actions\">\n            <button type=\"button\" class=\"button-save\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "save", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Save</button>\n        </section>\n    </div>\n</header>\n\n<section class=\"content settings-general\">\n    <form id=\"settings-general\" novalidate=\"novalidate\">\n        <fieldset>\n\n            <div class=\"form-group\">\n                <label for=\"blog-title\">Blog Title</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'id': ("blog-title"),
    'name': ("general[title]"),
    'type': ("text"),
    'value': ("title")
  },hashTypes:{'id': "STRING",'name': "STRING",'type': "STRING",'value': "ID"},hashContexts:{'id': depth0,'name': depth0,'type': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n                <p>The name of your blog</p>\n            </div>\n\n            <div class=\"form-group description-container\">\n                <label for=\"blog-description\">Blog Description</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.textarea || (depth0 && depth0.textarea),options={hash:{
    'id': ("blog-description"),
    'name': ("general[description]"),
    'value': ("description")
  },hashTypes:{'id': "STRING",'name': "STRING",'value': "ID"},hashContexts:{'id': depth0,'name': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "textarea", options))));
  data.buffer.push("\n                <p>\n                    Describe what your blog is about\n                    ");
  data.buffer.push(escapeExpression((helper = helpers['gh-count-characters'] || (depth0 && depth0['gh-count-characters']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "description", options) : helperMissing.call(depth0, "gh-count-characters", "description", options))));
  data.buffer.push("\n                </p>\n\n            </div>\n        </fieldset>\n            <div class=\"form-group\">\n                <label for=\"blog-logo\">Blog Logo</label>\n                ");
  stack1 = helpers['if'].call(depth0, "logo", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                <p>Display a sexy logo for your publication</p>\n            </div>\n\n            <div class=\"form-group\">\n                <label for=\"blog-cover\">Blog Cover</label>\n                ");
  stack1 = helpers['if'].call(depth0, "cover", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                <p>Display a cover image on your site</p>\n            </div>\n        <fieldset>\n            <div class=\"form-group\">\n                <label for=\"email-address\">Email Address</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'id': ("email-address"),
    'name': ("general[email-address]"),
    'type': ("email"),
    'value': ("email"),
    'autocapitalize': ("off"),
    'autocorrect': ("off")
  },hashTypes:{'id': "STRING",'name': "STRING",'type': "STRING",'value': "ID",'autocapitalize': "STRING",'autocorrect': "STRING"},hashContexts:{'id': depth0,'name': depth0,'type': depth0,'value': depth0,'autocapitalize': depth0,'autocorrect': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n                <p>Address to use for admin notifications</p>\n            </div>\n\n            <div class=\"form-group\">\n                <label for=\"postsPerPage\">Posts per page</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'id': ("postsPerPage"),
    'name': ("general[postsPerPage]"),
    'type': ("number"),
    'value': ("postsPerPage")
  },hashTypes:{'id': "STRING",'name': "STRING",'type': "STRING",'value': "ID"},hashContexts:{'id': depth0,'name': depth0,'type': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n                <p>How many posts should be displayed on each page</p>\n            </div>\n\n            <div class=\"form-group for-checkbox\">\n                <label for=\"permalinks\">Dated Permalinks</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'id': ("permalinks"),
    'name': ("general[permalinks]"),
    'type': ("checkbox"),
    'checked': ("isDatedPermalinks")
  },hashTypes:{'id': "STRING",'name': "STRING",'type': "STRING",'checked': "ID"},hashContexts:{'id': depth0,'name': depth0,'type': depth0,'checked': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n                <label class=\"checkbox\" for=\"permalinks\"></label>\n                <p>Include the date in your post URLs</p>\n            </div>\n\n            <div class=\"form-group for-select\">\n                <label for=\"activeTheme\">Theme</label>\n                <span class=\"gh-select\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'data-select-text': ("selectedTheme.label")
  },hashTypes:{'data-select-text': "ID"},hashContexts:{'data-select-text': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                   ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.Select", {hash:{
    'id': ("activeTheme"),
    'name': ("general[activeTheme]"),
    'content': ("themes"),
    'optionValuePath': ("content.name"),
    'optionLabelPath': ("content.label"),
    'value': ("activeTheme"),
    'selection': ("selectedTheme")
  },hashTypes:{'id': "STRING",'name': "STRING",'content': "ID",'optionValuePath': "STRING",'optionLabelPath': "STRING",'value': "ID",'selection': "ID"},hashContexts:{'id': depth0,'name': depth0,'content': depth0,'optionValuePath': depth0,'optionLabelPath': depth0,'value': depth0,'selection': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n               </span>\n                <p>Select a theme for your blog</p>\n            </div>\n\n        </fieldset>\n    </form>\n</section>\n");
  return buffer;
  
}); });

define('ghost/templates/settings/users', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1;


  data.buffer.push("\n");
  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
}); });

define('ghost/templates/settings/users/index', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, self=this, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("Back");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    ");
  stack1 = helpers['if'].call(depth0, "invitedUsers", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n    <section class=\"object-list active-users\">\n\n        <h4 class=\"object-list-title\">Active users</h4>\n\n        ");
  stack1 = helpers.each.call(depth0, "activeUsers", {hash:{
    'itemController': ("settings/users/user")
  },hashTypes:{'itemController': "STRING"},hashContexts:{'itemController': depth0},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n    </section>\n");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n\n        <section class=\"object-list invited-users\">\n\n            <h4 class=\"object-list-title\">Invited users</h4>\n\n            ");
  stack1 = helpers.each.call(depth0, "invitedUsers", {hash:{
    'itemController': ("settings/users/user")
  },hashTypes:{'itemController': "STRING"},hashContexts:{'itemController': depth0},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        </section>\n\n    ");
  return buffer;
  }
function program5(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                <div class=\"object-list-item\">\n                    <span class=\"object-list-item-icon icon-mail\">ic</span>\n\n                    <div class=\"object-list-item-body\">\n                        <span class=\"name\">");
  stack1 = helpers._triageMustache.call(depth0, "email", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span><br>\n                            ");
  stack1 = helpers['if'].call(depth0, "pending", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(8, program8, data),fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </div>\n                    <aside class=\"object-list-item-aside\">\n                        <a class=\"object-list-action\" href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "revoke", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Revoke</a>\n                        <a class=\"object-list-action\" href=\"#\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "resend", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Resend</a>\n                    </aside>\n                </div>\n            ");
  return buffer;
  }
function program6(depth0,data) {
  
  
  data.buffer.push("\n                                <span class=\"red\">Invitation not sent - please try again</span>\n                            ");
  }

function program8(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                                <span class=\"description\">Invitation sent: ");
  stack1 = helpers._triageMustache.call(depth0, "created_at", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n                            ");
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n            ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'class': ("object-list-item")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "settings.users.user", "", options) : helperMissing.call(depth0, "link-to", "settings.users.user", "", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program11(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                <span class=\"object-list-item-figure\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'style': ("image")
  },hashTypes:{'style': "ID"},hashContexts:{'style': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                    <span class=\"hidden\">Photo of ");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</span>\n                </span>\n\n                <div class=\"object-list-item-body\">\n                    <span class=\"name\">\n                        ");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    </span>\n                    <br>\n                    <span class=\"description\">Last seen: ");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "last_login", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("</span>\n                </div>\n                <aside class=\"object-list-item-aside\">\n                    ");
  stack1 = helpers.unless.call(depth0, "isAuthor", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </aside>\n            ");
  return buffer;
  }
function program12(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                        ");
  stack1 = helpers.each.call(depth0, "roles", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(13, program13, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    ");
  return buffer;
  }
function program13(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                            <span class=\"role-label ");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "lowerCaseName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\">");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n                        ");
  return buffer;
  }

  data.buffer.push("<header class=\"settings-content-header\">\n    ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'class': ("button-back button")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "settings", options) : helperMissing.call(depth0, "link-to", "settings", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <h2 class=\"title\">Users</h2>\n    <section class=\"page-actions\">\n        <button class=\"button-add\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openModal", "invite-new-user", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(" >New&nbsp;User</button>\n    </section>\n</header>\n\n");
  stack1 = helpers.view.call(depth0, "settings/users/users-list-view", {hash:{
    'tagName': ("section"),
    'class': ("content settings-users")
  },hashTypes:{'tagName': "STRING",'class': "STRING"},hashContexts:{'tagName': depth0,'class': depth0},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["STRING"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
}); });

define('ghost/templates/settings/users/user', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  data.buffer.push("Back");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n                ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'class': ("button has-icon users-back"),
    'tagName': ("button")
  },hashTypes:{'class': "STRING",'tagName': "STRING"},hashContexts:{'class': depth0,'tagName': depth0},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "settings.users", options) : helperMissing.call(depth0, "link-to", "settings.users", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  return buffer;
  }
function program4(depth0,data) {
  
  
  data.buffer.push("<i class=\"icon-chevron-left\"></i>Users");
  }

function program6(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n                ");
  stack1 = (helper = helpers['gh-popover-button'] || (depth0 && depth0['gh-popover-button']),options={hash:{
    'popoverName': ("user-actions-menu"),
    'classNames': ("button only-has-icon user-actions-cog"),
    'title': ("User Actions")
  },hashTypes:{'popoverName': "STRING",'classNames': "STRING",'title': "STRING"},hashContexts:{'popoverName': depth0,'classNames': depth0,'title': depth0},inverse:self.noop,fn:self.program(7, program7, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-popover-button", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  stack1 = (helper = helpers['gh-popover'] || (depth0 && depth0['gh-popover']),options={hash:{
    'name': ("user-actions-menu"),
    'classNames': ("user-actions-menu menu-drop-right")
  },hashTypes:{'name': "STRING",'classNames': "STRING"},hashContexts:{'name': depth0,'classNames': depth0},inverse:self.noop,fn:self.program(9, program9, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-popover", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  return buffer;
  }
function program7(depth0,data) {
  
  
  data.buffer.push("\n                    <i class=\"icon-settings\"></i>\n                    <span class=\"hidden\">User Settings</span>\n                ");
  }

function program9(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n                    ");
  data.buffer.push(escapeExpression((helper = helpers.render || (depth0 && depth0.render),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "user-actions-menu", "model", options) : helperMissing.call(depth0, "render", "user-actions-menu", "model", options))));
  data.buffer.push("\n                ");
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n            <div class=\"form-group\">\n                <label for=\"user-role\">Role</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers['gh-role-selector'] || (depth0 && depth0['gh-role-selector']),options={hash:{
    'initialValue': ("role"),
    'onChange': ("changeRole"),
    'selectId': ("user-role")
  },hashTypes:{'initialValue': "ID",'onChange': "STRING",'selectId': "STRING"},hashContexts:{'initialValue': depth0,'onChange': depth0,'selectId': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-role-selector", options))));
  data.buffer.push("\n                <p>What permissions should this user have?</p>\n            </div>\n            ");
  return buffer;
  }

  data.buffer.push("<header class=\"settings-content-header user-settings-header\">\n\n    <h2 class=\"hidden\">Your Profile</h2>\n\n    <div class=\"settings-header-inner\">\n        ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'class': ("button-back button")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "settings", options) : helperMissing.call(depth0, "link-to", "settings", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        <section class=\"page-actions page-actions-alt\">\n            ");
  stack1 = helpers.unless.call(depth0, "session.user.isAuthor", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </section>\n\n        <section class=\"page-actions\">\n\n            ");
  stack1 = helpers['if'].call(depth0, "view.userActionsAreVisible", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n            <button class=\"button-save\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "save", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Save</button>\n        </section>\n    </div>\n\n</header>\n\n<section class=\"content settings-user no-padding\">\n\n    <header class=\"user-profile-header\">\n        <img id=\"user-cover\" class=\"cover-image\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("cover"),
    'title': ("coverTitle")
  },hashTypes:{'src': "ID",'title': "ID"},hashContexts:{'src': depth0,'title': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" />\n        <button type=\"button\" class=\"edit-cover-image js-modal-cover button\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openModal", "upload", "user", "cover", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0,depth0],types:["STRING","STRING","ID","STRING"],data:data})));
  data.buffer.push(">Change Cover</button>\n    </header>\n\n    <form class=\"user-profile\" novalidate=\"novalidate\" autocomplete=\"off\">\n\n        \n        <input style=\"display:none;\" type=\"text\" name=\"fakeusernameremembered\"/>\n        <input style=\"display:none;\" type=\"password\" name=\"fakepasswordremembered\"/>\n\n        <fieldset class=\"user-details-top\">\n\n            <figure class=\"user-image\">\n                <div id=\"user-image\" class=\"img\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'style': ("image")
  },hashTypes:{'style': "ID"},hashContexts:{'style': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" href=\"#\"><span class=\"hidden\">");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\"s Picture</span></div>\n                <button type=\"button\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openModal", "upload", "user", "image", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0,depth0],types:["STRING","STRING","ID","STRING"],data:data})));
  data.buffer.push(" class=\"edit-user-image js-modal-image\">Edit Picture</button>\n            </figure>\n\n            <div class=\"form-group\">\n                <label for=\"user-name\">Full Name</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("user.name"),
    'id': ("user-name"),
    'class': ("user-name"),
    'placeholder': ("Full Name"),
    'autocorrect': ("off")
  },hashTypes:{'value': "ID",'id': "STRING",'class': "STRING",'placeholder': "STRING",'autocorrect': "STRING"},hashContexts:{'value': depth0,'id': depth0,'class': depth0,'placeholder': depth0,'autocorrect': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n                <p>Use your real name so people can recognise you</p>\n            </div>\n\n        </fieldset>\n\n        <fieldset class=\"user-details-bottom\">\n\n            <div class=\"form-group\">\n                <label for=\"user-slug\">Slug</label>\n                \n                ");
  data.buffer.push(escapeExpression((helper = helpers['gh-blur-input'] || (depth0 && depth0['gh-blur-input']),options={hash:{
    'class': ("user-name"),
    'id': ("user-slug"),
    'value': ("user.slug"),
    'name': ("user"),
    'action': ("updateSlug"),
    'placeholder': ("Slug"),
    'selectOnClick': ("true"),
    'autocorrect': ("off")
  },hashTypes:{'class': "STRING",'id': "STRING",'value': "ID",'name': "STRING",'action': "STRING",'placeholder': "STRING",'selectOnClick': "STRING",'autocorrect': "STRING"},hashContexts:{'class': depth0,'id': depth0,'value': depth0,'name': depth0,'action': depth0,'placeholder': depth0,'selectOnClick': depth0,'autocorrect': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-blur-input", options))));
  data.buffer.push("\n                <p>");
  stack1 = helpers._triageMustache.call(depth0, "gh-blog-url", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("/author/");
  stack1 = helpers._triageMustache.call(depth0, "user.slug", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</p>\n            </div>\n\n            <div class=\"form-group\">\n                <label for=\"user-email\">Email</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("email"),
    'value': ("user.email"),
    'id': ("user-email"),
    'placeholder': ("Email Address"),
    'autocapitalize': ("off"),
    'autocorrect': ("off"),
    'autocomplete': ("off")
  },hashTypes:{'type': "STRING",'value': "ID",'id': "STRING",'placeholder': "STRING",'autocapitalize': "STRING",'autocorrect': "STRING",'autocomplete': "STRING"},hashContexts:{'type': depth0,'value': depth0,'id': depth0,'placeholder': depth0,'autocapitalize': depth0,'autocorrect': depth0,'autocomplete': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n                <p>Used for notifications</p>\n            </div>\n            ");
  stack1 = helpers['if'].call(depth0, "view.rolesDropdownIsVisible", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            <div class=\"form-group\">\n                <label for=\"user-location\">Location</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'value': ("user.location"),
    'id': ("user-location")
  },hashTypes:{'type': "STRING",'value': "ID",'id': "STRING"},hashContexts:{'type': depth0,'value': depth0,'id': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n                <p>Where in the world do you live?</p>\n            </div>\n\n            <div class=\"form-group\">\n                <label for=\"user-website\">Website</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("url"),
    'value': ("user.website"),
    'id': ("user-website"),
    'autocapitalize': ("off"),
    'autocorrect': ("off"),
    'autocomplete': ("off")
  },hashTypes:{'type': "STRING",'value': "ID",'id': "STRING",'autocapitalize': "STRING",'autocorrect': "STRING",'autocomplete': "STRING"},hashContexts:{'type': depth0,'value': depth0,'id': depth0,'autocapitalize': depth0,'autocorrect': depth0,'autocomplete': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n                <p>Have a website or blog other than this one? Link it!</p>\n            </div>\n\n            <div class=\"form-group bio-container\">\n                <label for=\"user-bio\">Bio</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.textarea || (depth0 && depth0.textarea),options={hash:{
    'id': ("user-bio"),
    'value': ("user.bio")
  },hashTypes:{'id': "STRING",'value': "ID"},hashContexts:{'id': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "textarea", options))));
  data.buffer.push("\n                <p>\n                    Write about you, in 200 characters or less.\n                    ");
  data.buffer.push(escapeExpression((helper = helpers['gh-count-characters'] || (depth0 && depth0['gh-count-characters']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "user.bio", options) : helperMissing.call(depth0, "gh-count-characters", "user.bio", options))));
  data.buffer.push("\n                </p>\n            </div>\n\n            <hr />\n\n        </fieldset>\n\n        <fieldset>\n\n            <div class=\"form-group\">\n                <label for=\"user-password-old\">Old Password</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("user.password"),
    'type': ("password"),
    'id': ("user-password-old")
  },hashTypes:{'value': "ID",'type': "STRING",'id': "STRING"},hashContexts:{'value': depth0,'type': depth0,'id': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n            </div>\n\n            <div class=\"form-group\">\n                <label for=\"user-password-new\">New Password</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("user.newPassword"),
    'type': ("password"),
    'id': ("user-password-new")
  },hashTypes:{'value': "ID",'type': "STRING",'id': "STRING"},hashContexts:{'value': depth0,'type': depth0,'id': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n            </div>\n\n            <div class=\"form-group\">\n                <label for=\"user-new-password-verification\">Verify Password</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("user.ne2Password"),
    'type': ("password"),
    'id': ("user-new-password-verification")
  },hashTypes:{'value': "ID",'type': "STRING",'id': "STRING"},hashContexts:{'value': depth0,'type': depth0,'id': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n            </div>\n            <div class=\"form-group\">\n                <button type=\"button\" class=\"button-delete button-change-password\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "password", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Change Password</button>\n            </div>\n\n        </fieldset>\n\n    </form>\n</section>\n");
  return buffer;
  
}); });

define('ghost/templates/setup', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<section class=\"setup-box js-setup-box fade-in\">\n    <div class=\"vertical\">\n        <form id=\"setup\" class=\"setup-form\" method=\"post\" novalidate=\"novalidate\">\n\n            \n            <input style=\"display:none;\" type=\"text\" name=\"fakeusernameremembered\"/>\n            <input style=\"display:none;\" type=\"password\" name=\"fakepasswordremembered\"/>\n\n            <header>\n                <h1>Welcome to your new Ghost blog</h1>\n                <h2>Let's get a few things set up so you can get started.</h2>\n            </header>\n            <div class=\"form-group\">\n                <label for=\"blog-title\">Blog Title</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'name': ("blog-title"),
    'autofocus': ("autofocus"),
    'autocorrect': ("off"),
    'value': ("blogTitle")
  },hashTypes:{'type': "STRING",'name': "STRING",'autofocus': "STRING",'autocorrect': "STRING",'value': "ID"},hashContexts:{'type': depth0,'name': depth0,'autofocus': depth0,'autocorrect': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n                <p>What would you like to call your blog?</p>\n            </div>\n            <div class=\"form-group\">\n                <label for=\"name\">Full Name</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'name': ("name"),
    'autofocus': ("autofocus"),
    'autocorrect': ("off"),
    'value': ("name")
  },hashTypes:{'type': "STRING",'name': "STRING",'autofocus': "STRING",'autocorrect': "STRING",'value': "ID"},hashContexts:{'type': depth0,'name': depth0,'autofocus': depth0,'autocorrect': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n                <p>The name that you will sign your posts with</p>\n            </div>\n            <div class=\"form-group\">\n                <label for=\"email\">Email Address</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("email"),
    'name': ("email"),
    'autofocus': ("autofocus"),
    'autocorrect': ("off"),
    'value': ("email")
  },hashTypes:{'type': "STRING",'name': "STRING",'autofocus': "STRING",'autocorrect': "STRING",'value': "ID"},hashContexts:{'type': depth0,'name': depth0,'autofocus': depth0,'autocorrect': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n                <p>Used for important notifications</p>\n            </div>\n            <div class=\"form-group\">\n                <label for=\"password\">Password</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("password"),
    'name': ("password"),
    'autofocus': ("autofocus"),
    'autocorrect': ("off"),
    'value': ("password")
  },hashTypes:{'type': "STRING",'name': "STRING",'autofocus': "STRING",'autocorrect': "STRING",'value': "ID"},hashContexts:{'type': depth0,'name': depth0,'autofocus': depth0,'autocorrect': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n                <p>Must be at least 8 characters</p>\n            </div>\n            <footer>\n                <button type=\"submit\" class=\"button-add large\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "setup", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'disabled': ("submitting")
  },hashTypes:{'disabled': "ID"},hashContexts:{'disabled': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">Ok, Let's Do This</button>\n            </footer>\n        </form>\n    </div>\n</section>");
  return buffer;
  
}); });

define('ghost/templates/signin', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("Forgotten password?");
  }

  data.buffer.push("<section class=\"login-box js-login-box fade-in\">\n    <form id=\"login\" class=\"login-form\" method=\"post\" novalidate=\"novalidate\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "validateAndAuthenticate", {hash:{
    'on': ("submit")
  },hashTypes:{'on': "STRING"},hashContexts:{'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n        <div class=\"email-wrap\">\n            ");
  data.buffer.push(escapeExpression((helper = helpers['gh-trim-focus-input'] || (depth0 && depth0['gh-trim-focus-input']),options={hash:{
    'class': ("email"),
    'type': ("email"),
    'placeholder': ("Email Address"),
    'name': ("identification"),
    'autofocus': ("autofocus"),
    'autocapitalize': ("off"),
    'autocorrect': ("off"),
    'value': ("identification")
  },hashTypes:{'class': "STRING",'type': "STRING",'placeholder': "STRING",'name': "STRING",'autofocus': "STRING",'autocapitalize': "STRING",'autocorrect': "STRING",'value': "ID"},hashContexts:{'class': depth0,'type': depth0,'placeholder': depth0,'name': depth0,'autofocus': depth0,'autocapitalize': depth0,'autocorrect': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-trim-focus-input", options))));
  data.buffer.push("\n        </div>\n        <div class=\"password-wrap\">\n            ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'class': ("password"),
    'type': ("password"),
    'placeholder': ("Password"),
    'name': ("password"),
    'value': ("password")
  },hashTypes:{'class': "STRING",'type': "STRING",'placeholder': "STRING",'name': "STRING",'value': "ID"},hashContexts:{'class': depth0,'type': depth0,'placeholder': depth0,'name': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n        </div>\n        <button class=\"button-save\" type=\"submit\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "validateAndAuthenticate", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'disabled': ("submitting")
  },hashTypes:{'disabled': "ID"},hashContexts:{'disabled': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">Log in</button>\n        <section class=\"meta\">\n            ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
    'class': ("forgotten-password")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "forgotten", options) : helperMissing.call(depth0, "link-to", "forgotten", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </section>\n    </form>\n</section>\n");
  return buffer;
  
}); });

define('ghost/templates/signup', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<section class=\"setup-box js-signup-box fade-in\">\n    <div class=\"vertical\">\n        <form id=\"signup\" class=\"setup-form\" method=\"post\" novalidate=\"novalidate\">\n\n            \n            <input style=\"display:none;\" type=\"text\" name=\"fakeusernameremembered\"/>\n            <input style=\"display:none;\" type=\"password\" name=\"fakepasswordremembered\"/>\n\n            <header>\n                <h1>Welcome to Ghost</h1>\n                <h2>Create your account to start publishing</h2>\n            </header>\n            <div class=\"form-group\">\n                <label for=\"email\">Email Address</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("email"),
    'name': ("email"),
    'autocorrect': ("off"),
    'value': ("email")
  },hashTypes:{'type': "STRING",'name': "STRING",'autocorrect': "STRING",'value': "ID"},hashContexts:{'type': depth0,'name': depth0,'autocorrect': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n                <p>Used for important notifications</p>\n            </div>\n            <div class=\"form-group\">\n                <label for=\"name\">Full Name</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers['gh-trim-focus-input'] || (depth0 && depth0['gh-trim-focus-input']),options={hash:{
    'type': ("text"),
    'name': ("name"),
    'autofocus': ("autofocus"),
    'autocorrect': ("off"),
    'value': ("name")
  },hashTypes:{'type': "STRING",'name': "STRING",'autofocus': "STRING",'autocorrect': "STRING",'value': "ID"},hashContexts:{'type': depth0,'name': depth0,'autofocus': depth0,'autocorrect': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gh-trim-focus-input", options))));
  data.buffer.push("\n                <p>The name that you will sign your posts with</p>\n            </div>\n            <div class=\"form-group\">\n                <label for=\"password\">Password</label>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("password"),
    'name': ("password"),
    'autofocus': ("autofocus"),
    'autocorrect': ("off"),
    'value': ("password")
  },hashTypes:{'type': "STRING",'name': "STRING",'autofocus': "STRING",'autocorrect': "STRING",'value': "ID"},hashContexts:{'type': depth0,'name': depth0,'autofocus': depth0,'autocorrect': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n                <p>Must be at least 8 characters</p>\n            </div>\n            <footer>\n                <button type=\"submit\" class=\"button-add large\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "signup", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'disabled': ("submitting")
  },hashTypes:{'disabled': "ID"},hashContexts:{'disabled': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">Create Account</button>\n            </footer>\n        </form>\n    </div>\n</section>\n");
  return buffer;
  
}); });

define('ghost/templates/user-actions-menu', ['exports'], function(__exports__){ __exports__['default'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n<a href=\"javascript:void(0);\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openModal", "transfer-owner", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","STRING","ID"],data:data})));
  data.buffer.push(">Make Owner</a>\n");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n<a href=\"javascript:void(0);\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "openModal", "delete-user", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","STRING","ID"],data:data})));
  data.buffer.push(" class=\"delete\">Delete User</a>\n");
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, "view.parentView.canMakeOwner", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  stack1 = helpers['if'].call(depth0, "view.parentView.deleteUserActionIsVisible", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  return buffer;
  
}); });