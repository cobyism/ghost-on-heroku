define("ghost/adapters/application", 
  ["ghost/utils/ghost-paths","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var ghostPaths = __dependency1__["default"];

    var ApplicationAdapter = DS.RESTAdapter.extend({
        host: window.location.origin,
        namespace: ghostPaths().apiRoot.slice(1),

        findQuery: function (store, type, query) {
            var id;

            if (query.id) {
                id = query.id;
                delete query.id;
            }

            return this.ajax(this.buildURL(type.typeKey, id), 'GET', { data: query });
        },

        buildURL: function (type, id) {
            // Ensure trailing slashes
            var url = this._super(type, id);

            if (url.slice(-1) !== '/') {
                url += '/';
            }

            return url;
        },

        // Override deleteRecord to disregard the response body on 2xx responses.
        // This is currently needed because the API is returning status 200 along
        // with the JSON object for the deleted entity and Ember expects an empty
        // response body for successful DELETEs.
        // Non-2xx (failure) responses will still work correctly as Ember will turn
        // them into rejected promises.
        deleteRecord: function () {
            var response = this._super.apply(this, arguments);

            return response.then(function () {
                return null;
            });
        }
    });

    __exports__["default"] = ApplicationAdapter;
  });
define("ghost/adapters/embedded-relation-adapter", 
  ["ghost/adapters/application","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var ApplicationAdapter = __dependency1__["default"];

    // EmbeddedRelationAdapter will augment the query object in calls made to
    // DS.Store#find, findQuery, and findAll with the correct "includes"
    // (?include=relatedType) by introspecting on the provided subclass of the DS.Model.
    //
    // Example:
    // If a model has an embedded hasMany relation, the related type will be included:
    // roles: DS.hasMany('role', { embedded: 'always' }) => ?include=roles

    var EmbeddedRelationAdapter = ApplicationAdapter.extend({
        find: function (store, type, id) {
            return this.findQuery(store, type, this.buildQuery(store, type, id));
        },

        findQuery: function (store, type, query) {
            return this._super(store, type, this.buildQuery(store, type, query));
        },

        findAll: function (store, type, sinceToken) {
            return this.findQuery(store, type, this.buildQuery(store, type, sinceToken));
        },

        buildQuery: function (store, type, options) {
            var model,
                toInclude = [],
                query = {},
                deDupe = {};

            // Get the class responsible for creating records of this type
            model = store.modelFor(type);

            // Iterate through the model's relationships and build a list
            // of those that need to be pulled in via "include" from the API
            model.eachRelationship(function (name, meta) {
                if (meta.kind === 'hasMany' &&
                    Object.prototype.hasOwnProperty.call(meta.options, 'embedded') &&
                    meta.options.embedded === 'always') {

                    toInclude.push(name);
                }
            });

            if (toInclude.length) {
                // If this is a find by id, build a query object and attach the includes
                if (typeof options === 'string' || typeof options === 'number') {
                    query.id = options;
                    query.include = toInclude.join(',');
                }
                // If this is a find all (no existing query object) build one and attach
                // the includes.
                // If this is a find with an existing query object then merge the includes
                // into the existing object. Existing properties and includes are preserved. 
                else if (typeof options === 'object' || Ember.isNone(options)) {
                    query = options || query;
                    toInclude = toInclude.concat(query.include ? query.include.split(',') : []);

                    toInclude.forEach(function (include) {
                        deDupe[include] = true;
                    });

                    query.include = Object.keys(deDupe).join(',');
                }
            }

            return query;
        }
    });

    __exports__["default"] = EmbeddedRelationAdapter;
  });
define("ghost/adapters/post", 
  ["ghost/adapters/embedded-relation-adapter","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var EmbeddedRelationAdapter = __dependency1__["default"];

    var PostAdapter = EmbeddedRelationAdapter.extend({
        createRecord: function (store, type, record) {
            var data = {},
                serializer = store.serializerFor(type.typeKey),
                url = this.buildURL(type.typeKey);

            // make the server return with the tags embedded
            url = url + '?include=tags';

            // use the PostSerializer to transform the model back into
            // an array with a post object like the API expects
            serializer.serializeIntoHash(data, type, record);

            return this.ajax(url, 'POST', { data: data });
        },

        updateRecord: function (store, type, record) {
            var data = {},
                serializer = store.serializerFor(type.typeKey),
                id = Ember.get(record, 'id'),
                url = this.buildURL(type.typeKey, id);

            // make the server return with the tags embedded
            url = url + '?include=tags';

            // use the PostSerializer to transform the model back into
            // an array of posts objects like the API expects
            serializer.serializeIntoHash(data, type, record);

            // use the ApplicationAdapter's buildURL method
            return this.ajax(url, 'PUT', { data: data });
        }
    });

    __exports__["default"] = PostAdapter;
  });
define("ghost/adapters/setting", 
  ["ghost/adapters/application","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var ApplicationAdapter = __dependency1__["default"];

    var SettingAdapter = ApplicationAdapter.extend({
        updateRecord: function (store, type, record) {
            var data = {},
                serializer = store.serializerFor(type.typeKey);

            // remove the fake id that we added onto the model.
            delete record.id;

            // use the SettingSerializer to transform the model back into
            // an array of settings objects like the API expects
            serializer.serializeIntoHash(data, type, record);

            // use the ApplicationAdapter's buildURL method but do not
            // pass in an id.
            return this.ajax(this.buildURL(type.typeKey), 'PUT', { data: data });
        }
    });

    __exports__["default"] = SettingAdapter;
  });
define("ghost/adapters/user", 
  ["ghost/adapters/embedded-relation-adapter","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var EmbeddedRelationAdapter = __dependency1__["default"];

    var UserAdapter = EmbeddedRelationAdapter.extend({
        createRecord: function (store, type, record) {
            var data = {},
                serializer = store.serializerFor(type.typeKey),
                url = this.buildURL(type.typeKey);

            // Ask the API to include full role objects in its response
            url += '?include=roles';

            // Use the UserSerializer to transform the model back into
            // an array of user objects like the API expects
            serializer.serializeIntoHash(data, type, record);

            // Use the url from the ApplicationAdapter's buildURL method
            return this.ajax(url, 'POST', { data: data });
        },

        updateRecord: function (store, type, record) {
            var data = {},
                serializer = store.serializerFor(type.typeKey),
                id = Ember.get(record, 'id'),
                url = this.buildURL(type.typeKey, id);

            // Ask the API to include full role objects in its response
            url += '?include=roles';

            // Use the UserSerializer to transform the model back into
            // an array of user objects like the API expects
            serializer.serializeIntoHash(data, type, record);

            // Use the url from the ApplicationAdapter's buildURL method
            return this.ajax(url, 'PUT', { data: data });
        },

        find: function (store, type, id) {
            var url = this.buildQuery(store, type, id);
            url.status = 'all';
            return this.findQuery(store, type, url);
        }
    });

    __exports__["default"] = UserAdapter;
  });
define("ghost/app", 
  ["ember/resolver","ember/load-initializers","ghost/utils/link-view","ghost/utils/text-field","ghost/config","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __exports__) {
    "use strict";
    var Resolver = __dependency1__["default"];
    var loadInitializers = __dependency2__["default"];
    var configureApp = __dependency5__["default"];

    Ember.MODEL_FACTORY_INJECTIONS = true;

    var App = Ember.Application.extend({
        modulePrefix: 'ghost',
        Resolver: Resolver['default']
    });

    // Runtime configuration of Ember.Application
    configureApp(App);

    loadInitializers(App, 'ghost');

    __exports__["default"] = App;
  });
define("ghost/assets/lib/touch-editor", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var createTouchEditor = function createTouchEditor() {
        var noop = function () {},
            TouchEditor;

        TouchEditor = function (el, options) {
            /*jshint unused:false*/
            this.textarea = el;
            this.win = { document : this.textarea };
            this.ready = true;
            this.wrapping = document.createElement('div');

            var textareaParent = this.textarea.parentNode;
            this.wrapping.appendChild(this.textarea);
            textareaParent.appendChild(this.wrapping);

            this.textarea.style.opacity = 1;
        };

        TouchEditor.prototype = {
            setOption: function (type, handler) {
                if (type === 'onChange') {
                    $(this.textarea).change(handler);
                }
            },
            eachLine: function () {
                return [];
            },
            getValue: function () {
                return this.textarea.value;
            },
            setValue: function (code) {
                this.textarea.value = code;
            },
            focus: noop,
            getCursor: function () {
                return { line: 0, ch: 0 };
            },
            setCursor: noop,
            currentLine: function () {
                return 0;
            },
            cursorPosition: function () {
                return { character: 0 };
            },
            addMarkdown: noop,
            nthLine: noop,
            refresh: noop,
            selectLines: noop,
            on: noop,
            off: noop
        };

        return TouchEditor;
    };

    __exports__["default"] = createTouchEditor;
  });
define("ghost/assets/lib/uploader", 
  ["ghost/utils/ghost-paths","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var ghostPaths = __dependency1__["default"];

    var UploadUi,
        upload,
        Ghost = ghostPaths();


    UploadUi = function ($dropzone, settings) {
        var $url = '<div class="js-url"><input class="url js-upload-url" type="url" placeholder="http://"/></div>',
            $cancel = '<a class="image-cancel js-cancel" title="Delete"><span class="hidden">Delete</span></a>',
            $progress =  $('<div />', {
                'class' : 'js-upload-progress progress progress-success active',
                'role': 'progressbar',
                'aria-valuemin': '0',
                'aria-valuemax': '100'
            }).append($('<div />', {
                'class': 'js-upload-progress-bar bar',
                'style': 'width:0%'
            }));

        $.extend(this, {
            complete: function (result) {
                var self = this;

                function showImage(width, height) {
                    $dropzone.find('img.js-upload-target').attr({'width': width, 'height': height}).css({'display': 'block'});
                    $dropzone.find('.fileupload-loading').remove();
                    $dropzone.css({'height': 'auto'});
                    $dropzone.delay(250).animate({opacity: 100}, 1000, function () {
                        $('.js-button-accept').prop('disabled', false);
                        self.init();
                    });
                }

                function animateDropzone($img) {
                    $dropzone.animate({opacity: 0}, 250, function () {
                        $dropzone.removeClass('image-uploader').addClass('pre-image-uploader');
                        $dropzone.css({minHeight: 0});
                        self.removeExtras();
                        $dropzone.animate({height: $img.height()}, 250, function () {
                            showImage($img.width(), $img.height());
                        });
                    });
                }

                function preLoadImage() {
                    var $img = $dropzone.find('img.js-upload-target')
                        .attr({'src': '', 'width': 'auto', 'height': 'auto'});

                    $progress.animate({'opacity': 0}, 250, function () {
                        $dropzone.find('span.media').after('<img class="fileupload-loading"  src="' + Ghost.subdir + '/ghost/img/loadingcat.gif" />');
                        if (!settings.editor) {$progress.find('.fileupload-loading').css({'top': '56px'}); }
                    });
                    $dropzone.trigger('uploadsuccess', [result]);
                    $img.one('load', function () {
                        animateDropzone($img);
                    }).attr('src', result);
                }
                preLoadImage();
            },

            bindFileUpload: function () {
                var self = this;

                $dropzone.find('.js-fileupload').fileupload().fileupload('option', {
                    url: Ghost.subdir + '/ghost/api/v0.1/uploads/',
                    add: function (e, data) {
                        /*jshint unused:false*/
                        $('.js-button-accept').prop('disabled', true);
                        $dropzone.find('.js-fileupload').removeClass('right');
                        $dropzone.find('.js-url').remove();
                        $progress.find('.js-upload-progress-bar').removeClass('fail');
                        $dropzone.trigger('uploadstart', [$dropzone.attr('id')]);
                        $dropzone.find('span.media, div.description, a.image-url, a.image-webcam')
                            .animate({opacity: 0}, 250, function () {
                                $dropzone.find('div.description').hide().css({'opacity': 100});
                                if (settings.progressbar) {
                                    $dropzone.find('div.js-fail').after($progress);
                                    $progress.animate({opacity: 100}, 250);
                                }
                                data.submit();
                            });
                    },
                    dropZone: settings.fileStorage ? $dropzone : null,
                    progressall: function (e, data) {
                        /*jshint unused:false*/
                        var progress = parseInt(data.loaded / data.total * 100, 10);
                        if (!settings.editor) {$progress.find('div.js-progress').css({'position': 'absolute', 'top': '40px'}); }
                        if (settings.progressbar) {
                            $dropzone.trigger('uploadprogress', [progress, data]);
                            $progress.find('.js-upload-progress-bar').css('width', progress + '%');
                        }
                    },
                    fail: function (e, data) {
                        /*jshint unused:false*/
                        $('.js-button-accept').prop('disabled', false);
                        $dropzone.trigger('uploadfailure', [data.result]);
                        $dropzone.find('.js-upload-progress-bar').addClass('fail');
                        if (data.jqXHR.status === 413) {
                            $dropzone.find('div.js-fail').text('The image you uploaded was larger than the maximum file size your server allows.');
                        } else if (data.jqXHR.status === 415) {
                            $dropzone.find('div.js-fail').text('The image type you uploaded is not supported. Please use .PNG, .JPG, .GIF, .SVG.');
                        } else {
                            $dropzone.find('div.js-fail').text('Something went wrong :(');
                        }
                        $dropzone.find('div.js-fail, button.js-fail').fadeIn(1500);
                        $dropzone.find('button.js-fail').on('click', function () {
                            $dropzone.css({minHeight: 0});
                            $dropzone.find('div.description').show();
                            self.removeExtras();
                            self.init();
                        });
                    },
                    done: function (e, data) {
                        /*jshint unused:false*/
                        self.complete(data.result);
                    }
                });
            },

            buildExtras: function () {
                if (!$dropzone.find('span.media')[0]) {
                    $dropzone.prepend('<span class="media"><span class="hidden">Image Upload</span></span>');
                }
                if (!$dropzone.find('div.description')[0]) {
                    $dropzone.append('<div class="description">Add image</div>');
                }
                if (!$dropzone.find('div.js-fail')[0]) {
                    $dropzone.append('<div class="js-fail failed" style="display: none">Something went wrong :(</div>');
                }
                if (!$dropzone.find('button.js-fail')[0]) {
                    $dropzone.append('<button class="js-fail button-add" style="display: none">Try Again</button>');
                }
                if (!$dropzone.find('a.image-url')[0]) {
                    $dropzone.append('<a class="image-url" title="Add image from URL"><span class="hidden">URL</span></a>');
                }
    //                if (!$dropzone.find('a.image-webcam')[0]) {
    //                    $dropzone.append('<a class="image-webcam" title="Add image from webcam"><span class="hidden">Webcam</span></a>');
    //                }
            },

            removeExtras: function () {
                $dropzone.find('span.media, div.js-upload-progress, a.image-url, a.image-upload, a.image-webcam, div.js-fail, button.js-fail, a.js-cancel').remove();
            },

            initWithDropzone: function () {
                var self = this;
                //This is the start point if no image exists
                $dropzone.find('img.js-upload-target').css({'display': 'none'});
                $dropzone.removeClass('pre-image-uploader image-uploader-url').addClass('image-uploader');
                this.removeExtras();
                this.buildExtras();
                this.bindFileUpload();
                if (!settings.fileStorage) {
                    self.initUrl();
                    return;
                }
                $dropzone.find('a.image-url').on('click', function () {
                    self.initUrl();
                });
            },
            initUrl: function () {
                var self = this, val;
                this.removeExtras();
                $dropzone.addClass('image-uploader-url').removeClass('pre-image-uploader');
                $dropzone.find('.js-fileupload').addClass('right');
                if (settings.fileStorage) {
                    $dropzone.append($cancel);
                }
                $dropzone.find('.js-cancel').on('click', function () {
                    $dropzone.find('.js-url').remove();
                    $dropzone.find('.js-fileupload').removeClass('right');
                    self.removeExtras();
                    self.initWithDropzone();
                });

                $dropzone.find('div.description').before($url);

                if (settings.editor) {
                    $dropzone.find('div.js-url').append('<button class="js-button-accept button-save">Save</button>');
                }

                $dropzone.find('.js-button-accept').on('click', function () {
                    val = $dropzone.find('.js-upload-url').val();
                    $dropzone.find('div.description').hide();
                    $dropzone.find('.js-fileupload').removeClass('right');
                    $dropzone.find('.js-url').remove();
                    if (val === '') {
                        $dropzone.trigger('uploadsuccess', 'http://');
                        self.initWithDropzone();
                    } else {
                        self.complete(val);
                    }
                });

                // Only show the toggle icon if there is a dropzone mode to go back to
                if (settings.fileStorage !== false) {
                    $dropzone.append('<a class="image-upload" title="Add image"><span class="hidden">Upload</span></a>');
                }

                $dropzone.find('a.image-upload').on('click', function () {
                    $dropzone.find('.js-url').remove();
                    $dropzone.find('.js-fileupload').removeClass('right');
                    self.initWithDropzone();
                });

            },
            initWithImage: function () {
                var self = this;
                // This is the start point if an image already exists
                $dropzone.removeClass('image-uploader image-uploader-url').addClass('pre-image-uploader');
                $dropzone.find('div.description').hide();
                $dropzone.append($cancel);
                $dropzone.find('.js-cancel').on('click', function () {
                    $dropzone.find('img.js-upload-target').attr({'src': ''});
                    $dropzone.find('div.description').show();
                    $dropzone.delay(2500).animate({opacity: 100}, 1000, function () {
                        self.init();
                    });

                    $dropzone.trigger('uploadsuccess', 'http://');
                    self.initWithDropzone();
                });
            },

            init: function () {
                var imageTarget = $dropzone.find('img.js-upload-target');
                // First check if field image is defined by checking for js-upload-target class
                if (!imageTarget[0]) {
                    // This ensures there is an image we can hook into to display uploaded image
                    $dropzone.prepend('<img class="js-upload-target" style="display: none"  src="" />');
                }
                $('.js-button-accept').prop('disabled', false);
                if (imageTarget.attr('src') === '' || imageTarget.attr('src') === undefined) {
                    this.initWithDropzone();
                } else {
                    this.initWithImage();
                }
            }
        });
    };


    upload = function (options) {
        var settings = $.extend({
            progressbar: true,
            editor: false,
            fileStorage: true
        }, options);
        return this.each(function () {
            var $dropzone = $(this),
                ui;

            ui = new UploadUi($dropzone, settings);
            ui.init();
        });
    };

    __exports__["default"] = upload;
  });
define("ghost/components/gh-activating-list-item", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var ActivatingListItem = Ember.Component.extend({
        tagName: 'li',
        classNameBindings: ['active'],
        active: false
    });

    __exports__["default"] = ActivatingListItem;
  });
define("ghost/components/gh-blur-input", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var BlurInput = Ember.TextField.extend({
        selectOnClick: false,
        stopEnterKeyDownPropagation: false,
        click: function (event) {
            if (this.get('selectOnClick')) {
                event.currentTarget.select();
            }
        },
        focusOut: function () {
            this.sendAction('action', this.get('value'));
        },
        keyDown: function (event) {
            // stop event propagation when pressing "enter"
            // most useful in the case when undesired (global) keyboard shortcuts are getting triggered while interacting
            // with this particular input element.
            if (this.get('stopEnterKeyDownPropagation') && event.keyCode === 13) {
                event.stopPropagation();
                return true;
            }
        }
    });

    __exports__["default"] = BlurInput;
  });
define("ghost/components/gh-codemirror", 
  ["ghost/mixins/marker-manager","ghost/utils/codemirror-mobile","ghost/utils/set-scroll-classname","ghost/utils/codemirror-shortcuts","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    /*global CodeMirror */

    var MarkerManager = __dependency1__["default"];
    var mobileCodeMirror = __dependency2__["default"];
    var setScrollClassName = __dependency3__["default"];
    var codeMirrorShortcuts = __dependency4__["default"];

    codeMirrorShortcuts.init();

    var onChangeHandler = function (cm, changeObj) {
        var line,
            component = cm.component,
            checkLine = _.bind(component.checkLine, component),
            checkMarkers = _.bind(component.checkMarkers, component);

        // fill array with a range of numbers
        for (line = changeObj.from.line; line < changeObj.from.line + changeObj.text.length; line += 1) {
            checkLine(line, changeObj.origin);
        }

        // Is this a line which may have had a marker on it?
        checkMarkers();

        cm.component.set('value', cm.getValue());
    };

    var onScrollHandler = function (cm) {
        var scrollInfo = cm.getScrollInfo(),
            component = cm.component;

        scrollInfo.codemirror = cm;

        // throttle scroll updates
        component.throttle = Ember.run.throttle(component, function () {
            this.set('scrollInfo', scrollInfo);
        }, 10);
    };

    var Codemirror = Ember.TextArea.extend(MarkerManager, {
        didInsertElement: function () {
            Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
        },

        afterRenderEvent: function () {
            var initMarkers = _.bind(this.initMarkers, this);

            // Allow tabbing behaviour when viewing on small screen (not mobile)
            $('#entry-markdown-header').on('click', function () {
                $('.entry-markdown').addClass('active');
                $('.entry-preview').removeClass('active');
            });

            $('#entry-preview-header').on('click', function () {
                $('.entry-markdown').removeClass('active');
                $('.entry-preview').addClass('active');
            });

            // replaces CodeMirror with TouchEditor only if we're on mobile
            mobileCodeMirror.createIfMobile();

            this.initCodemirror();
            this.codemirror.eachLine(initMarkers);
            this.sendAction('setCodeMirror', this);
        },

        // this needs to be placed on the 'afterRender' queue otherwise CodeMirror gets wonky
        initCodemirror: function () {
            // create codemirror
            var codemirror = CodeMirror.fromTextArea(this.get('element'), {
                mode:           'gfm',
                tabMode:        'indent',
                tabindex:       '2',
                cursorScrollMargin: 10,
                lineWrapping:   true,
                dragDrop:       false,
                extraKeys: {
                    Home:   'goLineLeft',
                    End:    'goLineRight'
                }
            });

            codemirror.component = this; // save reference to this

            // propagate changes to value property
            codemirror.on('change', onChangeHandler);

            // on scroll update scrollPosition property
            codemirror.on('scroll', onScrollHandler);

            codemirror.on('scroll', Ember.run.bind(Ember.$('.CodeMirror-scroll'), setScrollClassName, {
                target: Ember.$('.entry-markdown'),
                offset: 10
            }));

            this.set('codemirror', codemirror);
        },

        disableCodeMirror: function () {
            var codemirror = this.get('codemirror');

            codemirror.setOption('readOnly', 'nocursor');
            codemirror.off('change', onChangeHandler);
        },

        enableCodeMirror: function () {
            var codemirror = this.get('codemirror');

            codemirror.setOption('readOnly', false);

            // clicking the trash button on an image dropzone causes this function to fire.
            // this line is a hack to prevent multiple event handlers from being attached.
            codemirror.off('change', onChangeHandler);

            codemirror.on('change', onChangeHandler);
        },

        removeThrottle: function () {
            Ember.run.cancel(this.throttle);
        }.on('willDestroyElement'),

        removeCodemirrorHandlers: function () {
            // not sure if this is needed.
            var codemirror = this.get('codemirror');
            codemirror.off('change', onChangeHandler);
            codemirror.off('scroll');
        }.on('willDestroyElement'),

        clearMarkerManagerMarkers: function () {
            this.clearMarkers();
        }.on('willDestroyElement')
    });

    __exports__["default"] = Codemirror;
  });
define("ghost/components/gh-file-upload", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var FileUpload = Ember.Component.extend({
        _file: null,

        uploadButtonText: 'Text',

        uploadButtonDisabled: true,

        change: function (event) {
            this.set('uploadButtonDisabled', false);
            this.sendAction('onAdd');
            this._file = event.target.files[0];
        },

        onUpload: 'onUpload',

        actions: {
            upload: function () {
                if (!this.uploadButtonDisabled && this._file) {
                    this.sendAction('onUpload', this._file);
                }

                // Prevent double post by disabling the button.
                this.set('uploadButtonDisabled', true);
            }
        }
    });

    __exports__["default"] = FileUpload;
  });
define("ghost/components/gh-form", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var Form = Ember.View.extend({
        tagName: 'form',
        attributeBindings: ['enctype'],
        reset: function () {
            this.$().get(0).reset();
        },
        didInsertElement: function () {
            this.get('controller').on('reset', this, this.reset);
        },
        willClearRender: function () {
            this.get('controller').off('reset', this, this.reset);
        }
    });

    __exports__["default"] = Form;
  });
define("ghost/components/gh-markdown", 
  ["ghost/assets/lib/uploader","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var uploader = __dependency1__["default"];

    var Markdown = Ember.Component.extend({
        classNames: ['rendered-markdown'],

        didInsertElement: function () {
            this.set('scrollWrapper', this.$().closest('.entry-preview-content'));
        },

        adjustScrollPosition: function () {
            var scrollWrapper = this.get('scrollWrapper'),
                scrollPosition = this.get('scrollPosition');

            scrollWrapper.scrollTop(scrollPosition);
        }.observes('scrollPosition'),

        // fire off 'enable' API function from uploadManager
        // might need to make sure markdown has been processed first
        reInitDropzones: function () {
            Ember.run.scheduleOnce('afterRender', this, function () {
                var dropzones = $('.js-drop-zone');

                uploader.call(dropzones, {
                    editor: true,
                    fileStorage: this.get('config.fileStorage')
                });

                dropzones.on('uploadstart', _.bind(this.sendAction, this, 'uploadStarted'));
                dropzones.on('uploadfailure', _.bind(this.sendAction, this, 'uploadFinished'));
                dropzones.on('uploadsuccess', _.bind(this.sendAction, this, 'uploadFinished'));
                dropzones.on('uploadsuccess', _.bind(this.sendAction, this, 'uploadSuccess'));
            });
        }.observes('markdown')
    });

    __exports__["default"] = Markdown;
  });
define("ghost/components/gh-modal-dialog", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var ModalDialog = Ember.Component.extend({
        didInsertElement: function () {
            this.$('#modal-container').fadeIn(50);

            this.$('.modal-background').show().fadeIn(10, function () {
                $(this).addClass('in');
            });

            this.$('.js-modal').addClass('in');
        },

        willDestroyElement: function () {

            this.$('.js-modal').removeClass('in');

            this.$('.modal-background').removeClass('in');

            return this._super();
        },

        confirmaccept: 'confirmAccept',
        confirmreject: 'confirmReject',

        actions: {
            closeModal: function () {
                this.sendAction();
            },
            confirm: function (type) {
                this.sendAction('confirm' + type);
                this.sendAction();
            }
        },

        klass: function () {
            var classNames = [];

            classNames.push(this.get('type') ? 'modal-' + this.get('type') : 'modal');

            if (this.get('style')) {
                this.get('style').split(',').forEach(function (style) {
                    classNames.push('modal-style-' + style);
                });
            }

            classNames.push(this.get('animation'));

            return classNames.join(' ');
        }.property('type', 'style', 'animation'),

        acceptButtonClass: function () {
            return this.get('confirm.accept.buttonClass') ? this.get('confirm.accept.buttonClass') : 'button-add';
        }.property('confirm.accept.buttonClass'),

        rejectButtonClass: function () {
            return this.get('confirm.reject.buttonClass') ? this.get('confirm.reject.buttonClass') : 'button-delete';
        }.property('confirm.reject.buttonClass')
    });

    __exports__["default"] = ModalDialog;
  });
define("ghost/components/gh-notification", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var NotificationComponent = Ember.Component.extend({
        classNames: ['js-bb-notification'],

        typeClass: function () {
            var classes = '',
                message = this.get('message'),
                type,
                dismissible;

            // Check to see if we're working with a DS.Model or a plain JS object
            if (typeof message.toJSON === 'function') {
                type = message.get('type');
                dismissible = message.get('dismissible');
            }
            else {
                type = message.type;
                dismissible = message.dismissible;
            }

            classes += 'notification-' + type;

            if (type === 'success' && dismissible !== false) {
                classes += ' notification-passive';
            }

            return classes;
        }.property(),

        didInsertElement: function () {
            var self = this;

            self.$().on('animationend webkitAnimationEnd oanimationend MSAnimationEnd', function (event) {
                /* jshint unused: false */
                if (event.originalEvent.animationName === 'fade-out') {
                    self.notifications.removeObject(self.get('message'));
                }
            });
        },

        actions: {
            closeNotification: function () {
                var self = this;
                self.notifications.closeNotification(self.get('message'));
            }
        }
    });

    __exports__["default"] = NotificationComponent;
  });
define("ghost/components/gh-notifications", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var NotificationsComponent = Ember.Component.extend({
        tagName: 'aside',
        classNames: 'notifications',
        classNameBindings: ['location'],

        messages: Ember.computed.filter('notifications', function (notification) {
            // If this instance of the notifications component has no location affinity
            // then it gets all notifications
            if (!this.get('location')) {
                return true;
            }

            var displayLocation = (typeof notification.toJSON === 'function') ?
                notification.get('location') : notification.location;

            return this.get('location') === displayLocation;
        }),

        messageCountObserver: function () {
            this.sendAction('notify', this.get('messages').length);
        }.observes('messages.[]')
    });

    __exports__["default"] = NotificationsComponent;
  });
define("ghost/components/gh-popover-button", 
  ["ghost/mixins/popover-mixin","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var PopoverMixin = __dependency1__["default"];

    var PopoverButton = Ember.Component.extend(PopoverMixin, {
        tagName: 'button',
        /*matches with the popover this button toggles*/
        popoverName: null,
        /*Notify popover service this popover should be toggled*/
        click: function (event) {
            this._super(event);
            this.get('popover').togglePopover(this.get('popoverName'), this);
        }
    });

    __exports__["default"] = PopoverButton;
  });
define("ghost/components/gh-popover", 
  ["ghost/mixins/popover-mixin","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var PopoverMixin = __dependency1__["default"];

    var GhostPopover = Ember.Component.extend(PopoverMixin, {
        classNames: 'ghost-popover fade-in',
        name: null,
        closeOnClick: false,
        //Helps track the user re-opening the menu while it's fading out.
        closing: false,

        open: function () {
            this.set('closing', false);
            this.set('isOpen', true);
            this.set('button.isOpen', true);
        },
        close: function () {
            var self = this;
            this.set('closing', true);
            if (this.get('button')) {
                this.set('button.isOpen', false);
            }
            this.$().fadeOut(200, function () {
                //Make sure this wasn't an aborted fadeout by
                //checking `closing`.
                if (self.get('closing')) {
                    self.set('isOpen', false);
                    self.set('closing', false);
                }
            });
        },
        //Called by the popover service when any popover button is clicked.
        toggle: function (options) {
            var isClosing = this.get('closing'),
                isOpen = this.get('isOpen'),
                name = this.get('name'),
                button = this.get('button'),
                targetPopoverName = options.target;
            
            if (name === targetPopoverName && (!isOpen || isClosing)) {
                if (!button) {
                    button = options.button;
                    this.set('button', button);
                }
                this.open();
            } else if (isOpen) {
                this.close();
            }
        },

        click: function (event) {
            this._super(event);
            if (this.get('closeOnClick')) {
                return this.close();
            }
        },

        didInsertElement: function () {
            this._super();
            var popoverService = this.get('popover');

            popoverService.on('close', this, this.close);
            popoverService.on('toggle', this, this.toggle);
        },
        willDestroyElement: function () {
            this._super();
            var popoverService = this.get('popover');

            popoverService.off('close', this, this.close);
            popoverService.off('toggle', this, this.toggle);
        }
    });

    __exports__["default"] = GhostPopover;
  });
define("ghost/components/gh-role-selector", 
  ["ghost/components/gh-select","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var GhostSelect = __dependency1__["default"];

    var RolesSelector = GhostSelect.extend({
        roles: Ember.computed.alias('options'),
        options: Ember.computed(function () {
            var rolesPromise = this.store.find('role', { permissions: 'assign' });

            return Ember.ArrayProxy.extend(Ember.PromiseProxyMixin)
                .create({promise: rolesPromise});
        })
    });

    __exports__["default"] = RolesSelector;
  });
define("ghost/components/gh-select", 
  ["exports"],
  function(__exports__) {
    "use strict";
    //GhostSelect is a solution to Ember.Select being evil and worthless.
    // (Namely, this solves problems with async data in Ember.Select)
    //Inspired by (that is, totally ripped off from) this JSBin
    //http://emberjs.jsbin.com/rwjblue/40/edit

    //Usage:
    //Extend this component and create a template for your component.
    //Your component must define the `options` property.
    //Optionally use `initialValue` to set the object
    //     you want to have selected to start with.
    //Both options and initalValue are promise safe.
    //Set onChange in your template to be the name
    //    of the action you want called in your
    //For an example, see gh-roles-selector

    var GhostSelect = Ember.Component.extend({
        tagName: 'span',
        classNames: ['gh-select'],

        options: null,
        initialValue: null,

        resolvedOptions: null,
        resolvedInitialValue: null,

        //Convert promises to their values
        init: function () {
            var self = this;
            this._super.apply(this, arguments);

            Ember.RSVP.hash({
                resolvedOptions: this.get('options'),
                resolvedInitialValue: this.get('initialValue')
            }).then(function (resolvedHash) {
                self.setProperties(resolvedHash);

                //Run after render to ensure the <option>s have rendered
                Ember.run.schedule('afterRender', function () {
                    self.setInitialValue();
                });
            });
        },

        setInitialValue: function () {
            var initialValue = this.get('resolvedInitialValue'),
                options = this.get('resolvedOptions'),
                initialValueIndex = options.indexOf(initialValue);
            if (initialValueIndex > -1) {
                this.$('option:eq(' + initialValueIndex + ')').prop('selected', true);
            }
        },
        //Called by DOM events, weee!
        change: function () {
            this._changeSelection();
        },
        //Send value to specified action
        _changeSelection: function () {
            var value = this._selectedValue();
            Ember.set(this, 'value', value);
            this.sendAction('onChange', value);
        },
        _selectedValue: function () {
            var selectedIndex = this.$('select')[0].selectedIndex;

            return this.get('options').objectAt(selectedIndex);
        }
    });

    __exports__["default"] = GhostSelect;
  });
define("ghost/components/gh-trim-focus-input", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var TrimFocusInput = Ember.TextField.extend({
        focus: true,

        setFocus: function () {
            if (this.focus) {
                this.$().val(this.$().val()).focus();
            }
        }.on('didInsertElement'),

        focusOut: function () {
            var text = this.$().val();

            this.$().val(text.trim());
        }
    });

    __exports__["default"] = TrimFocusInput;
  });
define("ghost/components/gh-upload-modal", 
  ["ghost/components/gh-modal-dialog","ghost/assets/lib/uploader","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var ModalDialog = __dependency1__["default"];
    var upload = __dependency2__["default"];

    var UploadModal = ModalDialog.extend({
        layoutName: 'components/gh-modal-dialog',

        didInsertElement: function () {
            this._super();
            upload.call(this.$('.js-drop-zone'), {fileStorage: this.get('config.fileStorage')});
        },
        confirm: {
            reject: {
                func: function () { // The function called on rejection
                    return true;
                },
                buttonClass: true,
                text: 'Cancel' // The reject button text
            },
            accept: {
                buttonClass: 'button-save right',
                text: 'Save', // The accept button texttext: 'Save'
                func: function () {
                    var imageType = 'model.' + this.get('imageType');

                    if (this.$('.js-upload-url').val()) {
                        this.set(imageType, this.$('.js-upload-url').val());
                    } else {
                        this.set(imageType, this.$('.js-upload-target').attr('src'));
                    }
                    return true;
                }
            }
        },

        actions: {
            closeModal: function () {
                this.sendAction();
            },
            confirm: function (type) {
                var func = this.get('confirm.' + type + '.func');
                if (typeof func === 'function') {
                    func.apply(this);
                }
                this.sendAction();
                this.sendAction('confirm' + type);
            }
        }
    });

    __exports__["default"] = UploadModal;
  });
define("ghost/config", 
  ["exports"],
  function(__exports__) {
    "use strict";
    function configureApp(App) {
        if (!App instanceof Ember.Application) {
            return;
        }
    }

    __exports__["default"] = configureApp;
  });
define("ghost/controllers/application", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var ApplicationController = Ember.Controller.extend({
        hideNav: Ember.computed.match('currentPath', /(error|signin|signup|setup|forgotten|reset)/),

        topNotificationCount: 0,

        actions: {
            toggleMenu: function () {
                this.toggleProperty('showMenu');
            },

            topNotificationChange: function (count) {
                this.set('topNotificationCount', count);
            }
        }
    });

    __exports__["default"] = ApplicationController;
  });
define("ghost/controllers/debug", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var DebugController = Ember.Controller.extend(Ember.Evented, {
        uploadButtonText: 'Import',
        importErrors: '',

        actions: {
            onUpload: function (file) {
                var self = this,
                    formData = new FormData();

                this.set('uploadButtonText', 'Importing');
                this.notifications.closePassive();

                formData.append('importfile', file);

                ic.ajax.request(this.get('ghostPaths.url').api('db'), {
                    type: 'POST',
                    data: formData,
                    dataType: 'json',
                    cache: false,
                    contentType: false,
                    processData: false
                }).then(function () {
                    self.notifications.showSuccess('Import successful.');
                }).catch(function (response) {
                    if (response && response.jqXHR && response.jqXHR.responseJSON && response.jqXHR.responseJSON.errors) {
                        self.set('importErrors', response.jqXHR.responseJSON.errors);
                    }
                    self.notifications.showError('Import Failed');
                }).finally(function () {
                    self.set('uploadButtonText', 'Import');
                    self.trigger('reset');
                });
            },

            exportData: function () {
                var iframe = $('#iframeDownload'),
                    downloadURL = this.get('ghostPaths.url').api('db') +
                        '?access_token=' + this.get('session.access_token');

                if (iframe.length === 0) {
                    iframe = $('<iframe>', { id: 'iframeDownload' }).hide().appendTo('body');
                }

                iframe.attr('src', downloadURL);
            },

            sendTestEmail: function () {
                var self = this;

                ic.ajax.request(this.get('ghostPaths.url').api('mail', 'test'), {
                    type: 'POST'
                }).then(function () {
                    self.notifications.showSuccess('Check your email for the test message:');
                }).catch(function (response) {
                    self.notifications.showErrors(response);
                });
            }
        }
    });

    __exports__["default"] = DebugController;
  });
define("ghost/controllers/editor/edit", 
  ["ghost/mixins/editor-base-controller","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var EditorControllerMixin = __dependency1__["default"];

    var EditorEditController = Ember.ObjectController.extend(EditorControllerMixin);

    __exports__["default"] = EditorEditController;
  });
define("ghost/controllers/editor/new", 
  ["ghost/mixins/editor-base-controller","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var EditorControllerMixin = __dependency1__["default"];

    var EditorNewController = Ember.ObjectController.extend(EditorControllerMixin, {
        actions: {
            /**
              * Redirect to editor after the first save
              */
            save: function () {
                var self = this;
                this._super().then(function (model) {
                    if (model.get('id')) {
                        self.transitionToRoute('editor.edit', model);
                    }
                });
            }
        }
    });

    __exports__["default"] = EditorNewController;
  });
define("ghost/controllers/error", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var ErrorController = Ember.Controller.extend({
        code: function () {
            return this.get('content.status') > 200 ? this.get('content.status') : 500;
        }.property('content.status'),
        message: function () {
            if (this.get('code') === 404) {
                return 'No Ghost Found';
            }

            return this.get('content.statusText') !== 'error' ? this.get('content.statusText') : 'Internal Server Error';
        }.property('content.statusText'),
        stack: false
    });

    __exports__["default"] = ErrorController;
  });
define("ghost/controllers/forgotten", 
  ["ghost/utils/ajax","ghost/mixins/validation-engine","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    /* jshint unused: false */
    var ajax = __dependency1__["default"];

    var ValidationEngine = __dependency2__["default"];

    
    var ForgottenController = Ember.Controller.extend(ValidationEngine, {
        email: '',
        submitting: false,
    
        // ValidationEngine settings
        validationType: 'forgotten',
    
        actions: {
            submit: function () {
                var self = this,
                    data = self.getProperties('email');
    
                this.toggleProperty('submitting');
                this.validate({ format: false }).then(function () {
                    ajax({
                        url: self.get('ghostPaths.url').api('authentication', 'passwordreset'),
                        type: 'POST',
                        data: {
                            passwordreset: [{
                                email: data.email
                            }]
                        }
                    }).then(function (resp) {
                        self.toggleProperty('submitting');
                        self.notifications.showSuccess('Please check your email for instructions.', {delayed: true});
                        self.set('email', '');
                        self.transitionToRoute('signin');
                    }).catch(function (resp) {
                        self.toggleProperty('submitting');
                        self.notifications.showAPIError(resp, { defaultErrorText: 'There was a problem logging in, please try again.' });
                    });
                }).catch(function (errors) {
                    self.toggleProperty('submitting');
                    self.notifications.showErrors(errors);
                });
            }
        }
    });
    
    __exports__["default"] = ForgottenController;
  });
define("ghost/controllers/modals/delete-all", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var DeleteAllController = Ember.Controller.extend({
        actions: {
            confirmAccept: function () {
                var self = this;

                ic.ajax.request(this.get('ghostPaths.url').api('db'), {
                    type: 'DELETE'
                }).then(function () {
                    self.notifications.showSuccess('All content deleted from database.');
                }).catch(function (response) {
                    self.notifications.showErrors(response);
                });
            },

            confirmReject: function () {
                return false;
            }
        },

        confirm: {
            accept: {
                text: 'Delete',
                buttonClass: 'button-delete'
            },
            reject: {
                text: 'Cancel',
                buttonClass: 'button'
            }
        }
    });

    __exports__["default"] = DeleteAllController;
  });
define("ghost/controllers/modals/delete-post", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var DeletePostController = Ember.Controller.extend({
        actions: {
            confirmAccept: function () {
                var self = this,
                    model = this.get('model');

                // definitely want to clear the data store and post of any unsaved, client-generated tags
                model.updateTags();

                model.destroyRecord().then(function () {
                    self.get('popover').closePopovers();
                    self.transitionToRoute('posts.index');
                    self.notifications.showSuccess('Your post has been deleted.', { delayed: true });
                }, function () {
                    self.notifications.showError('Your post could not be deleted. Please try again.');
                });

            },

            confirmReject: function () {
                return false;
            }
        },
        confirm: {
            accept: {
                text: 'Delete',
                buttonClass: 'button-delete'
            },
            reject: {
                text: 'Cancel',
                buttonClass: 'button'
            }
        }
    });

    __exports__["default"] = DeletePostController;
  });
define("ghost/controllers/modals/delete-user", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var DeleteUserController = Ember.Controller.extend({
        actions: {
            confirmAccept: function () {
                var self = this,
                    user = this.get('model');

                user.destroyRecord().then(function () {
                    self.store.unloadAll('post');
                    self.transitionToRoute('settings.users');
                    self.notifications.showSuccess('The user has been deleted.', { delayed: true });
                }, function () {
                    self.notifications.showError('The user could not be deleted. Please try again.');
                });

            },

            confirmReject: function () {
                return false;
            }
        },
        confirm: {
            accept: {
                text: 'Delete User',
                buttonClass: 'button-delete'
            },
            reject: {
                text: 'Cancel',
                buttonClass: 'button'
            }
        }
    });

    __exports__["default"] = DeleteUserController;
  });
define("ghost/controllers/modals/invite-new-user", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var InviteNewUserController = Ember.Controller.extend({
        //Used to set the initial value for the dropdown
        authorRole: Ember.computed(function () {
            var self = this;
            return this.store.find('role').then(function (roles) {
                var authorRole = roles.findBy('name', 'Author');
                //Initialize role as well.
                self.set('role', authorRole);
                self.set('authorRole', authorRole);
                return authorRole;
            });
        }),
        
        confirm: {
            accept: {
                text: 'send invitation now'
            },
            reject: {
                buttonClass: 'hidden'
            }
        },
            
        actions: {
            setRole: function (role) {
                this.set('role', role);
            },

            confirmAccept: function () {
                var email = this.get('email'),
                    role = this.get('role'),
                    self = this,
                    newUser;

                // reset the form and close the modal
                self.set('email', '');
                self.set('role', self.get('authorRole'));
                self.send('closeModal');

                this.store.find('user').then(function (result) {
                    var invitedUser = result.findBy('email', email);
                    if (invitedUser) {
                        if (invitedUser.get('status') === 'invited' || invitedUser.get('status') === 'invited-pending') {
                            self.notifications.showWarn('A user with that email address was already invited.');
                        } else {
                            self.notifications.showWarn('A user with that email address already exists.');
                        }
                        
                    } else {
                        newUser = self.store.createRecord('user', {
                            email: email,
                            status: 'invited',
                            role: role
                        });

                        newUser.save().then(function () {
                            var notificationText = 'Invitation sent! (' + email + ')';

                            // If sending the invitation email fails, the API will still return a status of 201
                            // but the user's status in the response object will be 'invited-pending'.
                            if (newUser.get('status') === 'invited-pending') {
                                self.notifications.showWarn('Invitation email was not sent.  Please try resending.');
                            } else {
                                self.notifications.showSuccess(notificationText);
                            }
                        }).catch(function (errors) {
                            newUser.deleteRecord();
                            self.notifications.showErrors(errors);
                        });
                    }
                });
            },

            confirmReject: function () {
                return false;
            }
        }
    });

    __exports__["default"] = InviteNewUserController;
  });
define("ghost/controllers/modals/leave-editor", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var LeaveEditorController = Ember.Controller.extend({
        args: Ember.computed.alias('model'),

        actions: {
            confirmAccept: function () {
                var args = this.get('args'),
                    editorController,
                    model,
                    transition;

                if (Ember.isArray(args)) {
                    editorController = args[0];
                    transition = args[1];
                    model = editorController.get('model');
                }

                if (!transition || !editorController) {
                    this.notifications.showError('Sorry, there was an error in the application. Please let the Ghost team know what happened.');
                    return true;
                }

                // definitely want to clear the data store and post of any unsaved, client-generated tags
                model.updateTags();

                if (model.get('isNew')) {
                    // the user doesn't want to save the new, unsaved post, so delete it.
                    model.deleteRecord();
                } else {
                    // roll back changes on model props
                    model.rollback();
                }

                // setting isDirty to false here allows willTransition on the editor route to succeed
                editorController.set('isDirty', false);

                // since the transition is now certain to complete, we can unset window.onbeforeunload here
                window.onbeforeunload = null;

                transition.retry();
            },

            confirmReject: function () {

            }
        },

        confirm: {
            accept: {
                text: 'Leave',
                buttonClass: 'button-delete'
            },
            reject: {
                text: 'Stay',
                buttonClass: 'button'
            }
        }
    });

    __exports__["default"] = LeaveEditorController;
  });
define("ghost/controllers/modals/transfer-owner", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var TransferOwnerController = Ember.Controller.extend({
        actions: {
            confirmAccept: function () {
                var user = this.get('model'),
                    url = this.get('ghostPaths.url').api('users', 'owner'),
                    self = this;

                self.get('popover').closePopovers();

                ic.ajax.request(url, {
                    type: 'PUT',
                    data: {
                        owner: [{
                            'id': user.get('id')
                        }]
                    }
                }).then(function (response) {
                    // manually update the roles for the users that just changed roles
                    // because store.pushPayload is not working with embedded relations
                    if (response && Ember.isArray(response.users)) {
                        response.users.forEach(function (userJSON) {
                            var user = self.store.getById('user', userJSON.id),
                                role = self.store.getById('role', userJSON.roles[0].id);

                            user.set('role', role);
                        });
                    }

                    self.notifications.showSuccess('Ownership successfully transferred to ' + user.get('name'));
                }).catch(function (error) {
                    self.notifications.showAPIError(error);
                });
            },

            confirmReject: function () {
                return false;
            }
        },

        confirm: {
            accept: {
                text: 'YEP - I\'M SURE',
                buttonClass: 'button-delete'
            },
            reject: {
                text: 'CANCEL',
                buttonClass: 'button'
            }
        }
    });

    __exports__["default"] = TransferOwnerController;
  });
define("ghost/controllers/modals/upload", 
  ["exports"],
  function(__exports__) {
    "use strict";

    var UploadController = Ember.Controller.extend({
        acceptEncoding: 'image/*',
        actions: {
            confirmAccept: function () {
                var self = this;

                this.get('model').save().then(function (model) {
                    self.notifications.showSuccess('Saved');
                    return model;
                }).catch(function (err) {
                    self.notifications.showErrors(err);
                });
            },

            confirmReject: function () {
                return false;
            }
        }
    });

    __exports__["default"] = UploadController;
  });
define("ghost/controllers/post-settings-menu", 
  ["ghost/utils/date-formatting","ghost/models/slug-generator","ghost/utils/bound-one-way","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    /* global moment */
    var parseDateString = __dependency1__.parseDateString;
    var formatDate = __dependency1__.formatDate;
    var SlugGenerator = __dependency2__["default"];
    var boundOneWay = __dependency3__["default"];

    var PostSettingsMenuController = Ember.ObjectController.extend({
        init: function () {
            this._super();

            // when creating a new post we want to observe the title
            // to generate the post's slug
            if (this.get('isNew')) {
                this.addObserver('titleScratch', this, 'titleObserver');
            }
        },

        selectedAuthor: null,
        initializeSelectedAuthor: Ember.observer('model', function () {
            var self = this;

            return this.get('author').then(function (author) {
                self.set('selectedAuthor', author);
                return author;
            });
        }).on('init'),

        changeAuthor: function () {
            var author = this.get('author'),
                selectedAuthor = this.get('selectedAuthor'),
                model = this.get('model'),
                self = this;
            //return if nothing changed
            if (selectedAuthor.get('id') === author.get('id')) {
                return;
            }
            model.set('author', selectedAuthor);

            //if this is a new post (never been saved before), don't try to save it
            if (this.get('isNew')) {
                return;
            }

            model.save(this.get('saveOptions')).catch(function (errors) {
                self.showErrors(errors);
                self.set('selectedAuthor', author);
                model.rollback();
            });
        }.observes('selectedAuthor'),
        authors: function () {
            //Loaded asynchronously, so must use promise proxies.
            var deferred = {};

            deferred.promise = this.store.find('user').then(function (users) {
                return users.rejectBy('id', 'me');
            }).then(function (users) {
                return users.filter(function (user) {
                    return user.get('active');
                });
            });

            return Ember.ArrayProxy
                .extend(Ember.PromiseProxyMixin)
                .create(deferred);
        }.property(),
        //Changes in the PSM are too minor to warrant NProgress firing
        saveOptions: {disableNProgress: true},
        /**
         * The placeholder is the published date of the post,
         * or the current date if the pubdate has not been set.
         */
        publishedAtPlaceholder: function () {
            var pubDate = this.get('published_at');
            if (pubDate) {
                return formatDate(pubDate);
            }
            return formatDate(moment());
        }.property('publishedAtValue'),
        publishedAtValue: boundOneWay('published_at', formatDate),

        slugValue: boundOneWay('slug'),
        //Lazy load the slug generator for slugPlaceholder
        slugGenerator: Ember.computed(function () {
            return SlugGenerator.create({
                ghostPaths: this.get('ghostPaths'),
                slugType: 'post'
            });
        }),
        //Requests slug from title
        generateSlugPlaceholder: function () {
            var self = this,
                title = this.get('titleScratch');

            this.get('slugGenerator').generateSlug(title).then(function (slug) {
                self.set('slugPlaceholder', slug);
            });
        },
        titleObserver: function () {
            if (this.get('isNew') && !this.get('title')) {
                Ember.run.debounce(this, 'generateSlugPlaceholder', 700);
            }
        },
        slugPlaceholder: function (key, value) {
            var slug = this.get('slug');

            //If the post has a slug, that's its placeholder.
            if (slug) {
                return slug;
            }

            //Otherwise, it's whatever value was set by the
            //  slugGenerator (below)
            if (arguments.length > 1) {
                return value;
            }
            //The title will stand in until the actual slug has been generated
            return this.get('titleScratch');
        }.property(),

        showErrors: function (errors) {
            errors = Ember.isArray(errors) ? errors : [errors];
            this.notifications.showErrors(errors);
        },
        showSuccess: function (message) {
            this.notifications.showSuccess(message);
        },
        actions: {
            togglePage: function () {
                var self = this;

                this.toggleProperty('page');
                // If this is a new post.  Don't save the model.  Defer the save
                // to the user pressing the save button
                if (this.get('isNew')) {
                    return;
                }

                this.get('model').save(this.get('saveOptions')).catch(function (errors) {
                    self.showErrors(errors);
                    self.get('model').rollback();
                });
            },
            /**
             * triggered by user manually changing slug
             */
            updateSlug: function (newSlug) {
                var slug = this.get('slug'),
                    self = this;

                newSlug = newSlug || slug;

                newSlug = newSlug.trim();

                // Ignore unchanged slugs or candidate slugs that are empty
                if (!newSlug || slug === newSlug) {
                    return;
                }

                this.get('slugGenerator').generateSlug(newSlug).then(function (serverSlug) {
                    // If after getting the sanitized and unique slug back from the API
                    // we end up with a slug that matches the existing slug, abort the change
                    if (serverSlug === slug) {
                        return;
                    }

                    // Because the server transforms the candidate slug by stripping
                    // certain characters and appending a number onto the end of slugs
                    // to enforce uniqueness, there are cases where we can get back a
                    // candidate slug that is a duplicate of the original except for
                    // the trailing incrementor (e.g., this-is-a-slug and this-is-a-slug-2)

                    // get the last token out of the slug candidate and see if it's a number
                    var slugTokens = serverSlug.split('-'),
                        check = Number(slugTokens.pop());

                    // if the candidate slug is the same as the existing slug except
                    // for the incrementor then the existing slug should be used
                    if (_.isNumber(check) && check > 0) {
                        if (slug === slugTokens.join('-') && serverSlug !== newSlug) {
                            return;
                        }
                    }

                    self.set('slug', serverSlug);

                    if (self.hasObserverFor('titleScratch')) {
                        self.removeObserver('titleScratch', self, 'titleObserver');
                    }

                    // If this is a new post.  Don't save the model.  Defer the save
                    // to the user pressing the save button
                    if (self.get('isNew')) {
                        return;
                    }

                    return self.get('model').save(self.get('saveOptions'));
                }).then(function () {
                    self.showSuccess('Permalink successfully changed to <strong>' +
                        self.get('slug') + '</strong>.');
                }).catch(function (errors) {
                    self.showErrors(errors);
                    self.get('model').rollback();
                });
            },

            /**
             * Parse user's set published date.
             * Action sent by post settings menu view.
             * (#1351)
             */
            setPublishedAt: function (userInput) {
                var errMessage = '',
                    newPublishedAt = parseDateString(userInput),
                    publishedAt = this.get('published_at'),
                    self = this;

                if (!userInput) {
                    //Clear out the published_at field for a draft
                    if (this.get('isDraft')) {
                        this.set('published_at', null);
                    }
                    return;
                }

                // Validate new Published date
                if (!newPublishedAt.isValid()) {
                    errMessage = 'Published Date must be a valid date with format: ' +
                        'DD MMM YY @ HH:mm (e.g. 6 Dec 14 @ 15:00)';
                }
                if (newPublishedAt.diff(new Date(), 'h') > 0) {
                    errMessage = 'Published Date cannot currently be in the future.';
                }

                //If errors, notify and exit.
                if (errMessage) {
                    this.showErrors(errMessage);
                    return;
                }

                // Do nothing if the user didn't actually change the date
                if (publishedAt && publishedAt.isSame(newPublishedAt)) {
                    return;
                }

                //Validation complete
                this.set('published_at', newPublishedAt);

                // If this is a new post.  Don't save the model.  Defer the save
                // to the user pressing the save button
                if (this.get('isNew')) {
                    return;
                }

                this.get('model').save(this.get('saveOptions')).catch(function (errors) {
                    self.showErrors(errors);
                    self.get('model').rollback();
                });
            }
        }
    });

    __exports__["default"] = PostSettingsMenuController;
  });
define("ghost/controllers/post-tags-input", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var PostTagsInputController = Ember.Controller.extend({

        tagEnteredOrder: Ember.A(),

        tags: Ember.computed('parentController.tags', function () {
            var proxyTags = Ember.ArrayProxy.create({
                content: this.get('parentController.tags')
            }),

            temp = proxyTags.get('arrangedContent').slice();

            proxyTags.get('arrangedContent').clear();

            this.get('tagEnteredOrder').forEach(function (tagName) {
                var tag = temp.find(function (tag) {
                    return tag.get('name') === tagName;
                });

                if (tag) {
                    proxyTags.get('arrangedContent').addObject(tag);
                    temp.removeObject(tag);
                }
            });

            temp.forEach(function (tag) {
                proxyTags.get('arrangedContent').addObject(tag);
            });

            return proxyTags;
        }),

        suggestions: null,
        newTagText: null,

        actions: {
            // triggered when the view is inserted so that later store.all('tag')
            // queries hit a full store cache and we don't see empty or out-of-date
            // suggestion lists
            loadAllTags: function () {
                this.store.find('tag');
            },

            addNewTag: function () {
                var newTagText = this.get('newTagText'),
                    searchTerm,
                    existingTags,
                    newTag;

                if (Ember.isEmpty(newTagText) || this.hasTag(newTagText)) {
                    this.send('reset');
                    return;
                }

                searchTerm = newTagText.toLowerCase();

                // add existing tag if we have a match
                existingTags = this.store.all('tag').filter(function (tag) {
                    return tag.get('name').toLowerCase() === searchTerm;
                });
                if (existingTags.get('length')) {
                    this.send('addTag', existingTags.get('firstObject'));
                } else {
                    // otherwise create a new one
                    newTag = this.store.createRecord('tag');
                    newTag.set('name', newTagText);

                    this.send('addTag', newTag);
                }

                this.send('reset');
            },

            addTag: function (tag) {
                if (!Ember.isEmpty(tag)) {
                    this.get('tags').addObject(tag);
                    this.get('tagEnteredOrder').addObject(tag.get('name'));
                }

                this.send('reset');
            },

            deleteTag: function (tag) {
                this.get('tags').removeObject(tag);
                this.get('tagEnteredOrder').removeObject(tag.get('name'));
            },

            deleteLastTag: function () {
                this.send('deleteTag', this.get('tags.lastObject'));
            },

            selectSuggestion: function (suggestion) {
                if (!Ember.isEmpty(suggestion)) {
                    this.get('suggestions').setEach('selected', false);
                    suggestion.set('selected', true);
                }
            },

            selectNextSuggestion: function () {
                var suggestions = this.get('suggestions'),
                    selectedSuggestion = this.get('selectedSuggestion'),
                    currentIndex,
                    newSelection;

                if (!Ember.isEmpty(suggestions)) {
                    currentIndex = suggestions.indexOf(selectedSuggestion);
                    if (currentIndex + 1 < suggestions.get('length')) {
                        newSelection = suggestions[currentIndex + 1];
                        this.send('selectSuggestion', newSelection);
                    } else {
                        suggestions.setEach('selected', false);
                    }
                }
            },

            selectPreviousSuggestion: function () {
                var suggestions = this.get('suggestions'),
                    selectedSuggestion = this.get('selectedSuggestion'),
                    currentIndex,
                    lastIndex,
                    newSelection;

                if (!Ember.isEmpty(suggestions)) {
                    currentIndex = suggestions.indexOf(selectedSuggestion);
                    if (currentIndex === -1) {
                        lastIndex = suggestions.get('length') - 1;
                        this.send('selectSuggestion', suggestions[lastIndex]);
                    } else if (currentIndex - 1 >= 0) {
                        newSelection = suggestions[currentIndex - 1];
                        this.send('selectSuggestion', newSelection);
                    } else {
                        suggestions.setEach('selected', false);
                    }
                }
            },

            addSelectedSuggestion: function () {
                var suggestion = this.get('selectedSuggestion');
                if (Ember.isEmpty(suggestion)) { return; }

                this.send('addTag', suggestion.get('tag'));
            },

            reset: function () {
                this.set('suggestions', null);
                this.set('newTagText', null);
            }
        },


        selectedSuggestion: function () {
            var suggestions = this.get('suggestions');
            if (suggestions && suggestions.get('length')) {
                return suggestions.filterBy('selected').get('firstObject');
            } else {
                return null;
            }
        }.property('suggestions.@each.selected'),


        updateSuggestionsList: function () {
            var searchTerm = this.get('newTagText'),
                matchingTags,
                // Limit the suggestions number
                maxSuggestions = 5,
                suggestions = new Ember.A();

            if (!searchTerm || Ember.isEmpty(searchTerm.trim())) {
                this.set('suggestions', null);
                return;
            }

            searchTerm = searchTerm.trim();

            matchingTags = this.findMatchingTags(searchTerm);
            matchingTags = matchingTags.slice(0, maxSuggestions);
            matchingTags.forEach(function (matchingTag) {
                var suggestion = this.makeSuggestionObject(matchingTag, searchTerm);
                suggestions.pushObject(suggestion);
            }, this);

            this.set('suggestions', suggestions);
        }.observes('newTagText'),


        findMatchingTags: function (searchTerm) {
            var matchingTags,
                self = this,
                allTags = this.store.all('tag');

            if (allTags.get('length') === 0) {
                return [];
            }

            searchTerm = searchTerm.toLowerCase();

            matchingTags = allTags.filter(function (tag) {
                var tagNameMatches,
                    hasAlreadyBeenAdded;

                tagNameMatches = tag.get('name').toLowerCase().indexOf(searchTerm) !== -1;
                hasAlreadyBeenAdded = self.hasTag(tag.get('name'));

                return tagNameMatches && !hasAlreadyBeenAdded;
            });

            return matchingTags;
        },

        hasTag: function (tagName) {
            return this.get('tags').mapBy('name').contains(tagName);
        },

        makeSuggestionObject: function (matchingTag, _searchTerm) {
            var searchTerm = Ember.Handlebars.Utils.escapeExpression(_searchTerm),
                regexEscapedSearchTerm = searchTerm.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'),
                tagName = Ember.Handlebars.Utils.escapeExpression(matchingTag.get('name')),
                regex = new RegExp('(' + regexEscapedSearchTerm + ')', 'gi'),
                highlightedName,
                suggestion = new Ember.Object();

            highlightedName = tagName.replace(regex, '<mark>$1</mark>');
            highlightedName = new Ember.Handlebars.SafeString(highlightedName);

            suggestion.set('tag', matchingTag);
            suggestion.set('highlightedName', highlightedName);

            return suggestion;
        },

    });

    __exports__["default"] = PostTagsInputController;
  });
define("ghost/controllers/posts", 
  ["ghost/mixins/pagination-controller","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var PaginationControllerMixin = __dependency1__["default"];

    function publishedAtCompare(item1, item2) {
        var published1 = item1.get('published_at'),
            published2 = item2.get('published_at');

        if (!published1 && !published2) {
            return 0;
        }

        if (!published1 && published2) {
            return -1;
        }

        if (!published2 && published1) {
            return 1;
        }

        return Ember.compare(published1.valueOf(), published2.valueOf());
    }


    var PostsController = Ember.ArrayController.extend(PaginationControllerMixin, {
        // this will cause the list to re-sort when any of these properties change on any of the models
        sortProperties: ['status', 'published_at', 'updated_at'],

        // override Ember.SortableMixin
        //
        // this function will keep the posts list sorted when loading individual/bulk
        // models from the server, even if records in between haven't been loaded.
        // this can happen when reloading the page on the Editor or PostsPost routes.
        //
        // a custom sort function is needed in order to sort the posts list the same way the server would:
        //     status: ASC
        //     published_at: DESC
        //     updated_at: DESC
        orderBy: function (item1, item2) {
            var updated1 = item1.get('updated_at'),
                updated2 = item2.get('updated_at'),
                statusResult,
                updatedAtResult,
                publishedAtResult;

            // when `updated_at` is undefined, the model is still
            // being written to with the results from the server
            if (item1.get('isNew') || !updated1) {
                return -1;
            }

            if (item2.get('isNew') || !updated2) {
                return 1;
            }

            statusResult = Ember.compare(item1.get('status'), item2.get('status'));
            updatedAtResult = Ember.compare(updated1.valueOf(), updated2.valueOf());
            publishedAtResult = publishedAtCompare(item1, item2);

            if (statusResult === 0) {
                if (publishedAtResult === 0) {
                    // This should be DESC
                    return updatedAtResult * -1;
                }
                // This should be DESC
                return publishedAtResult * -1;
            }

            return statusResult;
        },

        init: function () {
            //let the PaginationControllerMixin know what type of model we will be paginating
            //this is necesariy because we do not have access to the model inside the Controller::init method
            this._super({'modelType': 'post'});

        },

        actions: {
            resetContentPreview: function () {
                $('.content-list').removeAttr('style');
                $('.content-preview').removeAttr('style');
            },

            showContentPreview: function () {
                $('.content-list').animate({right: '100%', left: '-100%', 'margin-right': '15px'}, 300);
                $('.content-preview').animate({right: '0', left: '0', 'margin-left': '0'}, 300);
            },

            hideContentPreview: function () {
                $('.content-list').animate({right: '0', left: '0', 'margin-right': '0'}, 300);
                $('.content-preview').animate({right: '-100%', left: '100%', 'margin-left': '15px'}, 300);
            },
        }
    });

    __exports__["default"] = PostsController;
  });
define("ghost/controllers/posts/post", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var PostController = Ember.ObjectController.extend({
        isPublished: Ember.computed.equal('status', 'published'),
        classNameBindings: ['featured'],

        actions: {
            toggleFeatured: function () {
                var options = {disableNProgress: true},
                    self = this;

                this.toggleProperty('featured');
                this.get('model').save(options).catch(function (errors) {
                    self.notifications.showErrors(errors);
                });
            }
        }
    });

    __exports__["default"] = PostController;
  });
define("ghost/controllers/reset", 
  ["ghost/utils/ajax","ghost/mixins/validation-engine","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    /*global console*/
    /* jshint unused: false */
    var ajax = __dependency1__["default"];

    var ValidationEngine = __dependency2__["default"];

    
    var ResetController = Ember.Controller.extend(ValidationEngine, {
        passwords: {
            newPassword: '',
            ne2Password: ''
        },
        token: '',
        submitButtonDisabled: false,
    
        validationType: 'reset',
    
        actions: {
            submit: function () {
                var self = this,
                    data = self.getProperties('passwords', 'token');
    
                this.toggleProperty('submitting');
                this.validate({format: false}).then(function () {
                    ajax({
                        url: self.get('ghostPaths.url').api('authentication', 'passwordreset'),
                        type: 'PUT',
                        data: {
                            passwordreset: [{
                                newPassword: data.passwords.newPassword,
                                ne2Password: data.passwords.ne2Password,
                                token: data.token
                            }]
                        }
                    }).then(function (resp) {
                        self.toggleProperty('submitting');
                        self.notifications.showSuccess(resp.passwordreset[0].message, true);
                        self.transitionToRoute('signin');
                    }).catch(function (response) {
                        self.notifications.showAPIError(response);
                        self.toggleProperty('submitting');
                    });
                }).catch(function (error) {
                    self.toggleProperty('submitting');
                    self.notifications.showErrors(error);
                });
            }
        }
    });
    
    __exports__["default"] = ResetController;
  });
define("ghost/controllers/settings", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var SettingsController = Ember.Controller.extend({
        showApps: Ember.computed.bool('config.apps')
    });

    __exports__["default"] = SettingsController;
  });
define("ghost/controllers/settings/app", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /*global alert */

    var AppStates = {
        active: 'active',
        working: 'working',
        inactive: 'inactive'
    };

    var SettingsAppController = Ember.ObjectController.extend({
        appState: AppStates.active,
        buttonText: '',
        
        setAppState: function () {
            this.set('appState', this.get('active') ? AppStates.active : AppStates.inactive);
        }.on('init'),

        buttonTextSetter: function () {
            switch (this.get('appState')) {
                case AppStates.active:
                    this.set('buttonText', 'Deactivate');
                    break;
                case AppStates.inactive:
                    this.set('buttonText', 'Activate');
                    break;
                case AppStates.working:
                    this.set('buttonText', 'Working');
                    break;
            }
        }.observes('appState').on('init'),

        activeClass: function () {
            return this.appState === AppStates.active ? true : false;
        }.property('appState'),

        inactiveClass: function () {
            return this.appState === AppStates.inactive ? true : false;
        }.property('appState'),

        actions: {
            toggleApp: function (app) {
                var self = this;
                this.set('appState', AppStates.working);
                
                app.set('active', !app.get('active'));
                
                app.save().then(function () {
                    self.setAppState();
                })
                .then(function () {
                    alert('@TODO: Success');
                })
                .catch(function () {
                    alert('@TODO: Failure');
                });
            }
        }
    });

    __exports__["default"] = SettingsAppController;
  });
define("ghost/controllers/settings/general", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var SettingsGeneralController = Ember.ObjectController.extend({
        isDatedPermalinks: function (key, value) {
            // setter
            if (arguments.length > 1) {
                this.set('permalinks', value ? '/:year/:month/:day/:slug/' : '/:slug/');
            }

            // getter
            var slugForm = this.get('permalinks');

            return slugForm !== '/:slug/';
        }.property('permalinks'),

        themes: function () {
            return this.get('availableThemes').reduce(function (themes, t) {
                var theme = {};

                theme.name = t.name;
                theme.label = t.package ? t.package.name + ' - ' + t.package.version : t.name;
                theme.package = t.package;
                theme.active = !!t.active;

                themes.push(theme);

                return themes;
            }, []);
        }.property().readOnly(),

        actions: {
            save: function () {
                var self = this;

                return this.get('model').save().then(function (model) {
                    self.notifications.showSuccess('Settings successfully saved.');

                    return model;
                }).catch(function (errors) {
                    self.notifications.showErrors(errors);
                });
            },
        }
    });

    __exports__["default"] = SettingsGeneralController;
  });
define("ghost/controllers/settings/users/index", 
  ["ghost/mixins/pagination-controller","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var PaginationControllerMixin = __dependency1__["default"];

    var UsersIndexController = Ember.ArrayController.extend(PaginationControllerMixin, {
        init: function () {
            //let the PaginationControllerMixin know what type of model we will be paginating
            //this is necessary because we do not have access to the model inside the Controller::init method
            this._super({'modelType': 'user'});
        },

        users: Ember.computed.alias('model'),

        activeUsers: Ember.computed.filter('users', function (user) {
            return /^active|warn-[1-4]|locked$/.test(user.get('status'));
        }),

        invitedUsers: Ember.computed.filter('users', function (user) {
            var status = user.get('status');

            return status === 'invited' || status === 'invited-pending';
        })
    });

    __exports__["default"] = UsersIndexController;
  });
define("ghost/controllers/settings/users/user", 
  ["ghost/models/slug-generator","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var SlugGenerator = __dependency1__["default"];

    var SettingsUserController = Ember.ObjectController.extend({

        _lastSlug: null,

        updateLastSlug: Ember.observer(function () {
            this.set('_lastSlug', this.get('user.slug'));
        }),

        user: Ember.computed.alias('model'),

        email: Ember.computed.readOnly('user.email'),

        coverDefault: function () {
            return this.get('ghostPaths.url').asset('/shared/img/user-cover.png');
        }.property('ghostPaths'),

        userDefault: function () {
            return this.get('ghostPaths.url').asset('/shared/img/user-image.png');
        }.property('ghostPaths'),

        cover: function () {
            var cover = this.get('user.cover');
            if (Ember.isBlank(cover)) {
                cover = this.get('coverDefault');
            }
            return cover;
        }.property('user.cover', 'coverDefault'),

        coverTitle: function () {
            return this.get('user.name') + '\'s Cover Image';
        }.property('user.name'),

        image: function () {
            return  'background-image: url(' + this.get('imageUrl') + ')';
        }.property('imageUrl'),

        imageUrl: function () {
            return this.get('user.image') || this.get('userDefault');
        }.property('user.image'),

        last_login: function () {
            var lastLogin = this.get('user.last_login');

            return lastLogin ? lastLogin.fromNow() : '';
        }.property('user.last_login'),

        created_at: function () {
            var createdAt = this.get('user.created_at');

            return createdAt ? createdAt.fromNow() : '';
        }.property('user.created_at'),

        //Lazy load the slug generator for slugPlaceholder
        slugGenerator: Ember.computed(function () {
            return SlugGenerator.create({
                ghostPaths: this.get('ghostPaths'),
                slugType: 'user'
            });
        }),

        actions: {
            changeRole: function (newRole) {
                this.set('model.role', newRole);
            },
            revoke: function () {
                var self = this,
                    model = this.get('model'),
                    email = this.get('email');

                //reload the model to get the most up-to-date user information
                model.reload().then(function () {
                    if (self.get('invited')) {
                        model.destroyRecord().then(function () {
                            var notificationText = 'Invitation revoked. (' + email + ')';
                            self.notifications.showSuccess(notificationText, false);
                        }).catch(function (error) {
                            self.notifications.showAPIError(error);
                        });
                    } else {
                        //if the user is no longer marked as "invited", then show a warning and reload the route
                        self.get('target').send('reload');
                        self.notifications.showError('This user has already accepted the invitation.', {delayed: 500});
                    }
                });
            },

            resend: function () {
                var self = this;

                this.get('model').resendInvite().then(function (result) {
                    var notificationText = 'Invitation resent! (' + self.get('email') + ')';
                    // If sending the invitation email fails, the API will still return a status of 201
                    // but the user's status in the response object will be 'invited-pending'.
                    if (result.users[0].status === 'invited-pending') {
                        self.notifications.showWarn('Invitation email was not sent.  Please try resending.');
                    } else {
                        self.get('model').set('status', result.users[0].status);
                        self.notifications.showSuccess(notificationText);
                    }
                }).catch(function (error) {
                    self.notifications.showAPIError(error);
                });
            },

            save: function () {
                var user = this.get('user'),
                    self = this;

                user.save({ format: false }).then(function (model) {
                    self.notifications.showSuccess('Settings successfully saved.');

                    return model;
                }).catch(function (errors) {
                    self.notifications.showErrors(errors);
                });
            },

            password: function () {
                var user = this.get('user'),
                    self = this;

                if (user.get('isPasswordValid')) {
                    user.saveNewPassword().then(function (model) {

                        // Clear properties from view
                        user.setProperties({
                            'password': '',
                            'newPassword': '',
                            'ne2Password': ''
                        });

                        self.notifications.showSuccess('Password updated.');

                        return model;
                    }).catch(function (errors) {
                        self.notifications.showAPIError(errors);
                    });
                } else {
                    self.notifications.showErrors(user.get('passwordValidationErrors'));
                }
            },

            updateSlug: function (newSlug) {
                var slug = this.get('_lastSlug'),
                    self = this;

                newSlug = newSlug || slug;

                newSlug = newSlug.trim();

                // Ignore unchanged slugs or candidate slugs that are empty
                if (!newSlug || slug === newSlug) {
                    return;
                }

                this.get('slugGenerator').generateSlug(newSlug).then(function (serverSlug) {

                    // If after getting the sanitized and unique slug back from the API
                    // we end up with a slug that matches the existing slug, abort the change
                    if (serverSlug === slug) {
                        return;
                    }

                    // Because the server transforms the candidate slug by stripping
                    // certain characters and appending a number onto the end of slugs
                    // to enforce uniqueness, there are cases where we can get back a
                    // candidate slug that is a duplicate of the original except for
                    // the trailing incrementor (e.g., this-is-a-slug and this-is-a-slug-2)

                    // get the last token out of the slug candidate and see if it's a number
                    var slugTokens = serverSlug.split('-'),
                        check = Number(slugTokens.pop());

                    // if the candidate slug is the same as the existing slug except
                    // for the incrementor then the existing slug should be used
                    if (_.isNumber(check) && check > 0) {
                        if (slug === slugTokens.join('-') && serverSlug !== newSlug) {
                            return;
                        }
                    }

                    self.set('_lastSlug', serverSlug);
                });
            }
        }
    });

    __exports__["default"] = SettingsUserController;
  });
define("ghost/controllers/setup", 
  ["ghost/utils/ajax","ghost/mixins/validation-engine","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var ajax = __dependency1__["default"];
    var ValidationEngine = __dependency2__["default"];

    var SetupController = Ember.ObjectController.extend(ValidationEngine, {
        blogTitle: null,
        name: null,
        email: null,
        password: null,
        submitting: false,

        // ValidationEngine settings
        validationType: 'setup',

        actions: {
            setup: function () {
                var self = this,
                    data = self.getProperties('blogTitle', 'name', 'email', 'password');

                self.notifications.closePassive();

                this.toggleProperty('submitting');
                this.validate({ format: false }).then(function () {
                    ajax({
                        url: self.get('ghostPaths.url').api('authentication', 'setup'),
                        type: 'POST',
                        data: {
                            setup: [{
                                name: data.name,
                                email: data.email,
                                password: data.password,
                                blogTitle: data.blogTitle
                            }]
                        }
                    }).then(function () {
                        self.get('session').authenticate('simple-auth-authenticator:oauth2-password-grant', {
                            identification: self.get('email'),
                            password: self.get('password')
                        });
                    }, function (resp) {
                        self.toggleProperty('submitting');
                        self.notifications.showAPIError(resp);
                    });
                }, function (errors) {
                    self.toggleProperty('submitting');
                    self.notifications.showErrors(errors);
                });
            }
        }
    });

    __exports__["default"] = SetupController;
  });
define("ghost/controllers/signin", 
  ["ghost/mixins/validation-engine","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var ValidationEngine = __dependency1__["default"];

    var SigninController = Ember.Controller.extend(SimpleAuth.AuthenticationControllerMixin, ValidationEngine, {
        authenticator: 'simple-auth-authenticator:oauth2-password-grant',

        validationType: 'signin',

        actions: {
            authenticate: function () {
                var data = this.getProperties('identification', 'password');

                return this._super(data);
            },

            validateAndAuthenticate: function () {
                var self = this;

                this.validate({ format: false }).then(function () {
                    self.notifications.closePassive();
                    self.send('authenticate');
                }).catch(function (errors) {
                    self.notifications.showErrors(errors);
                });
            }
        }
    });

    __exports__["default"] = SigninController;
  });
define("ghost/controllers/signup", 
  ["ghost/utils/ajax","ghost/mixins/validation-engine","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var ajax = __dependency1__["default"];
    var ValidationEngine = __dependency2__["default"];

    var SignupController = Ember.ObjectController.extend(ValidationEngine, {
        name: null,
        email: null,
        password: null,
        token: null,
        submitting: false,

        // ValidationEngine settings
        validationType: 'signup',

        actions: {
            signup: function () {
                var self = this,
                    data = self.getProperties('name', 'email', 'password', 'token');

                self.notifications.closePassive();

                this.toggleProperty('submitting');
                this.validate({ format: false }).then(function () {
                    ajax({
                        url: self.get('ghostPaths.url').api('authentication', 'invitation'),
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            invitation: [{
                                name: data.name,
                                email: data.email,
                                password: data.password,
                                token: data.token
                            }]
                        }
                    }).then(function () {
                        self.get('session').authenticate('simple-auth-authenticator:oauth2-password-grant', {
                            identification: self.get('email'),
                            password: self.get('password')
                        });
                    }, function (resp) {
                        self.toggleProperty('submitting');
                        self.notifications.showAPIError(resp);
                    });
                }, function (errors) {
                    self.toggleProperty('submitting');
                    self.notifications.showErrors(errors);
                });
            }
        }
    });

    __exports__["default"] = SignupController;
  });
define("ghost/helpers/gh-blog-url", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var blogUrl = Ember.Handlebars.makeBoundHelper(function () {

        return new Ember.Handlebars.SafeString(this.get('config.blogUrl'));
    });

    __exports__["default"] = blogUrl;
  });
define("ghost/helpers/gh-count-characters", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var countCharacters = Ember.Handlebars.makeBoundHelper(function (content) {
        var el = document.createElement('span'),
            length = content ? content.length : 0;

        el.className = 'word-count';
        if (length > 180) {
            el.style.color = '#E25440';
        } else {
            el.style.color = '#9E9D95';
        }

        el.innerHTML = 200 - length;

        return new Ember.Handlebars.SafeString(el.outerHTML);
    });

    __exports__["default"] = countCharacters;
  });
define("ghost/helpers/gh-count-words", 
  ["ghost/utils/word-count","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var counter = __dependency1__["default"];

    var countWords = Ember.Handlebars.makeBoundHelper(function (markdown) {
        if (/^\s*$/.test(markdown)) {
            return '0 words';
        }

        var count = counter(markdown || '');
        return count + (count === 1 ? ' word' : ' words');
    });

    __exports__["default"] = countWords;
  });
define("ghost/helpers/gh-format-html", 
  ["ghost/utils/caja-sanitizers","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /* global Handlebars, html_sanitize*/
    var cajaSanitizers = __dependency1__["default"];

    var formatHTML = Ember.Handlebars.makeBoundHelper(function (html) {
        var escapedhtml = html || '';

        // replace script and iFrame
        escapedhtml = escapedhtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            '<pre class="js-embed-placeholder">Embedded JavaScript</pre>');
        escapedhtml = escapedhtml.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
            '<pre class="iframe-embed-placeholder">Embedded iFrame</pre>');

        // sanitize HTML
        escapedhtml = html_sanitize(escapedhtml, cajaSanitizers.url, cajaSanitizers.id);
        return new Handlebars.SafeString(escapedhtml);
    });

    __exports__["default"] = formatHTML;
  });
define("ghost/helpers/gh-format-markdown", 
  ["ghost/utils/caja-sanitizers","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /* global Showdown, Handlebars, html_sanitize*/
    var cajaSanitizers = __dependency1__["default"];

    var showdown = new Showdown.converter({extensions: ['ghostimagepreview', 'ghostgfm']});

    var formatMarkdown = Ember.Handlebars.makeBoundHelper(function (markdown) {
        var escapedhtml = '';

        // convert markdown to HTML
        escapedhtml = showdown.makeHtml(markdown || '');

        // replace script and iFrame
        escapedhtml = escapedhtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            '<pre class="js-embed-placeholder">Embedded JavaScript</pre>');
        escapedhtml = escapedhtml.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
            '<pre class="iframe-embed-placeholder">Embedded iFrame</pre>');

        // sanitize html
        escapedhtml = html_sanitize(escapedhtml, cajaSanitizers.url, cajaSanitizers.id);
        return new Handlebars.SafeString(escapedhtml);
    });

    __exports__["default"] = formatMarkdown;
  });
define("ghost/helpers/gh-format-timeago", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /* global moment */
    var formatTimeago = Ember.Handlebars.makeBoundHelper(function (timeago) {
        return moment(timeago).fromNow();
        // stefanpenner says cool for small number of timeagos.
        // For large numbers moment sucks => single Ember.Object based clock better
        // https://github.com/manuelmitasch/ghost-admin-ember-demo/commit/fba3ab0a59238290c85d4fa0d7c6ed1be2a8a82e#commitcomment-5396524
    });

    __exports__["default"] = formatTimeago;
  });
define("ghost/initializers/authentication", 
  ["ghost/utils/ghost-paths","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var ghostPaths = __dependency1__["default"];

    var Ghost = ghostPaths();

    var AuthenticationInitializer = {

        name: 'authentication',
        before: 'simple-auth',
        after: 'registerTrailingLocationHistory',

        initialize: function (container) {
            window.ENV = window.ENV || {};
            window.ENV['simple-auth'] = {
                authenticationRoute: 'signin',
                routeAfterAuthentication: 'content',
                authorizer: 'simple-auth-authorizer:oauth2-bearer'
            };
            SimpleAuth.Session.reopen({
                user: function () {
                    return container.lookup('store:main').find('user', 'me');
                }.property()
            });
            SimpleAuth.Authenticators.OAuth2.reopen({
                serverTokenEndpoint: Ghost.apiRoot + '/authentication/token',
                refreshAccessTokens: true,
                makeRequest: function (url, data) {
                    data.client_id = 'ghost-admin';
                    return this._super(url, data);
                }
            });
        }
    };

    __exports__["default"] = AuthenticationInitializer;
  });
define("ghost/initializers/ghost-config", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var ConfigInitializer = {
        name: 'config',

        initialize: function (container, application) {
            var apps = $('body').data('apps'),
                fileStorage = $('body').data('filestorage'),
                blogUrl = $('body').data('blogurl');

            application.register(
                'ghost:config', {apps: apps, fileStorage: fileStorage, blogUrl: blogUrl}, {instantiate: false}
            );

            application.inject('route', 'config', 'ghost:config');
            application.inject('controller', 'config', 'ghost:config');
            application.inject('component', 'config', 'ghost:config');
        }
    };

    __exports__["default"] = ConfigInitializer;
  });
define("ghost/initializers/ghost-paths", 
  ["ghost/utils/ghost-paths","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var ghostPaths = __dependency1__["default"];

    var ghostPathsInitializer = {
        name: 'ghost-paths',
        after: 'store',

        initialize: function (container, application) {
            application.register('ghost:paths', ghostPaths(), { instantiate: false });

            application.inject('route', 'ghostPaths', 'ghost:paths');
            application.inject('model', 'ghostPaths', 'ghost:paths');
            application.inject('controller', 'ghostPaths', 'ghost:paths');
        }
    };

    __exports__["default"] = ghostPathsInitializer;
  });
define("ghost/initializers/notifications", 
  ["ghost/utils/notifications","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Notifications = __dependency1__["default"];

    var injectNotificationsInitializer = {
        name: 'injectNotifications',
        before: 'authentication',

        initialize: function (container, application) {
            application.register('notifications:main', Notifications);

            application.inject('controller', 'notifications', 'notifications:main');
            application.inject('component', 'notifications', 'notifications:main');
            application.inject('router', 'notifications', 'notifications:main');
            application.inject('route', 'notifications', 'notifications:main');
        }
    };

    __exports__["default"] = injectNotificationsInitializer;
  });
define("ghost/initializers/popover", 
  ["ghost/mixins/body-event-listener","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var BodyEventListener = __dependency1__["default"];

    var PopoverService = Ember.Object.extend(Ember.Evented, BodyEventListener, {
        bodyClick: function (event) {
            /*jshint unused:false */
            this.closePopovers();
        },
        closePopovers: function () {
            this.trigger('close');
        },
        togglePopover: function (popoverName, popoverButton) {
            this.trigger('toggle', {target: popoverName, button: popoverButton});
        }
    });

    var popoverInitializer = {
        name: 'popover',

        initialize: function (container, application) {
            application.register('popover:service', PopoverService);

            application.inject('component:gh-popover', 'popover', 'popover:service');
            application.inject('component:gh-popover-button', 'popover', 'popover:service');
            application.inject('controller:modals.delete-post', 'popover', 'popover:service');
            application.inject('controller:modals.transfer-owner', 'popover', 'popover:service');
            application.inject('route:application', 'popover', 'popover:service');
        }
    };

    __exports__["default"] = popoverInitializer;
  });
define("ghost/initializers/store-injector", 
  ["exports"],
  function(__exports__) {
    "use strict";
    //Used to surgically insert the store into things that wouldn't normally have them.
    var StoreInjector = {
        name: 'store-injector',
        after: 'store',
        initialize: function (container, application) {
            application.inject('component:gh-role-selector', 'store', 'store:main');
        }
    };

    __exports__["default"] = StoreInjector;
  });
define("ghost/initializers/trailing-history", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /*global Ember */

    var trailingHistory = Ember.HistoryLocation.extend({
        formatURL: function () {
            return this._super.apply(this, arguments).replace(/\/?$/, '/');
        }
    });

    var registerTrailingLocationHistory = {
        name: 'registerTrailingLocationHistory',

        initialize: function (container, application) {
            application.register('location:trailing-history', trailingHistory);
        }
    };

    __exports__["default"] = registerTrailingLocationHistory;
  });
define("ghost/mixins/body-event-listener", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /*
    Code modified from Addepar/ember-widgets
    https://github.com/Addepar/ember-widgets/blob/master/src/mixins.coffee#L39
    */
    var BodyEventListener = Ember.Mixin.create({
        bodyElementSelector: 'html',
        bodyClick: Ember.K,
        init: function () {
            this._super();
            return Ember.run.next(this, this._setupDocumentHandlers);
        },
        willDestroy: function () {
            this._super();
            return this._removeDocumentHandlers();
        },
        _setupDocumentHandlers: function () {
            if (this._clickHandler) {
                return;
            }
            var self = this;
            this._clickHandler = function () {
                return self.bodyClick();
            };
            return $(this.get('bodyElementSelector')).on('click', this._clickHandler);
        },
        _removeDocumentHandlers: function () {
            $(this.get('bodyElementSelector')).off('click', this._clickHandler);
            this._clickHandler = null;
        },
        /* 
        http://stackoverflow.com/questions/152975/how-to-detect-a-click-outside-an-element
        */
        click: function (event) {
            return event.stopPropagation();
        }
    });

    __exports__["default"] = BodyEventListener;
  });
define("ghost/mixins/current-user-settings", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var CurrentUserSettings = Ember.Mixin.create({
    	currentUser: function () {
    		return this.store.find('user', 'me');
    	},

    	transitionAuthor: function () {
    		var self = this;

    		return function (user) {
    			if (user.get('isAuthor')) {
    				return self.transitionTo('settings.users.user', user);
    			}

    			return user;
    		};
    	},

    	transitionEditor: function () {
    		var self = this;

    		return function (user) {
    			if (user.get('isEditor')) {
    				return self.transitionTo('settings.users');
    			}

    			return user;
    		};
    	}
    });

    __exports__["default"] = CurrentUserSettings;
  });
define("ghost/mixins/editor-base-controller", 
  ["ghost/mixins/marker-manager","ghost/models/post","ghost/utils/bound-one-way","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    /* global console */
    var MarkerManager = __dependency1__["default"];
    var PostModel = __dependency2__["default"];
    var boundOneWay = __dependency3__["default"];

    // this array will hold properties we need to watch
    // to know if the model has been changed (`controller.isDirty`)
    var watchedProps = ['scratch', 'model.isDirty'];

    Ember.get(PostModel, 'attributes').forEach(function (name) {
        watchedProps.push('model.' + name);
    });

    // watch if number of tags changes on the model
    watchedProps.push('tags.[]');

    var EditorControllerMixin = Ember.Mixin.create(MarkerManager, {

        needs: ['post-tags-input'],

        init: function () {
            var self = this;

            this._super();

            window.onbeforeunload = function () {
                return self.get('isDirty') ? self.unloadDirtyMessage() : null;
            };
        },
        /**
         * By default, a post will not change its publish state.
         * Only with a user-set value (via setSaveType action)
         * can the post's status change.
         */
        willPublish: boundOneWay('isPublished'),

        // set by the editor route and `isDirty`. useful when checking
        // whether the number of tags has changed for `isDirty`.
        previousTagNames: null,

        tagNames: function () {
            return this.get('tags').mapBy('name');
        }.property('tags.[]'),

        // compares previousTagNames to tagNames
        tagNamesEqual: function () {
            var tagNames = this.get('tagNames'),
                previousTagNames = this.get('previousTagNames'),
                hashCurrent,
                hashPrevious;

            // beware! even if they have the same length,
            // that doesn't mean they're the same.
            if (tagNames.length !== previousTagNames.length) {
                return false;
            }

            // instead of comparing with slow, nested for loops,
            // perform join on each array and compare the strings
            hashCurrent = tagNames.join('');
            hashPrevious = previousTagNames.join('');

            return hashCurrent === hashPrevious;
        },

        // a hook created in editor-route-base's setupController
        modelSaved: function () {
            var model = this.get('model');

            // safer to updateTags on save in one place
            // rather than in all other places save is called
            model.updateTags();

            // set previousTagNames to current tagNames for isDirty check
            this.set('previousTagNames', this.get('tagNames'));

            // `updateTags` triggers `isDirty => true`.
            // for a saved model it would otherwise be false.
            this.set('isDirty', false);
        },

        // an ugly hack, but necessary to watch all the model's properties
        // and more, without having to be explicit and do it manually
        isDirty: Ember.computed.apply(Ember, watchedProps.concat(function (key, value) {
            if (arguments.length > 1) {
                return value;
            }

            var model = this.get('model'),
                markdown = this.get('markdown'),
                title = this.get('title'),
                titleScratch = this.get('titleScratch'),
                scratch = this.getMarkdown().withoutMarkers,
                changedAttributes;

            if (!this.tagNamesEqual()) {
                return true;
            }

            if (titleScratch !== title) {
                return true;
            }

            // since `scratch` is not model property, we need to check
            // it explicitly against the model's markdown attribute
            if (markdown !== scratch) {
                return true;
            }

            // models created on the client always return `isDirty: true`,
            // so we need to see which properties have actually changed.
            if (model.get('isNew')) {
                changedAttributes = Ember.keys(model.changedAttributes());

                if (changedAttributes.length) {
                    return true;
                }

                return false;
            }

            // even though we use the `scratch` prop to show edits,
            // which does *not* change the model's `isDirty` property,
            // `isDirty` will tell us if the other props have changed,
            // as long as the model is not new (model.isNew === false).
            if (model.get('isDirty')) {
                return true;
            }

            return false;
        })),

        // used on window.onbeforeunload
        unloadDirtyMessage: function () {
            return '==============================\n\n' +
                'Hey there! It looks like you\'re in the middle of writing' +
                ' something and you haven\'t saved all of your content.' +
                '\n\nSave before you go!\n\n' +
                '==============================';
        },

        //TODO: This has to be moved to the I18n localization file.
        //This structure is supposed to be close to the i18n-localization which will be used soon.
        messageMap: {
            errors: {
                post: {
                    published: {
                        'published': 'Update failed.',
                        'draft': 'Saving failed.'
                    },
                    draft: {
                        'published': 'Publish failed.',
                        'draft': 'Saving failed.'
                    }

                }
            },

            success: {
                post: {
                    published: {
                        'published': 'Updated.',
                        'draft': 'Saved.'
                    },
                    draft: {
                        'published': 'Published!',
                        'draft': 'Saved.'
                    }
                }
            }
        },

        showSaveNotification: function (prevStatus, status, delay) {
            var message = this.messageMap.success.post[prevStatus][status];

            this.notifications.showSuccess(message, { delayed: delay });
        },

        showErrorNotification: function (prevStatus, status, errors, delay) {
            var message = this.messageMap.errors.post[prevStatus][status];

            message += '<br />' + errors[0].message;

            this.notifications.showError(message, { delayed: delay });
        },

        shouldFocusTitle: Ember.computed('model', function () {
            return !!this.get('model.isNew');
        }),

        actions: {
            save: function () {
                var status = this.get('willPublish') ? 'published' : 'draft',
                    prevStatus = this.get('status'),
                    isNew = this.get('isNew'),
                    self = this;

                self.notifications.closePassive();

                // ensure an incomplete tag is finalised before save
                this.get('controllers.post-tags-input').send('addNewTag');

                // Set the properties that are indirected
                // set markdown equal to what's in the editor, minus the image markers.
                this.set('markdown', this.getMarkdown().withoutMarkers);
                this.set('title', this.get('titleScratch'));
                this.set('status', status);

                return this.get('model').save().then(function (model) {
                    self.showSaveNotification(prevStatus, model.get('status'), isNew ? true : false);
                    return model;
                }).catch(function (errors) {
                    self.showErrorNotification(prevStatus, self.get('status'), errors);
                    return Ember.RSVP.reject(errors);
                });
            },

            setSaveType: function (newType) {
                if (newType === 'publish') {
                    this.set('willPublish', true);
                } else if (newType === 'draft') {
                    this.set('willPublish', false);
                } else {
                    console.warn('Received invalid save type; ignoring.');
                }
            },

            // set from a `sendAction` on the codemirror component,
            // so that we get a reference for handling uploads.
            setCodeMirror: function (codemirrorComponent) {
                var codemirror = codemirrorComponent.get('codemirror');

                this.set('codemirrorComponent', codemirrorComponent);
                this.set('codemirror', codemirror);
            },

            // fired from the gh-markdown component when an image upload starts
            disableCodeMirror: function () {
                this.get('codemirrorComponent').disableCodeMirror();
            },

            // fired from the gh-markdown component when an image upload finishes
            enableCodeMirror: function () {
                this.get('codemirrorComponent').enableCodeMirror();
            },

            // Match the uploaded file to a line in the editor, and update that line with a path reference
            // ensuring that everything ends up in the correct place and format.
            handleImgUpload: function (e, result_src) {
                var editor = this.get('codemirror'),
                    line = this.findLine(Ember.$(e.currentTarget).attr('id')),
                    lineNumber = editor.getLineNumber(line),
                    match = line.text.match(/\([^\n]*\)?/),
                    replacement = '(http://)';

                if (match) {
                    // simple case, we have the parenthesis
                    editor.setSelection(
                        {line: lineNumber, ch: match.index + 1},
                        {line: lineNumber, ch: match.index + match[0].length - 1}
                    );
                } else {
                    match = line.text.match(/\]/);
                    if (match) {
                        editor.replaceRange(
                            replacement,
                            {line: lineNumber, ch: match.index + 1},
                            {line: lineNumber, ch: match.index + 1}
                        );
                        editor.setSelection(
                            {line: lineNumber, ch: match.index + 2},
                            {line: lineNumber, ch: match.index + replacement.length }
                        );
                    }
                }
                editor.replaceSelection(result_src);
            }
        }
    });

    __exports__["default"] = EditorControllerMixin;
  });
define("ghost/mixins/editor-base-view", 
  ["ghost/utils/set-scroll-classname","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var setScrollClassName = __dependency1__["default"];

    var EditorViewMixin = Ember.Mixin.create({
        // create a hook for jQuery logic that will run after
        // a view and all child views have been rendered,
        // since didInsertElement runs only when the view's el
        // has rendered, and not necessarily all child views.
        //
        // http://mavilein.github.io/javascript/2013/08/01/Ember-JS-After-Render-Event/
        // http://emberjs.com/api/classes/Ember.run.html#method_next
        scheduleAfterRender: function () {
            Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
        }.on('didInsertElement'),

        // all child views will have rendered when this fires
        afterRenderEvent: function () {
            var $previewViewPort = this.$('.entry-preview-content');

            // cache these elements for use in other methods
            this.set('$previewViewPort', $previewViewPort);
            this.set('$previewContent', this.$('.rendered-markdown'));

            $previewViewPort.scroll(Ember.run.bind($previewViewPort, setScrollClassName, {
                target: this.$('.entry-preview'),
                offset: 10
            }));
        },

        removeScrollHandlers: function () {
            this.get('$previewViewPort').off('scroll');
        }.on('willDestroyElement'),

        // updated when gh-codemirror component scrolls
        markdownScrollInfo: null,

        // percentage of scroll position to set htmlPreview
        scrollPosition: Ember.computed('markdownScrollInfo', function () {
            if (!this.get('markdownScrollInfo')) {
                return 0;
            }

            var scrollInfo = this.get('markdownScrollInfo'),
                codemirror = scrollInfo.codemirror,
                markdownHeight = scrollInfo.height - scrollInfo.clientHeight,
                previewHeight = this.get('$previewContent').height() - this.get('$previewViewPort').height(),
                ratio = previewHeight / markdownHeight,
                previewPosition = scrollInfo.top * ratio,
                isCursorAtEnd = codemirror.getCursor('end').line > codemirror.lineCount() - 5;

            if (isCursorAtEnd) {
                previewPosition = previewHeight + 30;
            }

            return previewPosition;
        })
    });

    __exports__["default"] = EditorViewMixin;
  });
define("ghost/mixins/editor-route-base", 
  ["ghost/mixins/shortcuts-route","ghost/mixins/style-body","ghost/mixins/loading-indicator","ghost/utils/editor-shortcuts","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var ShortcutsRoute = __dependency1__["default"];
    var styleBody = __dependency2__["default"];
    var loadingIndicator = __dependency3__["default"];
    var editorShortcuts = __dependency4__["default"];

    var EditorRouteBase = Ember.Mixin.create(styleBody, ShortcutsRoute, loadingIndicator, {
        actions: {
            save: function () {
                this.get('controller').send('save');
            },
            publish: function () {
                var controller = this.get('controller');
                controller.send('setSaveType', 'publish');
                controller.send('save');
            },
            toggleZenMode: function () {
                Ember.$('body').toggleClass('zen');
            },
            //The actual functionality is implemented in utils/codemirror-shortcuts
            codeMirrorShortcut: function (options) {
                this.get('controller.codemirror').shortcut(options.type);
            }
        },

        shortcuts: editorShortcuts,

        attachModelHooks: function (controller, model) {
            // this will allow us to track when the model is saved and update the controller
            // so that we can be sure controller.isDirty is correct, without having to update the
            // controller on each instance of `model.save()`.
            //
            // another reason we can't do this on `model.save().then()` is because the post-settings-menu
            // also saves the model, and passing messages is difficult because we have two
            // types of editor controllers, and the PSM also exists on the posts.post route.
            //
            // The reason we can't just keep this functionality in the editor controller is
            // because we need to remove these handlers on `willTransition` in the editor route.
            model.on('didCreate', controller, controller.get('modelSaved'));
            model.on('didUpdate', controller, controller.get('modelSaved'));
        },

        detachModelHooks: function (controller, model) {
            model.off('didCreate', controller, controller.get('modelSaved'));
            model.off('didUpdate', controller, controller.get('modelSaved'));
        }
    });

    __exports__["default"] = EditorRouteBase;
  });
define("ghost/mixins/loading-indicator", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // mixin used for routes to display a loading indicator when there is network activity
    var loaderOptions = {
        'showSpinner': false
    };
    NProgress.configure(loaderOptions);

    var loadingIndicator = Ember.Mixin.create({
        actions:  {

            loading: function () {
                NProgress.start();
                this.router.one('didTransition', function () {
                    NProgress.done();
                });
                return true;
            },

            error: function () {
                NProgress.done();
                return true;
            }
        }
    });

    __exports__["default"] = loadingIndicator;
  });
define("ghost/mixins/marker-manager", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var MarkerManager = Ember.Mixin.create({
        imageMarkdownRegex: /^(?:\{<(.*?)>\})?!(?:\[([^\n\]]*)\])(?:\(([^\n\]]*)\))?$/gim,
        markerRegex: /\{<([\w\W]*?)>\}/,

        uploadId: 1,

        // create an object that will be shared amongst instances.
        // makes it easier to use helper functions in different modules
        markers: {},

        // Add markers to the line if it needs one
        initMarkers: function (line) {
            var imageMarkdownRegex = this.get('imageMarkdownRegex'),
                markerRegex = this.get('markerRegex'),
                editor = this.get('codemirror'),
                isImage = line.text.match(imageMarkdownRegex),
                hasMarker = line.text.match(markerRegex);

            if (isImage && !hasMarker) {
                this.addMarker(line, editor.getLineNumber(line));
            }
        },

        // Get the markdown with all the markers stripped
        getMarkdown: function (value) {
            var marker, id,
                editor = this.get('codemirror'),
                markers = this.get('markers'),
                markerRegexForId = this.get('markerRegexForId'),
                oldValue = value || editor.getValue(),
                newValue = oldValue;

            for (id in markers) {
                if (markers.hasOwnProperty(id)) {
                    marker = markers[id];
                    newValue = newValue.replace(markerRegexForId(id), '');
                }
            }

            return {
                withMarkers: oldValue,
                withoutMarkers: newValue
            };
        },

        // check the given line to see if it has an image, and if it correctly has a marker
        // in the special case of lines which were just pasted in, any markers are removed to prevent duplication
        checkLine: function (ln, mode) {
            var editor = this.get('codemirror'),
                line = editor.getLineHandle(ln),
                imageMarkdownRegex = this.get('imageMarkdownRegex'),
                markerRegex = this.get('markerRegex'),
                isImage = line.text.match(imageMarkdownRegex),
                hasMarker;

            // We care if it is an image
            if (isImage) {
                hasMarker = line.text.match(markerRegex);

                if (hasMarker && (mode === 'paste' || mode === 'undo')) {
                    // this could be a duplicate, and won't be a real marker
                    this.stripMarkerFromLine(line);
                }

                if (!hasMarker) {
                    this.addMarker(line, ln);
                }
            }
            // TODO: hasMarker but no image?
        },

        // Add a marker to the given line
        // Params:
        // line - CodeMirror LineHandle
        // ln - line number
        addMarker: function (line, ln) {
            var marker,
                markers = this.get('markers'),
                editor = this.get('codemirror'),
                uploadPrefix = 'image_upload',
                uploadId = this.get('uploadId'),
                magicId = '{<' + uploadId + '>}',
                newText = magicId + line.text;

            editor.replaceRange(
                newText,
                {line: ln, ch: 0},
                {line: ln, ch: newText.length}
            );

            marker = editor.markText(
                {line: ln, ch: 0},
                {line: ln, ch: (magicId.length)},
                {collapsed: true}
            );

            markers[uploadPrefix + '_' + uploadId] = marker;
            this.set('uploadId', uploadId += 1);
        },

        // Check each marker to see if it is still present in the editor and if it still corresponds to image markdown
        // If it is no longer a valid image, remove it
        checkMarkers: function () {
            var id, marker, line,
                editor = this.get('codemirror'),
                markers = this.get('markers'),
                imageMarkdownRegex = this.get('imageMarkdownRegex');

            for (id in markers) {
                if (markers.hasOwnProperty(id)) {
                    marker = markers[id];

                    if (marker.find()) {
                        line = editor.getLineHandle(marker.find().from.line);
                        if (!line.text.match(imageMarkdownRegex)) {
                            this.removeMarker(id, marker, line);
                        }
                    } else {
                        this.removeMarker(id, marker);
                    }
                }
            }
        },

        // this is needed for when we transition out of the editor.
        // since the markers object is persistent and shared between classes that
        // mix in this mixin, we need to make sure markers don't carry over between edits.
        clearMarkers: function () {
            var markers = this.get('markers'),
                id,
                marker;

            // can't just `this.set('markers', {})`,
            // since it wouldn't apply to this mixin,
            // but only to the class that mixed this mixin in
            for (id in markers) {
                if (markers.hasOwnProperty(id)) {
                    marker = markers[id];
                    delete markers[id];
                    marker.clear();
                }
            }
        },

        // Remove a marker
        // Will be passed a LineHandle if we already know which line the marker is on
        removeMarker: function (id, marker, line) {
            var markers = this.get('markers');

            delete markers[id];
            marker.clear();

            if (line) {
                this.stripMarkerFromLine(line);
            } else {
                this.findAndStripMarker(id);
            }
        },

        // Removes the marker on the given line if there is one
        stripMarkerFromLine: function (line) {
            var editor = this.get('codemirror'),
                ln = editor.getLineNumber(line),
                markerRegex = /\{<([\w\W]*?)>\}/,
                markerText = line.text.match(markerRegex);


            if (markerText) {
                editor.replaceRange(
                    '',
                    {line: ln, ch: markerText.index},
                    {line: ln, ch: markerText.index + markerText[0].length}
                );
            }
        },

        // the regex
        markerRegexForId: function (id) {
            id = id.replace('image_upload_', '');
            return new RegExp('\\{<' + id + '>\\}', 'gmi');
        },

        // Find a marker in the editor by id & remove it
        // Goes line by line to find the marker by it's text if we've lost track of the TextMarker
        findAndStripMarker: function (id) {
            var self = this,
                editor = this.get('codemirror');

            editor.eachLine(function (line) {
                var markerText = self.markerRegexForId(id).exec(line.text),
                    ln;

                if (markerText) {
                    ln = editor.getLineNumber(line);
                    editor.replaceRange(
                        '',
                        {line: ln, ch: markerText.index},
                        {line: ln, ch: markerText.index + markerText[0].length}
                    );
                }
            });
        },

        // Find the line with the marker which matches
        findLine: function (result_id) {
            var editor = this.get('codemirror'),
                markers = this.get('markers');

            // try to find the right line to replace
            if (markers.hasOwnProperty(result_id) && markers[result_id].find()) {
                return editor.getLineHandle(markers[result_id].find().from.line);
            }

            return false;
        }
    });

    __exports__["default"] = MarkerManager;
  });
define("ghost/mixins/nprogress-save", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var NProgressSaveMixin = Ember.Mixin.create({
        save: function (options) {
            if (options && options.disableNProgress) {
                return this._super(options);
            }
            
            NProgress.start();
            return this._super(options).then(function (value) {
                NProgress.done();
                return value;
            }).catch(function (error) {
                NProgress.done();
                return Ember.RSVP.reject(error);
            });
        }
    });

    __exports__["default"] = NProgressSaveMixin;
  });
define("ghost/mixins/pagination-controller", 
  ["ghost/utils/ajax","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var getRequestErrorMessage = __dependency1__.getRequestErrorMessage;

    var PaginationControllerMixin = Ember.Mixin.create({

        // set from PaginationRouteMixin
        paginationSettings: null,

        // holds the next page to load during infinite scroll
        nextPage: null,

        // indicates whether we're currently loading the next page
        isLoading: null,

        /**
         *
         * @param options: {
         *                      modelType: <String> name of the model that will be paginated
         *                  }
         */
        init: function (options) {
            this._super();

            var metadata = this.store.metadataFor(options.modelType);
            this.set('nextPage', metadata.pagination.next);
        },


        /**
         * Takes an ajax response, concatenates any error messages, then generates an error notification.
         * @param {jqXHR} response The jQuery ajax reponse object.
         * @return
         */
        reportLoadError: function (response) {
            var message = 'A problem was encountered while loading more records';

            if (response) {
                // Get message from response
                message += ': ' + getRequestErrorMessage(response, true);
            } else {
                message += '.';
            }

            this.notifications.showError(message);
        },

        actions: {
            /**
             * Loads the next paginated page of posts into the ember-data store. Will cause the posts list UI to update.
             * @return
             */
            loadNextPage: function () {

                var self = this,
                    store = this.get('store'),
                    recordType = this.get('model').get('type'),
                    nextPage = this.get('nextPage'),
                    paginationSettings = this.get('paginationSettings');

                if (nextPage) {
                    this.set('isLoading', true);
                    this.set('paginationSettings.page', nextPage);
                    store.find(recordType, paginationSettings).then(function () {
                        var metadata = store.metadataFor(recordType);

                        self.set('nextPage', metadata.pagination.next);
                        self.set('isLoading', false);
                    }, function (response) {
                        self.reportLoadError(response);
                    });
                }
            }
        }

    });

    __exports__["default"] = PaginationControllerMixin;
  });
define("ghost/mixins/pagination-route", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var defaultPaginationSettings = {
        page: 1,
        limit: 15
    };

    var PaginationRoute = Ember.Mixin.create({

        /**
         * Sets up pagination details
         * @param {settings}: object that specifies additional pagination details
         */
        setupPagination: function (settings) {

            settings = settings || {};
            settings = _.defaults(settings, defaultPaginationSettings);

            this.set('paginationSettings', settings);
            this.controller.set('paginationSettings', settings);
        }

    });

    __exports__["default"] = PaginationRoute;
  });
define("ghost/mixins/pagination-view-infinite-scroll", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var PaginationViewInfiniteScrollMixin = Ember.Mixin.create({

        /**
         * Determines if we are past a scroll point where we need to fetch the next page
         * @param event The scroll event
         */
        checkScroll: function (event) {
            var element = event.target,
                triggerPoint = 100,
                controller = this.get('controller'),
                isLoading = controller.get('isLoading');

            // If we haven't passed our threshold or we are already fetching content, exit
            if (isLoading || (element.scrollTop + element.clientHeight + triggerPoint <= element.scrollHeight)) {
                return;
            }

            controller.send('loadNextPage');
        },

        /**
         * Bind to the scroll event once the element is in the DOM
         */
        didInsertElement: function () {
            var el = this.$();

            el.on('scroll', Ember.run.bind(this, this.checkScroll));
        },

        /**
         * Unbind from the scroll event when the element is no longer in the DOM
         */
        willDestroyElement: function () {
            var el = this.$();
            el.off('scroll');
        }
    });

    __exports__["default"] = PaginationViewInfiniteScrollMixin;
  });
define("ghost/mixins/popover-mixin", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /*
      Popovers and their buttons are evented and do not propagate clicks.
    */
    var PopoverMixin = Ember.Mixin.create(Ember.Evented, {
        classNameBindings: ['isOpen:open'],
        isOpen: false,
        click: function (event) {
            this._super(event);
            return event.stopPropagation();
        }
    });

    __exports__["default"] = PopoverMixin;
  });
define("ghost/mixins/selective-save", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // SelectiveSaveMixin adds a saveOnly method to a DS.Model.
    //
    // saveOnly provides a way to save one or more properties of a model while
    // preserving outstanding changes to other properties.
    var SelectiveSaveMixin = Ember.Mixin.create({
        saveOnly: function () {
            if (arguments.length === 0) {
                return Ember.RSVP.resolve();
            }

            if (arguments.length === 1 && Ember.isArray(arguments[0])) {
                return this.saveOnly.apply(this, Array.prototype.slice.call(arguments[0]));
            }

            var propertiesToSave = Array.prototype.slice.call(arguments),
                changed,
                hasMany = {},
                belongsTo = {},
                self = this;

            changed = this.changedAttributes();

            // disable observers so we can make changes to the model but not have
            // them reflected by the UI
            this.beginPropertyChanges();

            // make a copy of any relations the model may have so they can
            // be reapplied later
            this.eachRelationship(function (name, meta) {
                if (meta.kind === 'hasMany') {
                    hasMany[name] = self.get(name).slice();
                    return;
                }

                if (meta.kind === 'belongsTo') {
                    belongsTo[name] = self.get(name);
                    return;
                }
            });

            try {
                // roll back all changes to the model and then reapply only those that
                // are part of the saveOnly

                self.rollback();

                propertiesToSave.forEach(function (name) {
                    if (hasMany.hasOwnProperty(name)) {
                        self.get(name).clear();

                        hasMany[name].forEach(function (relatedType) {
                            self.get(name).pushObject(relatedType);
                        });

                        return;
                    }

                    if (belongsTo.hasOwnProperty(name)) {
                        return self.updateBelongsTo(name, belongsTo[name]);
                    }

                    if (changed.hasOwnProperty(name)) {
                        return self.set(name, changed[name][1]);
                    }
                });
            }
            catch (err) {
                // if we were not able to get the model into the correct state
                // put it back the way we found it and return a rejected promise

                Ember.keys(changed).forEach(function (name) {
                    self.set(name, changed[name][1]);
                });

                Ember.keys(hasMany).forEach(function (name) {
                    self.updateHasMany(name, hasMany[name]);
                });

                Ember.keys(belongsTo).forEach(function (name) {
                    self.updateBelongsTo(name, belongsTo[name]);
                });

                self.endPropertyChanges();

                return Ember.RSVP.reject(new Error(err.message || 'Error during saveOnly. Changes NOT saved.'));
            }

            return this.save().finally(function () {
                // reapply any changes that were not part of the save

                Ember.keys(changed).forEach(function (name) {
                    if (propertiesToSave.hasOwnProperty(name)) {
                        return;
                    }

                    self.set(name, changed[name][1]);
                });

                Ember.keys(hasMany).forEach(function (name) {
                    if (propertiesToSave.hasOwnProperty(name)) {
                        return;
                    }

                    self.updateHasMany(name, hasMany[name]);
                });

                Ember.keys(belongsTo).forEach(function (name) {
                    if (propertiesToSave.hasOwnProperty(name)) {
                        return;
                    }

                    self.updateBelongsTo(name, belongsTo[name]);
                });

                // signal that we're finished and normal model observation may continue
                self.endPropertyChanges();
            });
        }
    });

    __exports__["default"] = SelectiveSaveMixin;
  });
define("ghost/mixins/shortcuts-route", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /* global key, console */

    //Configure KeyMaster to respond to all shortcuts,
    //even inside of
    //input, textarea, and select.
    key.filter = function () {
        return true;
    };

    /**
     * Only routes can implement shortcuts.
     * If you need to trigger actions on the controller,
     * simply call them with `this.get('controller').send('action')`.
     *
     * To implement shortcuts, add this mixin to your `extend()`,
     * and implement a `shortcuts` hash.
     * In this hash, keys are shortcut combinations and values are route action names.
     *  (see [keymaster docs](https://github.com/madrobby/keymaster/blob/master/README.markdown)),
     * 
     * ```javascript
     * shortcuts: {
     *     'ctrl+s, command+s': 'save',
     *     'ctrl+alt+z': 'toggleZenMode'
     * }
     * ```
     * For more complex actions, shortcuts can instead have their value
     * be an object like {action, options}
     * ```javascript
     * shortcuts: {
     *      'ctrl+k': {action: 'markdownShortcut', options: 'createLink'}
     * }
     * ```
     */
    var ShortcutsRoute = Ember.Mixin.create({
        registerShortcuts: function () {
            var self = this,
                shortcuts = this.get('shortcuts');

            Ember.keys(shortcuts).forEach(function (shortcut) {
                key(shortcut, function (event) {
                    var action = shortcuts[shortcut],
                        options;
                    if (Ember.typeOf(action) !== 'string') {
                        options = action.options;
                        action = action.action;
                    }
                    
                    //stop things like ctrl+s from actually opening a save dialogue
                    event.preventDefault();
                    self.send(action, options);
                });
            });
        },
        removeShortcuts: function () {
            var shortcuts = this.get('shortcuts');

            Ember.keys(shortcuts).forEach(function (shortcut) {
                key.unbind(shortcut);
            });
        },
        activate: function () {
            this._super();
            if (!this.shortcuts) {
                console.error('Shortcuts not found on route');
                return;
            }
            this.registerShortcuts();
        },
        deactivate: function () {
            this._super();
            this.removeShortcuts();
        }
    });

    __exports__["default"] = ShortcutsRoute;
  });
define("ghost/mixins/style-body", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // mixin used for routes that need to set a css className on the body tag

    var styleBody = Ember.Mixin.create({
        activate: function () {
            this._super();
            var cssClasses = this.get('classNames');

            if (cssClasses) {
                Ember.run.schedule('afterRender', null, function () {
                    cssClasses.forEach(function (curClass) {
                        Ember.$('body').addClass(curClass);
                    });
                });
            }
        },

        deactivate: function () {
            this._super();
            var cssClasses = this.get('classNames');

            Ember.run.schedule('afterRender', null, function () {
                cssClasses.forEach(function (curClass) {
                    Ember.$('body').removeClass(curClass);
                });
            });
        }
    });

    __exports__["default"] = styleBody;
  });
define("ghost/mixins/validation-engine", 
  ["ghost/utils/ajax","ghost/utils/validator-extensions","ghost/validators/post","ghost/validators/setup","ghost/validators/signup","ghost/validators/signin","ghost/validators/forgotten","ghost/validators/setting","ghost/validators/reset","ghost/validators/user","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __dependency10__, __exports__) {
    "use strict";
    var getRequestErrorMessage = __dependency1__.getRequestErrorMessage;

    var ValidatorExtensions = __dependency2__["default"];
    var PostValidator = __dependency3__["default"];
    var SetupValidator = __dependency4__["default"];
    var SignupValidator = __dependency5__["default"];
    var SigninValidator = __dependency6__["default"];
    var ForgotValidator = __dependency7__["default"];
    var SettingValidator = __dependency8__["default"];
    var ResetValidator = __dependency9__["default"];
    var UserValidator = __dependency10__["default"];

    // our extensions to the validator library
    ValidatorExtensions.init();

    // format errors to be used in `notifications.showErrors`.
    // result is [{ message: 'concatenated error messages' }]
    function formatErrors(errors, opts) {
        var message = 'There was an error';

        opts = opts || {};

        if (opts.wasSave && opts.validationType) {
            message += ' saving this ' + opts.validationType;
        }

        if (Ember.isArray(errors)) {
            // get the validator's error messages from the array.
            // normalize array members to map to strings.
            message = errors.map(function (error) {
                if (typeof error === 'string') {
                    return error;
                }

                return error.message;
            }).join('<br />');
        } else if (errors instanceof Error) {
            message += errors.message || '.';
        } else if (typeof errors === 'object') {
            // Get messages from server response
            message += ': ' + getRequestErrorMessage(errors, true);
        } else if (typeof errors === 'string') {
            message += ': ' + errors;
        } else {
            message += '.';
        }

        // set format for notifications.showErrors
        message = [{ message: message }];

        return message;
    }


    /**
    * The class that gets this mixin will receive these properties and functions.
    * It will be able to validate any properties on itself (or the model it passes to validate())
    * with the use of a declared validator.
    */
    var ValidationEngine = Ember.Mixin.create({
        // these validators can be passed a model to validate when the class that
        // mixes in the ValidationEngine declares a validationType equal to a key on this object.
        // the model is either passed in via `this.validate({ model: object })`
        // or by calling `this.validate()` without the model property.
        // in that case the model will be the class that the ValidationEngine
        // was mixed into, i.e. the controller or Ember Data model.
        validators: {
            post: PostValidator,
            setup: SetupValidator,
            signup: SignupValidator,
            signin: SigninValidator,
            forgotten: ForgotValidator,
            setting: SettingValidator,
            reset: ResetValidator,
            user: UserValidator
        },

        /**
        * Passses the model to the validator specified by validationType.
        * Returns a promise that will resolve if validation succeeds, and reject if not.
        * Some options can be specified:
        *
        * `format: false` - doesn't use formatErrors to concatenate errors for notifications.showErrors.
        *                   will return whatever the specified validator returns.
        *                   since notifications are a common usecase, `format` is true by default.
        *
        * `model: Object` - you can specify the model to be validated, rather than pass the default value of `this`,
        *                   the class that mixes in this mixin.
        */
        validate: function (opts) {
            var model = opts.model || this,
                type = this.get('validationType'),
                validator = this.get('validators.' + type);

            opts = opts || {};
            opts.validationType = type;

            return new Ember.RSVP.Promise(function (resolve, reject) {
                var validationErrors;

                if (!type || !validator) {
                    validationErrors = ['The validator specified, "' + type + '", did not exist!'];
                } else {
                    validationErrors = validator.check(model);
                }

                if (Ember.isEmpty(validationErrors)) {
                    return resolve();
                }

                if (opts.format !== false) {
                    validationErrors = formatErrors(validationErrors, opts);
                }

                return reject(validationErrors);
            });
        },

        /**
        * The primary goal of this method is to override the `save` method on Ember Data models.
        * This allows us to run validation before actually trying to save the model to the server.
        * You can supply options to be passed into the `validate` method, since the ED `save` method takes no options.
        */
        save: function (options) {
            var self = this,
                // this is a hack, but needed for async _super calls.
                // ref: https://github.com/emberjs/ember.js/pull/4301
                _super = this.__nextSuper;

            options = options || {};
            options.wasSave = true;

            // model.destroyRecord() calls model.save() behind the scenes.
            // in that case, we don't need validation checks or error propagation,
            // because the model itself is being destroyed.
            if (this.get('isDeleted')) {
                return this._super();
            }

            // If validation fails, reject with validation errors.
            // If save to the server fails, reject with server response.
            return this.validate(options).then(function () {
                return _super.call(self, options);
            }).catch(function (result) {
                // server save failed - validate() would have given back an array
                if (! Ember.isArray(result)) {
                    if (options.format !== false) {
                        // concatenate all errors into an array with a single object: [{ message: 'concatted message' }]
                        result = formatErrors(result, options);
                    } else {
                        // return the array of errors from the server
                        result = getRequestErrorMessage(result);
                    }
                }

                return Ember.RSVP.reject(result);
            });
        }
    });

    __exports__["default"] = ValidationEngine;
  });
define("ghost/models/notification", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var Notification = DS.Model.extend({
        dismissible: DS.attr('boolean'),
        location: DS.attr('string'),
        status: DS.attr('string'),
        type: DS.attr('string'),
        message: DS.attr('string')
    });

    __exports__["default"] = Notification;
  });
define("ghost/models/post", 
  ["ghost/mixins/validation-engine","ghost/utils/bound-one-way","ghost/mixins/nprogress-save","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var ValidationEngine = __dependency1__["default"];
    var boundOneWay = __dependency2__["default"];
    var NProgressSaveMixin = __dependency3__["default"];

    var Post = DS.Model.extend(NProgressSaveMixin, ValidationEngine, {
        validationType: 'post',

        uuid: DS.attr('string'),
        title: DS.attr('string', {defaultValue: ''}),
        slug: DS.attr('string'),
        markdown: DS.attr('string', {defaultValue: ''}),
        html: DS.attr('string'),
        image: DS.attr('string'),
        featured: DS.attr('boolean', {defaultValue: false}),
        page: DS.attr('boolean', {defaultValue: false}),
        status: DS.attr('string', {defaultValue: 'draft'}),
        language: DS.attr('string', {defaultValue: 'en_US'}),
        meta_title: DS.attr('string'),
        meta_description: DS.attr('string'),
        author: DS.belongsTo('user',  { async: true }),
        author_id: DS.attr('number'),
        updated_at: DS.attr('moment-date'),
        published_at: DS.attr('moment-date'),
        published_by: DS.belongsTo('user', { async: true }),
        tags: DS.hasMany('tag', { embedded: 'always' }),
        titleScratch: boundOneWay('title'),
        //## Computed post properties
        isPublished: Ember.computed.equal('status', 'published'),
        isDraft: Ember.computed.equal('status', 'draft'),

        // remove client-generated tags, which have `id: null`.
        // Ember Data won't recognize/update them automatically
        // when returned from the server with ids.
        updateTags: function () {
            var tags = this.get('tags'),
            oldTags = tags.filterBy('id', null);

            tags.removeObjects(oldTags);
            oldTags.invoke('deleteRecord');
        },

        isAuthoredByUser: function (user) {
            return parseInt(user.get('id'), 10) === parseInt(this.get('author_id'), 10);
        }

    });

    __exports__["default"] = Post;
  });
define("ghost/models/role", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var Role = DS.Model.extend({
        uuid: DS.attr('string'),
        name: DS.attr('string'),
        description: DS.attr('string'),
        created_at: DS.attr('moment-date'),
        updated_at: DS.attr('moment-date'),

        lowerCaseName: Ember.computed('name', function () {
            return this.get('name').toLocaleLowerCase();
        })
    });

    __exports__["default"] = Role;
  });
define("ghost/models/setting", 
  ["ghost/mixins/validation-engine","ghost/mixins/nprogress-save","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var ValidationEngine = __dependency1__["default"];
    var NProgressSaveMixin = __dependency2__["default"];

    var Setting = DS.Model.extend(NProgressSaveMixin, ValidationEngine, {
        validationType: 'setting',

        title: DS.attr('string'),
        description: DS.attr('string'),
        email: DS.attr('string'),
        logo: DS.attr('string'),
        cover: DS.attr('string'),
        defaultLang: DS.attr('string'),
        postsPerPage: DS.attr('number'),
        forceI18n: DS.attr('boolean'),
        permalinks: DS.attr('string'),
        activeTheme: DS.attr('string'),
        availableThemes: DS.attr()
    });

    __exports__["default"] = Setting;
  });
define("ghost/models/slug-generator", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var SlugGenerator = Ember.Object.extend({
        ghostPaths: null,
        slugType: null,
        value: null,
        toString: function () {
            return this.get('value');
        },
        generateSlug: function (textToSlugify) {
            var self = this,
                url;

            if (!textToSlugify) {
                return Ember.RSVP.resolve('');
            }

            url = this.get('ghostPaths.url').api('slugs', this.get('slugType'), encodeURIComponent(textToSlugify));

            return ic.ajax.request(url, {
                type: 'GET'
            }).then(function (response) {
                var slug = response.slugs[0].slug;
                self.set('value', slug);
                return slug;
            });
        }
    });

    __exports__["default"] = SlugGenerator;
  });
define("ghost/models/tag", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var Tag = DS.Model.extend({
        uuid: DS.attr('string'),
        name: DS.attr('string'),
        slug: DS.attr('string'),
        description: DS.attr('string'),
        parent_id: DS.attr('number'),
        meta_title: DS.attr('string'),
        meta_description: DS.attr('string'),
    });

    __exports__["default"] = Tag;
  });
define("ghost/models/user", 
  ["ghost/mixins/validation-engine","ghost/mixins/nprogress-save","ghost/mixins/selective-save","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var ValidationEngine = __dependency1__["default"];
    var NProgressSaveMixin = __dependency2__["default"];
    var SelectiveSaveMixin = __dependency3__["default"];

    var User = DS.Model.extend(NProgressSaveMixin, SelectiveSaveMixin, ValidationEngine, {
        validationType: 'user',

        uuid: DS.attr('string'),
        name: DS.attr('string'),
        slug: DS.attr('string'),
        email: DS.attr('string'),
        image: DS.attr('string'),
        cover: DS.attr('string'),
        bio: DS.attr('string'),
        website: DS.attr('string'),
        location: DS.attr('string'),
        accessibility: DS.attr('string'),
        status: DS.attr('string'),
        language: DS.attr('string', {defaultValue: 'en_US'}),
        meta_title: DS.attr('string'),
        meta_description: DS.attr('string'),
        last_login: DS.attr('moment-date'),
        created_at: DS.attr('moment-date'),
        created_by: DS.attr('number'),
        updated_at: DS.attr('moment-date'),
        updated_by: DS.attr('number'),
        roles: DS.hasMany('role', { embedded: 'always' }),

        role: Ember.computed('roles', function (name, value) {
            if (arguments.length > 1) {
                //Only one role per user, so remove any old data.
                this.get('roles').clear();
                this.get('roles').pushObject(value);
                return value;
            }
            return this.get('roles.firstObject');
        }),

        // TODO: Once client-side permissions are in place,
        // remove the hard role check.
        isAuthor: Ember.computed.equal('role.name', 'Author'),
        isEditor: Ember.computed.equal('role.name', 'Editor'),
        isAdmin: Ember.computed.equal('role.name', 'Administrator'),
        isOwner: Ember.computed.equal('role.name', 'Owner'),

        saveNewPassword: function () {
            var url = this.get('ghostPaths.url').api('users', 'password');
            return ic.ajax.request(url, {
                type: 'PUT',
                data: {
                    password: [{
                        'oldPassword': this.get('password'),
                        'newPassword': this.get('newPassword'),
                        'ne2Password': this.get('ne2Password')
                    }]
                }
            });
        },

        resendInvite: function () {
            var fullUserData = this.toJSON(),
                userData = {
                email: fullUserData.email,
                roles: fullUserData.roles
            };

            return ic.ajax.request(this.get('ghostPaths.url').api('users'), {
                type: 'POST',
                data: JSON.stringify({users: [userData]}),
                contentType: 'application/json'
            });
        },

        passwordValidationErrors: function () {
            var validationErrors = [];

            if (!validator.equals(this.get('newPassword'), this.get('ne2Password'))) {
                validationErrors.push({message: 'Your new passwords do not match'});
            }

            if (!validator.isLength(this.get('newPassword'), 8)) {
                validationErrors.push({message: 'Your password is not long enough. It must be at least 8 characters long.'});
            }

            return validationErrors;
        }.property('password', 'newPassword', 'ne2Password'),

        isPasswordValid: Ember.computed.empty('passwordValidationErrors.[]'),
        active: function () {
            return _.contains(['active', 'warn-1', 'warn-2', 'warn-3', 'warn-4', 'locked'], this.get('status'));
        }.property('status'),
        invited: function () {
            return _.contains(['invited', 'invited-pending'], this.get('status'));
        }.property('status'),
        pending: Ember.computed.equal('status', 'invited-pending').property('status')
    });

    __exports__["default"] = User;
  });
define("ghost/router", 
  ["ghost/utils/ghost-paths","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /*global Ember */
    var ghostPaths = __dependency1__["default"];

    // ensure we don't share routes between all Router instances
    var Router = Ember.Router.extend();

    Router.reopen({
        location: 'trailing-history', // use HTML5 History API instead of hash-tag based URLs
        rootURL: ghostPaths().subdir + '/ghost/', // admin interface lives under sub-directory /ghost

        clearNotifications: function () {
            this.notifications.closePassive();
            this.notifications.displayDelayed();
        }.on('didTransition')
    });

    Router.map(function () {
        this.route('setup');
        this.route('signin');
        this.route('signout');
        this.route('signup', { path: '/signup/:token' });
        this.route('forgotten');
        this.route('reset', { path: '/reset/:token' });
        this.resource('posts', { path: '/' }, function () {
            this.route('post', { path: ':post_id' });
        });
        this.resource('editor', function () {
            this.route('new', { path: '' });
            this.route('edit', { path: ':post_id' });
        });
        this.resource('settings', function () {
            this.route('general');
            this.resource('settings.users', { path: '/users' }, function () {
                this.route('user', { path: '/:slug' });
            });
        });
        this.route('debug');
        //Redirect legacy content to posts
        this.route('content');

        this.route('error404', { path: '/*path' });

    });

    __exports__["default"] = Router;
  });
define("ghost/routes/application", 
  ["ghost/mixins/shortcuts-route","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var ShortcutsRoute = __dependency1__["default"];

    var ApplicationRoute = Ember.Route.extend(SimpleAuth.ApplicationRouteMixin, ShortcutsRoute, {

        afterModel: function (model, transition) {
            if (this.get('session').isAuthenticated) {
                transition.send('loadServerNotifications');
            }
        },

        shortcuts: {
            'esc': 'closePopups'
        },

        actions: {
            closePopups: function () {
                this.get('popover').closePopovers();
                this.get('notifications').closeAll();

                this.send('closeModal');
            },

            signedIn: function () {
                this.send('loadServerNotifications', true);
            },

            sessionAuthenticationFailed: function (error) {
                if (error.errors) {
                    this.notifications.showErrors(error.errors);
                } else {
                    // connection errors don't return proper status message, only req.body
                    this.notifications.showError('There was a problem on the server.');
                }
            },

            sessionAuthenticationSucceeded: function () {
                var self = this;
                this.store.find('user', 'me').then(function (user) {
                    self.send('signedIn', user);
                    var attemptedTransition = self.get('session').get('attemptedTransition');
                    if (attemptedTransition) {
                        attemptedTransition.retry();
                        self.get('session').set('attemptedTransition', null);
                    } else {
                        self.transitionTo(SimpleAuth.Configuration.routeAfterAuthentication);
                    }
                });
            },

            sessionInvalidationFailed: function (error) {
                this.notifications.showError(error.message);
            },

            openModal: function (modalName, model, type) {
                this.get('popover').closePopovers();
                modalName = 'modals/' + modalName;
                // We don't always require a modal to have a controller
                // so we're skipping asserting if one exists
                if (this.controllerFor(modalName, true)) {
                    this.controllerFor(modalName).set('model', model);

                    if (type) {
                        this.controllerFor(modalName).set('imageType', type);
                        this.controllerFor(modalName).set('src', model.get(type));
                    }
                }
                return this.render(modalName, {
                    into: 'application',
                    outlet: 'modal'
                });
            },

            closeModal: function () {
                return this.disconnectOutlet({
                    outlet: 'modal',
                    parentView: 'application'
                });
            },

            loadServerNotifications: function (isDelayed) {
                var self = this;
                if (this.session.isAuthenticated) {
                    this.store.findAll('notification').then(function (serverNotifications) {
                        serverNotifications.forEach(function (notification) {
                            self.notifications.handleNotification(notification, isDelayed);
                        });
                    });
                }
            },

            handleErrors: function (errors) {
                var self = this;
                this.notifications.clear();
                errors.forEach(function (errorObj) {
                    self.notifications.showError(errorObj.message || errorObj);

                    if (errorObj.hasOwnProperty('el')) {
                        errorObj.el.addClass('input-error');
                    }
                });
            }
        }
    });

    __exports__["default"] = ApplicationRoute;
  });
define("ghost/routes/content", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var ContentRoute = Ember.Route.extend({
        beforeModel: function () {
            this.transitionTo('posts');
        }
    });

    __exports__["default"] = ContentRoute;
  });
define("ghost/routes/debug", 
  ["ghost/mixins/style-body","ghost/mixins/loading-indicator","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var styleBody = __dependency1__["default"];
    var loadingIndicator = __dependency2__["default"];

    var DebugRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin, styleBody, loadingIndicator, {
        classNames: ['settings'],

        beforeModel: function () {
            var self = this;
            this.store.find('user', 'me').then(function (user) {
                if (user.get('isAuthor') || user.get('isEditor')) {
                    self.transitionTo('posts');
                }
            });
        },

        model: function () {
            return this.store.find('setting', { type: 'blog,theme' }).then(function (records) {
                return records.get('firstObject');
            });
        }

    });

    __exports__["default"] = DebugRoute;
  });
define("ghost/routes/editor/edit", 
  ["ghost/mixins/editor-route-base","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var base = __dependency1__["default"];

    var EditorEditRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin, base, {
        classNames: ['editor'],

        model: function (params) {
            var self = this,
                post,
                postId,
                paginationSettings;

            postId = Number(params.post_id);

            if (!_.isNumber(postId) || !_.isFinite(postId) || postId % 1 !== 0 || postId <= 0) {
                return this.transitionTo('error404', 'editor/' + params.post_id);
            }

            post = this.store.getById('post', postId);

            if (post) {
                return post;
            }

            paginationSettings = {
                id: postId,
                status: 'all',
                staticPages: 'all'
            };

            return this.store.find('user', 'me').then(function (user) {
                if (user.get('isAuthor')) {
                    paginationSettings.author = user.get('slug');
                }

                return self.store.find('post', paginationSettings).then(function (records) {
                    var post = records.get('firstObject');

                    if (user.get('isAuthor') && post.isAuthoredByUser(user)) {
                        // do not show the post if they are an author but not this posts author
                        post = null;
                    }

                    if (post) {
                        return post;
                    }

                    return self.transitionTo('posts.index');
                });
            });
        },

        serialize: function (model) {
            return {post_id: model.get('id')};
        },

        setupController: function (controller, model) {
            this._super(controller, model);
            controller.set('scratch', model.get('markdown'));
            // used to check if anything has changed in the editor
            controller.set('previousTagNames', model.get('tags').mapBy('name'));

            // attach model-related listeners created in editor-route-base
            this.attachModelHooks(controller, model);
        },

        actions: {
            willTransition: function (transition) {
                var controller = this.get('controller'),
                    isDirty = controller.get('isDirty'),

                    model = controller.get('model'),
                    isSaving = model.get('isSaving'),
                    isDeleted = model.get('isDeleted'),
                    modelIsDirty = model.get('isDirty');

                // when `isDeleted && isSaving`, model is in-flight, being saved
                // to the server. when `isDeleted && !isSaving && !modelIsDirty`,
                // the record has already been deleted and the deletion persisted.
                //
                // in either case  we can probably just transition now.
                // in the former case the server will return the record, thereby updating it.
                // @TODO: this will break if the model fails server-side validation.
                if (!(isDeleted && isSaving) && !(isDeleted && !isSaving && !modelIsDirty) && isDirty) {
                    transition.abort();
                    this.send('openModal', 'leave-editor', [controller, transition]);
                    return;
                }

                // since the transition is now certain to complete..
                window.onbeforeunload = null;

                // remove model-related listeners created in editor-route-base
                this.detachModelHooks(controller, model);
            }
        }
    });

    __exports__["default"] = EditorEditRoute;
  });
define("ghost/routes/editor/index", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var EditorRoute = Ember.Route.extend({
        beforeModel: function () {
            this.transitionTo('editor.new');
        }
    });

    __exports__["default"] = EditorRoute;
  });
define("ghost/routes/editor/new", 
  ["ghost/mixins/editor-route-base","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var base = __dependency1__["default"];

    var EditorNewRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin, base, {
        classNames: ['editor'],

        model: function () {
            var self = this;
            return this.get('session.user').then(function (user) {
                return self.store.createRecord('post', {
                    author: user
                });
            });
        },

        setupController: function (controller, model) {
            this._super(controller, model);
            controller.set('scratch', '');

            // used to check if anything has changed in the editor
            controller.set('previousTagNames', Ember.A());

            // attach model-related listeners created in editor-route-base
            this.attachModelHooks(controller, model);
        },

        actions: {
            willTransition: function (transition) {
                var controller = this.get('controller'),
                    isDirty = controller.get('isDirty'),

                    model = controller.get('model'),
                    isNew = model.get('isNew'),
                    isSaving = model.get('isSaving'),
                    isDeleted = model.get('isDeleted'),
                    modelIsDirty = model.get('isDirty');

                // when `isDeleted && isSaving`, model is in-flight, being saved
                // to the server. when `isDeleted && !isSaving && !modelIsDirty`,
                // the record has already been deleted and the deletion persisted.
                //
                // in either case  we can probably just transition now.
                // in the former case the server will return the record, thereby updating it.
                // @TODO: this will break if the model fails server-side validation.
                if (!(isDeleted && isSaving) && !(isDeleted && !isSaving && !modelIsDirty) && isDirty) {
                    transition.abort();
                    this.send('openModal', 'leave-editor', [controller, transition]);
                    return;
                }

                if (isNew) {
                    model.deleteRecord();
                }

                // since the transition is now certain to complete..
                window.onbeforeunload = null;

                // remove model-related listeners created in editor-route-base
                this.detachModelHooks(controller, model);
            }
        }
    });

    __exports__["default"] = EditorNewRoute;
  });
define("ghost/routes/error404", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var Error404Route = Ember.Route.extend({
        controllerName: 'error',
        templateName: 'error',

        model: function () {
            return {
                status: 404
            };
        }
    });

    __exports__["default"] = Error404Route;
  });
define("ghost/routes/forgotten", 
  ["ghost/mixins/style-body","ghost/mixins/loading-indicator","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var styleBody = __dependency1__["default"];
    var loadingIndicator = __dependency2__["default"];

    var ForgottenRoute = Ember.Route.extend(styleBody, loadingIndicator, {
        classNames: ['ghost-forgotten']
    });

    __exports__["default"] = ForgottenRoute;
  });
define("ghost/routes/posts", 
  ["ghost/mixins/style-body","ghost/mixins/shortcuts-route","ghost/mixins/loading-indicator","ghost/mixins/pagination-route","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var styleBody = __dependency1__["default"];
    var ShortcutsRoute = __dependency2__["default"];
    var loadingIndicator = __dependency3__["default"];
    var PaginationRouteMixin = __dependency4__["default"];

    var paginationSettings = {
        status: 'all',
        staticPages: 'all',
        page: 1
    };

    var PostsRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin, ShortcutsRoute, styleBody, loadingIndicator, PaginationRouteMixin, {
        classNames: ['manage'],

        model: function () {
            var self = this;

            return this.store.find('user', 'me').then(function (user) {
                if (user.get('isAuthor')) {
                    paginationSettings.author = user.get('slug');
                }
                // using `.filter` allows the template to auto-update when new models are pulled in from the server.
                // we just need to 'return true' to allow all models by default.
                return self.store.filter('post', paginationSettings, function (post) {
                    if (user.get('isAuthor')) {
                        return post.isAuthoredByUser(user);
                    }

                    return true;
                });
            });
        },

        setupController: function (controller, model) {
            this._super(controller, model);
            this.setupPagination(paginationSettings);
        },

        stepThroughPosts: function (step) {
            var currentPost = this.get('controller.currentPost'),
                posts = this.get('controller.arrangedContent'),
                length = posts.get('length'),
                newPosition;

            newPosition = posts.indexOf(currentPost) + step;

            // if we are on the first or last item
            // just do nothing (desired behavior is to not
            // loop around)
            if (newPosition >= length) {
                return;
            } else if (newPosition < 0) {
                return;
            }
            this.transitionTo('posts.post', posts.objectAt(newPosition));
        },

        shortcuts: {
            'up': 'moveUp',
            'down': 'moveDown'
        },
        actions: {
            openEditor: function (post) {
                this.transitionTo('editor.edit', post);
            },
            moveUp: function () {
                this.stepThroughPosts(-1);
            },
            moveDown: function () {
                this.stepThroughPosts(1);
            }
        }
    });

    __exports__["default"] = PostsRoute;
  });
define("ghost/routes/posts/index", 
  ["ghost/mixins/loading-indicator","ghost/utils/mobile","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var loadingIndicator = __dependency1__["default"];
    var mobileQuery = __dependency2__.mobileQuery;

    var PostsIndexRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin, loadingIndicator, {
        // This route's only function is to determine whether or not a post
        // exists to be used for the content preview.  It has a parent resource (Posts)
        // that is responsible for populating the store.
        beforeModel: function () {
            var self = this,
            // the store has been populated so we can work with the local copy
                posts = this.store.all('post'),
                currentPost = this.controllerFor('posts').get('currentPost');

            return this.store.find('user', 'me').then(function (user) {
                // return the first post find that matches the following criteria:
                // * User is an author, and is the author of this post
                // * User has a role other than author
                return posts.find(function (post) {
                    if (user.get('isAuthor')) {
                        return post.isAuthoredByUser(user);
                    } else {
                        return true;
                    }
                });
            })
            .then(function (post) {
                if (post) {
                    if (currentPost === post && mobileQuery.matches) {
                        self.controllerFor('posts').send('hideContentPreview');
                    }

                    return self.transitionTo('posts.post', post);
                }
            });
        }
    });

    __exports__["default"] = PostsIndexRoute;
  });
define("ghost/routes/posts/post", 
  ["ghost/mixins/loading-indicator","ghost/mixins/shortcuts-route","ghost/utils/mobile","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var loadingIndicator = __dependency1__["default"];
    var ShortcutsRoute = __dependency2__["default"];
    var mobileQuery = __dependency3__.mobileQuery;

    var PostsPostRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin, loadingIndicator, ShortcutsRoute, {
        model: function (params) {
            var self = this,
                post,
                postId,
                paginationSettings;

            postId = Number(params.post_id);

            if (!_.isNumber(postId) || !_.isFinite(postId) || postId % 1 !== 0 || postId <= 0)
            {
                return this.transitionTo('error404', params.post_id);
            }

            post = this.store.getById('post', postId);

            if (post) {
                return post;
            }

            paginationSettings = {
                id: postId,
                status: 'all',
                staticPages: 'all'
            };

            return this.store.find('user', 'me').then(function (user) {
                if (user.get('isAuthor')) {
                    paginationSettings.author = user.get('slug');
                }

                return self.store.find('post', paginationSettings).then(function (records) {
                    var post = records.get('firstObject');

                    if (user.get('isAuthor') && !post.isAuthoredByUser(user)) {
                        // do not show the post if they are an author but not this posts author
                        post = null;
                    }

                    if (post) {
                        return post;
                    }

                    return self.transitionTo('posts.index');
                });
            });
        },
        setupController: function (controller, model) {
            this._super(controller, model);

            this.controllerFor('posts').set('currentPost', model);

            if (mobileQuery.matches) {
                this.controllerFor('posts').send('hideContentPreview');
            }
        },

        shortcuts: {
            'enter': 'openEditor'
        },
        actions: {
            openEditor: function () {
                this.transitionTo('editor.edit', this.get('controller.model'));
            }
        }
    });

    __exports__["default"] = PostsPostRoute;
  });
define("ghost/routes/reset", 
  ["ghost/mixins/style-body","ghost/mixins/loading-indicator","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var styleBody = __dependency1__["default"];
    var loadingIndicator = __dependency2__["default"];

    var ResetRoute = Ember.Route.extend(styleBody, loadingIndicator, {
        classNames: ['ghost-reset'],
        beforeModel: function () {
            if (this.get('session').isAuthenticated) {
                this.notifications.showWarn('You can\'t reset your password while you\'re signed in.', { delayed: true });
                this.transitionTo(SimpleAuth.Configuration.routeAfterAuthentication);
            }
        },
        setupController: function (controller, params) {
            controller.token = params.token;
        }
    });

    __exports__["default"] = ResetRoute;
  });
define("ghost/routes/settings", 
  ["ghost/mixins/style-body","ghost/mixins/loading-indicator","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var styleBody = __dependency1__["default"];
    var loadingIndicator = __dependency2__["default"];

    var SettingsRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin, styleBody, loadingIndicator, {
        classNames: ['settings']
    });

    __exports__["default"] = SettingsRoute;
  });
define("ghost/routes/settings/apps", 
  ["ghost/mixins/current-user-settings","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var CurrentUserSettings = __dependency1__["default"];

    var AppsRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin, CurrentUserSettings, {
        beforeModel: function () {
            if (!this.get('config.apps')) {
                return this.transitionTo('settings.general');
            }

            return this.currentUser()
                .then(this.transitionAuthor())
                .then(this.transitionEditor());
        },
        
        model: function () {
            return this.store.find('app');
        }
    });

    __exports__["default"] = AppsRoute;
  });
define("ghost/routes/settings/general", 
  ["ghost/mixins/loading-indicator","ghost/mixins/current-user-settings","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var loadingIndicator = __dependency1__["default"];
    var CurrentUserSettings = __dependency2__["default"];

    var SettingsGeneralRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin, loadingIndicator, CurrentUserSettings, {
        beforeModel: function () {
            return this.currentUser()
                .then(this.transitionAuthor())
                .then(this.transitionEditor());
        },

        model: function () {
            return this.store.find('setting', { type: 'blog,theme' }).then(function (records) {
                return records.get('firstObject');
            });
        }
    });

    __exports__["default"] = SettingsGeneralRoute;
  });
define("ghost/routes/settings/index", 
  ["ghost/utils/mobile","ghost/mixins/current-user-settings","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var mobileQuery = __dependency1__.mobileQuery;
    var CurrentUserSettings = __dependency2__["default"];

    var SettingsIndexRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin, CurrentUserSettings, {
        // redirect to general tab, unless on a mobile phone
        beforeModel: function () {
            var self = this;
            this.currentUser()
                .then(this.transitionAuthor())
                .then(this.transitionEditor())
                .then(function () {
                    if (!mobileQuery.matches) {
                        self.transitionTo('settings.general');
                    } else {
                        //fill the empty {{outlet}} in settings.hbs if the user
                        //goes to fullscreen

                        //fillOutlet needs special treatment so that it is
                        //properly bound to this when called from a MQ event
                        self.set('fillOutlet', _.bind(function fillOutlet(mq) {
                            if (!mq.matches) {
                                self.transitionTo('settings.general');
                            }
                        }, self));
                        mobileQuery.addListener(self.fillOutlet);
                    }
                });
        },
        
        deactivate: function () {
            if (this.get('fillOutlet')) {
                mobileQuery.removeListener(this.fillOutlet);
            }
        }
    });

    __exports__["default"] = SettingsIndexRoute;
  });
define("ghost/routes/settings/users", 
  ["ghost/mixins/current-user-settings","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var CurrentUserSettings = __dependency1__["default"];

    var UsersRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin, CurrentUserSettings, {
        beforeModel: function () {
            return this.currentUser()
                .then(this.transitionAuthor());
        }
    });

    __exports__["default"] = UsersRoute;
  });
define("ghost/routes/settings/users/index", 
  ["ghost/mixins/pagination-route","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var PaginationRouteMixin = __dependency1__["default"];

    var paginationSettings = {
        page: 1,
        limit: 20,
        status: 'all'
    };

    var UsersIndexRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin, PaginationRouteMixin, {
        setupController: function (controller, model) {
            this._super(controller, model);
            this.setupPagination(paginationSettings);
        },

        model: function () {
            var self = this;
            return this.store.find('user', 'me').then(function (currentUser) {
                if (currentUser.get('isEditor')) {
                    // Editors only see authors in the list
                    paginationSettings.role = 'Author';
                }
                return self.store.filter('user', paginationSettings, function (user) {
                    if (currentUser.get('isEditor')) {
                        return user.get('isAuthor');
                    }
                    return true;
                });
            });
        },

        actions: {
            reload: function () {
                this.refresh();
            }
        }
    });

    __exports__["default"] = UsersIndexRoute;
  });
define("ghost/routes/settings/users/user", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var SettingsUserRoute = Ember.Route.extend({
        model: function (params) {
            var self = this;
            // TODO: Make custom user adapter that uses /api/users/:slug endpoint
            // return this.store.find('user', { slug: params.slug });

            // Instead, get all the users and then find by slug
            return this.store.find('user').then(function (result) {
                var user = result.findBy('slug', params.slug);

                if (!user) {
                    return self.transitionTo('error404', 'settings/users/' + params.slug);
                }

                return user;
            });
        },

        afterModel: function (user) {
            var self = this;
            this.store.find('user', 'me').then(function (currentUser) {
                var isOwnProfile = user.get('id') === currentUser.get('id'),
                    isAuthor = currentUser.get('isAuthor'),
                    isEditor = currentUser.get('isEditor');
                if (isAuthor && !isOwnProfile) {
                    self.transitionTo('settings.users.user', currentUser);
                } else if (isEditor && !isOwnProfile && !user.get('isAuthor')) {
                    self.transitionTo('settings.users');
                }
            });
        },

        deactivate: function () {
            var model = this.modelFor('settings.users.user');

            // we want to revert any unsaved changes on exit
            if (model && model.get('isDirty')) {
                model.rollback();
            }

            this._super();
        }
    });

    __exports__["default"] = SettingsUserRoute;
  });
define("ghost/routes/setup", 
  ["ghost/mixins/style-body","ghost/mixins/loading-indicator","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var styleBody = __dependency1__["default"];
    var loadingIndicator = __dependency2__["default"];

    var SetupRoute = Ember.Route.extend(styleBody, loadingIndicator, {
        classNames: ['ghost-setup'],

        // use the beforeModel hook to check to see whether or not setup has been
        // previously completed.  If it has, stop the transition into the setup page.

        beforeModel: function () {
            var self = this;

            // If user is logged in, setup has already been completed.
            if (this.get('session').isAuthenticated) {
                this.transitionTo(SimpleAuth.Configuration.routeAfterAuthentication);
                return;
            }

            // If user is not logged in, check the state of the setup process via the API
            return ic.ajax.request(this.get('ghostPaths.url').api('authentication/setup'), {
                type: 'GET'
            }).then(function (result) {
                var setup = result.setup[0].status;

                if (setup) {
                    return self.transitionTo('signin');
                }
            });
        }
    });

    __exports__["default"] = SetupRoute;
  });
define("ghost/routes/signin", 
  ["ghost/mixins/style-body","ghost/mixins/loading-indicator","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var styleBody = __dependency1__["default"];
    var loadingIndicator = __dependency2__["default"];

    var SigninRoute = Ember.Route.extend(styleBody, loadingIndicator, {
        classNames: ['ghost-login'],
        beforeModel: function () {
            if (this.get('session').isAuthenticated) {
                this.transitionTo(SimpleAuth.Configuration.routeAfterAuthentication);
            }
        },

        // the deactivate hook is called after a route has been exited.
        deactivate: function () {
            this._super();

            // clear the properties that hold the credentials from the controller
            // when we're no longer on the signin screen
            this.controllerFor('signin').setProperties({ identification: '', password: '' });
        }
    });

    __exports__["default"] = SigninRoute;
  });
define("ghost/routes/signout", 
  ["ghost/mixins/style-body","ghost/mixins/loading-indicator","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var styleBody = __dependency1__["default"];
    var loadingIndicator = __dependency2__["default"];

    var SignoutRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin, styleBody, loadingIndicator, {
        classNames: ['ghost-signout'],

        afterModel: function (model, transition) {
            this.notifications.clear();
            if (Ember.canInvoke(transition, 'send')) {
                transition.send('invalidateSession');
                transition.abort();
            } else {
                this.send('invalidateSession');
            }
        },
    });

    __exports__["default"] = SignoutRoute;
  });
define("ghost/routes/signup", 
  ["ghost/mixins/style-body","ghost/mixins/loading-indicator","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var styleBody = __dependency1__["default"];
    var loadingIndicator = __dependency2__["default"];

    var SignupRoute = Ember.Route.extend(styleBody, loadingIndicator, {
        classNames: ['ghost-signup'],
        beforeModel: function () {
            if (this.get('session').isAuthenticated) {
                this.notifications.showWarn('You need to sign out to register as a new user.', { delayed: true });
                this.transitionTo(SimpleAuth.Configuration.routeAfterAuthentication);
            }
        },
        setupController: function (controller, params) {
            var tokenText,
                email,
                re = /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;
            if (re.test(params.token)) {
                try {
                    tokenText = atob(params.token);
                    email = tokenText.split('|')[1];
                    controller.token = params.token;
                    controller.email = email;
                } catch (e) {
                    this.transitionTo('signin');
                    this.notifications.showError('Invalid token.', {delayed: true});
                }
            } else {
                this.transitionTo('signin');
                this.notifications.showError('Invalid token.', {delayed: true});
            }
        }
    });

    __exports__["default"] = SignupRoute;
  });
define("ghost/serializers/application", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var ApplicationSerializer = DS.RESTSerializer.extend({
        serializeIntoHash: function (hash, type, record, options) {
            // Our API expects an id on the posted object
            options = options || {};
            options.includeId = true;

            // We have a plural root in the API
            var root = Ember.String.pluralize(type.typeKey),
                data = this.serialize(record, options);

            // Don't ever pass uuid's
            delete data.uuid;

            hash[root] = [data];
        }
    });

    __exports__["default"] = ApplicationSerializer;
  });
define("ghost/serializers/post", 
  ["ghost/serializers/application","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var ApplicationSerializer = __dependency1__["default"];

    var PostSerializer = ApplicationSerializer.extend(DS.EmbeddedRecordsMixin, {
        // settings for the EmbeddedRecordsMixin.
        attrs: {
            tags: { embedded: 'always' }
        },

        normalize: function (type, hash) {
            // this is to enable us to still access the raw author_id
            // without requiring an extra get request (since it is an
            // async relationship).
            hash.author_id = hash.author;

            return this._super(type, hash);
        },

        extractSingle: function (store, primaryType, payload) {
            var root = this.keyForAttribute(primaryType.typeKey),
                pluralizedRoot = Ember.String.pluralize(primaryType.typeKey);

            // make payload { post: { title: '', tags: [obj, obj], etc. } }.
            // this allows ember-data to pull the embedded tags out again,
            // in the function `updatePayloadWithEmbeddedHasMany` of the
            // EmbeddedRecordsMixin (line: `if (!partial[attribute])`):
            // https://github.com/emberjs/data/blob/master/packages/activemodel-adapter/lib/system/embedded_records_mixin.js#L499
            payload[root] = payload[pluralizedRoot][0];
            delete payload[pluralizedRoot];

            return this._super.apply(this, arguments);
        },

        keyForAttribute: function (attr) {
            return attr;
        },

        keyForRelationship: function (relationshipName) {
            // this is a hack to prevent Ember-Data from deleting our `tags` reference.
            // ref: https://github.com/emberjs/data/issues/2051
            // @TODO: remove this once the situation becomes clearer what to do.
            if (relationshipName === 'tags') {
                return 'tag';
            }

            return relationshipName;
        },

        serializeIntoHash: function (hash, type, record, options) {
            options = options || {};

            // We have a plural root in the API
            var root = Ember.String.pluralize(type.typeKey),
                data = this.serialize(record, options);

            // Don't ever pass uuid's
            delete data.uuid;

            hash[root] = [data];
        }
    });

    __exports__["default"] = PostSerializer;
  });
define("ghost/serializers/setting", 
  ["ghost/serializers/application","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var ApplicationSerializer = __dependency1__["default"];

    var SettingSerializer = ApplicationSerializer.extend({
        serializeIntoHash: function (hash, type, record, options) {
            // Settings API does not want ids
            options = options || {};
            options.includeId = false;

            var root = Ember.String.pluralize(type.typeKey),
                data = this.serialize(record, options),
                payload = [];

            delete data.id;

            Object.keys(data).forEach(function (k) {
                payload.push({ key: k, value: data[k] });
            });

            hash[root] = payload;
        },

        extractArray: function (store, type, _payload) {
            var payload = { id: '0' };

            _payload.settings.forEach(function (setting) {
                payload[setting.key] = setting.value;
            });

            return [payload];
        },

        extractSingle: function (store, type, payload) {
            return this.extractArray(store, type, payload).pop();
        }
    });

    __exports__["default"] = SettingSerializer;
  });
define("ghost/serializers/user", 
  ["ghost/serializers/application","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var ApplicationSerializer = __dependency1__["default"];

    var UserSerializer = ApplicationSerializer.extend(DS.EmbeddedRecordsMixin, {
        attrs: {
            roles: { embedded: 'always' }
        },

        extractSingle: function (store, primaryType, payload) {
            var root = this.keyForAttribute(primaryType.typeKey),
                pluralizedRoot = Ember.String.pluralize(primaryType.typeKey);

            payload[root] = payload[pluralizedRoot][0];
            delete payload[pluralizedRoot];

            return this._super.apply(this, arguments);
        },

        keyForAttribute: function (attr) {
            return attr;
        },

        keyForRelationship: function (relationshipName) {
            // this is a hack to prevent Ember-Data from deleting our `tags` reference.
            // ref: https://github.com/emberjs/data/issues/2051
            // @TODO: remove this once the situation becomes clearer what to do.
            if (relationshipName === 'roles') {
                return 'role';
            }

            return relationshipName;
        }
    });

    __exports__["default"] = UserSerializer;
  });
define("ghost/transforms/moment-date", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /* global moment */
    var MomentDate = DS.Transform.extend({
        deserialize: function (serialized) {
            if (serialized) {
                return moment(serialized);
            }
            return serialized;
        },
        serialize: function (deserialized) {
            if (deserialized) {
                return moment(deserialized).toDate();
            }
            return deserialized;
        }
    });
    __exports__["default"] = MomentDate;
  });
define("ghost/utils/ajax", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /* global ic */

    var ajax = window.ajax = function () {
        return ic.ajax.request.apply(null, arguments);
    };

    // Used in API request fail handlers to parse a standard api error
    // response json for the message to display
    var getRequestErrorMessage = function (request, performConcat) {
        var message,
            msgDetail;

        // Can't really continue without a request
        if (!request) {
            return null;
        }

        // Seems like a sensible default
        message = request.statusText;

        // If a non 200 response
        if (request.status !== 200) {
            try {
                // Try to parse out the error, or default to 'Unknown'
                if (request.responseJSON.errors && Ember.isArray(request.responseJSON.errors)) {

                    message = request.responseJSON.errors.map(function (errorItem) {
                        return errorItem.message;
                    });
                } else {
                    message =  request.responseJSON.error || 'Unknown Error';
                }
            } catch (e) {
                msgDetail = request.status ? request.status + ' - ' + request.statusText : 'Server was not available';
                message = 'The server returned an error (' + msgDetail + ').';
            }
        }

        if (performConcat && Ember.isArray(message)) {
            message = message.join('<br />');
        }

        // return an array of errors by default
        if (!performConcat && typeof message === 'string') {
            message = [message];
        }

        return message;
    };

    __exports__.getRequestErrorMessage = getRequestErrorMessage;
    __exports__.ajax = ajax;
    __exports__["default"] = ajax;
  });
define("ghost/utils/bound-one-way", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
     * Defines a property similarly to `Ember.computed.oneway`,
     * save that while a `oneway` loses its binding upon being set,
     * the `BoundOneWay` will continue to listen for upstream changes.
     *
     * This is an ideal tool for working with values inside of {{input}}
     * elements.
     * @param transform: a function to transform the **upstream** value.
     */
    var BoundOneWay = function (upstream, transform) {
        if (typeof transform !== 'function') {
            //default to the identity function
            transform = function (value) { return value; };
        }
        return function (key, value) {
            return arguments.length > 1 ? value : transform(this.get(upstream));
        }.property(upstream);
    };

    __exports__["default"] = BoundOneWay;
  });
define("ghost/utils/caja-sanitizers", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
     * google-caja uses url() and id() to verify if the values are allowed.
     */
    var url,
        id;

    /**
     * Check if URL is allowed
     * URLs are allowed if they start with http://, https://, or /.
     */
    var url = function (url) {
    	url = url.toString().replace(/['"]+/g, '');
        if (/^https?:\/\//.test(url) || /^\//.test(url)) {
            return url;
        }
    };

    /**
     * Check if ID is allowed
     * All ids are allowed at the moment.
     */
    var id = function (id) {
        return id;
    };

    __exports__["default"] = {
        url: url,
        id: id
    };
  });
define("ghost/utils/codemirror-mobile", 
  ["ghost/assets/lib/touch-editor","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /*global CodeMirror, device, FastClick*/
    var createTouchEditor = __dependency1__["default"];

    var setupMobileCodeMirror,
        TouchEditor,
        init;

    setupMobileCodeMirror = function setupMobileCodeMirror() {
        var noop = function () {},
            key;

        for (key in CodeMirror) {
            if (CodeMirror.hasOwnProperty(key)) {
                CodeMirror[key] = noop;
            }
        }

        CodeMirror.fromTextArea = function (el, options) {
            return new TouchEditor(el, options);
        };

        CodeMirror.keyMap = { basic: {} };
    };

    init = function init() {
        //Codemirror does not function on mobile devices,
        // nor on any iDevice.
        if (device.mobile() || (device.tablet() && device.ios())) {
            $('body').addClass('touch-editor');

            // make editor tabs touch-to-toggle in portrait mode
            $('#entry-markdown-header').on('tap', function () {
                $('.entry-markdown').addClass('active');
                $('.entry-preview').removeClass('active');
            });

            $('#entry-preview-header').on('tap', function () {
                $('.entry-markdown').removeClass('active');
                $('.entry-preview').addClass('active');
            });


            Ember.touchEditor = true;
            //initialize FastClick to remove touch delays
            Ember.run.scheduleOnce('afterRender', null, function () {
                FastClick.attach(document.body);
            });
            TouchEditor = createTouchEditor();
            setupMobileCodeMirror();
        }
    };

    __exports__["default"] = {
        createIfMobile: init
    };
  });
define("ghost/utils/codemirror-shortcuts", 
  ["ghost/utils/titleize","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /* global CodeMirror, moment */
    /** Set up a shortcut function to be called via router actions.
     *  See editor-route-base
     */

    var titleize = __dependency1__["default"];

    function init() {
        //Used for simple, noncomputational replace-and-go! shortcuts.
        //  See default case in shortcut function below.
        CodeMirror.prototype.simpleShortcutSyntax = {
            bold: '**$1**',
            italic: '*$1*',
            strike: '~~$1~~',
            code: '`$1`',
            link: '[$1](http://)',
            image: '![$1](http://)',
            blockquote: '> $1'
        };
        CodeMirror.prototype.shortcut = function (type) {
            var text = this.getSelection(),
                cursor = this.getCursor(),
                line = this.getLine(cursor.line),
                fromLineStart = {line: cursor.line, ch: 0},
                toLineEnd = {line: cursor.line, ch: line.length},
                md, letterCount, textIndex, position;
            switch (type) {
            case 'h1':
                line = line.replace(/^#* /, '');
                this.replaceRange('# ' + line, fromLineStart, toLineEnd);
                this.setCursor(cursor.line, cursor.ch + 2);
                return;
            case 'h2':
                line = line.replace(/^#* /, '');
                this.replaceRange('## ' + line, fromLineStart, toLineEnd);
                this.setCursor(cursor.line, cursor.ch + 3);
                return;
            case 'h3':
                line = line.replace(/^#* /, '');
                this.replaceRange('### ' + line, fromLineStart, toLineEnd);
                this.setCursor(cursor.line, cursor.ch + 4);
                return;
            case 'h4':
                line = line.replace(/^#* /, '');
                this.replaceRange('#### ' + line, fromLineStart, toLineEnd);
                this.setCursor(cursor.line, cursor.ch + 5);
                return;
            case 'h5':
                line = line.replace(/^#* /, '');
                this.replaceRange('##### ' + line, fromLineStart, toLineEnd);
                this.setCursor(cursor.line, cursor.ch + 6);
                return;
            case 'h6':
                line = line.replace(/^#* /, '');
                this.replaceRange('###### ' + line, fromLineStart, toLineEnd);
                this.setCursor(cursor.line, cursor.ch + 7);
                return;
            case 'link':
                md = this.simpleShortcutSyntax.link.replace('$1', text);
                this.replaceSelection(md, 'end');
                if (!text) {
                    this.setCursor(cursor.line, cursor.ch + 1);
                } else {
                    textIndex = line.indexOf(text, cursor.ch - text.length);
                    position = textIndex + md.length - 1;
                    this.setSelection({
                        line: cursor.line,
                        ch: position - 7
                    }, {
                        line: cursor.line,
                        ch: position
                    });
                }
                return;
            case 'image':
                md = this.simpleShortcutSyntax.image.replace('$1', text);
                if (line !== '') {
                    md = '\n\n' + md;
                }
                this.replaceSelection(md, 'end');
                cursor = this.getCursor();
                this.setSelection({line: cursor.line, ch: cursor.ch - 8}, {line: cursor.line, ch: cursor.ch - 1});
                return;
            case 'list':
                md = text.replace(/^(\s*)(\w\W*)/gm, '$1* $2');
                this.replaceSelection(md, 'end');
                return;
            case 'currentDate':
                md = moment(new Date()).format('D MMMM YYYY');
                this.replaceSelection(md, 'end');
                return;
            case 'uppercase':
                md = text.toLocaleUpperCase();
                break;
            case 'lowercase':
                md = text.toLocaleLowerCase();
                break;
            case 'titlecase':
                md = titleize(text);
                break;
            /** @TODO
            case 'copyHTML':
                converter = new Showdown.converter();
                if (text) {
                    md = converter.makeHtml(text);
                } else {
                    md = converter.makeHtml(this.getValue());
                }

                $(".modal-copyToHTML-content").text(md).selectText();
                break;
            */
            default:
                if (this.simpleShortcutSyntax[type]) {
                    md = this.simpleShortcutSyntax[type].replace('$1', text);
                }
            }
            if (md) {
                this.replaceSelection(md, 'end');
                if (!text) {
                    letterCount = md.length;
                    this.setCursor({
                        line: cursor.line,
                        ch: cursor.ch + (letterCount / 2)
                    });
                }
            }
        };
    }

    __exports__["default"] = {
        init: init
    };
  });
define("ghost/utils/date-formatting", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /* global moment */
    var parseDateFormats = ['DD MMM YY @ HH:mm', 'DD MMM YY HH:mm',
                            'DD MMM YYYY @ HH:mm', 'DD MMM YYYY HH:mm',
                            'DD/MM/YY @ HH:mm', 'DD/MM/YY HH:mm',
                            'DD/MM/YYYY @ HH:mm', 'DD/MM/YYYY HH:mm',
                            'DD-MM-YY @ HH:mm', 'DD-MM-YY HH:mm',
                            'DD-MM-YYYY @ HH:mm', 'DD-MM-YYYY HH:mm',
                            'YYYY-MM-DD @ HH:mm', 'YYYY-MM-DD HH:mm',
                            'DD MMM @ HH:mm', 'DD MMM HH:mm'],
        displayDateFormat = 'DD MMM YY @ HH:mm';

    /**
     * Add missing timestamps
     */
    var verifyTimeStamp = function (dateString) {
        if (dateString && !dateString.slice(-5).match(/\d+:\d\d/)) {
            dateString += ' 12:00';
        }
        return dateString;
    };

    //Parses a string to a Moment
    var parseDateString = function (value) {
        return value ? moment(verifyTimeStamp(value), parseDateFormats, true) : undefined;
    };

    //Formats a Date or Moment
    var formatDate = function (value) {
        return verifyTimeStamp(value ? moment(value).format(displayDateFormat) : '');
    };

    __exports__.parseDateString = parseDateString;
    __exports__.formatDate = formatDate;
  });
define("ghost/utils/editor-shortcuts", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var shortcuts = {},
        ctrlOrCmd = navigator.userAgent.indexOf('Mac') !== -1 ? 'command' : 'ctrl';
    //
    //General editor shortcuts
    //

    shortcuts[ctrlOrCmd + '+s'] = 'save';
    shortcuts[ctrlOrCmd + '+alt+p'] = 'publish';
    shortcuts['alt+shift+z'] = 'toggleZenMode';

    //
    //CodeMirror Markdown Shortcuts
    //

    //Text
    shortcuts['ctrl+alt+u'] = {action: 'codeMirrorShortcut', options: {type: 'strike'}};
    shortcuts[ctrlOrCmd + '+b'] = {action: 'codeMirrorShortcut', options: {type: 'bold'}};
    shortcuts[ctrlOrCmd + '+i'] = {action: 'codeMirrorShortcut', options: {type: 'italic'}};

    shortcuts['ctrl+U'] = {action: 'codeMirrorShortcut', options: {type: 'uppercase'}};
    shortcuts['ctrl+shift+U'] = {action: 'codeMirrorShortcut', options: {type: 'lowercase'}};
    shortcuts['ctrl+alt+shift+U'] = {action: 'codeMirrorShortcut', options: {type: 'titlecase'}};

    //Headings
    shortcuts['ctrl+alt+1'] = {action: 'codeMirrorShortcut', options: {type: 'h1'}};
    shortcuts['ctrl+alt+2'] = {action: 'codeMirrorShortcut', options: {type: 'h2'}};
    shortcuts['ctrl+alt+3'] = {action: 'codeMirrorShortcut', options: {type: 'h3'}};
    shortcuts['ctrl+alt+4'] = {action: 'codeMirrorShortcut', options: {type: 'h4'}};
    shortcuts['ctrl+alt+5'] = {action: 'codeMirrorShortcut', options: {type: 'h5'}};
    shortcuts['ctrl+alt+6'] = {action: 'codeMirrorShortcut', options: {type: 'h6'}};

    //Formatting
    shortcuts['ctrl+q'] = {action: 'codeMirrorShortcut', options: {type: 'blockquote'}};
    shortcuts['ctrl+l'] = {action: 'codeMirrorShortcut', options: {type: 'list'}};

    //Insert content
    shortcuts['ctrl+shift+1'] = {action: 'codeMirrorShortcut', options: {type: 'currentDate'}};
    shortcuts[ctrlOrCmd + '+k'] = {action: 'codeMirrorShortcut', options: {type: 'link'}};
    shortcuts[ctrlOrCmd + '+shift+i'] = {action: 'codeMirrorShortcut', options: {type: 'image'}};
    shortcuts[ctrlOrCmd + '+shift+k'] = {action: 'codeMirrorShortcut', options: {type: 'code'}};

    //Currently broken CodeMirror Markdown shortcuts.
    // Some may be broken due to a conflict with CodeMirror commands.
    // (see http://codemirror.net/doc/manual.html#commands)
    //
    //shortcuts[ctrlOrCmd + '+c'] = {action: 'codeMirrorShortcut', options: {type: 'copyHTML'}};

    __exports__["default"] = shortcuts;
  });
define("ghost/utils/ghost-paths", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var makeRoute = function (root, args) {
        var parts = Array.prototype.slice.call(args, 0).join('/'),
            route = [root, parts].join('/');

        if (route.slice(-1) !== '/') {
            route += '/';
        }

        return route;
    };


    function ghostPaths() {
        var path = window.location.pathname,
            subdir = path.substr(0, path.search('/ghost/')),
            adminRoot = subdir + '/ghost',
            apiRoot = subdir + '/ghost/api/v0.1';

        function assetUrl(src) {
            return subdir + src;
        }

        return {
            subdir: subdir,
            blogRoot: subdir + '/',
            adminRoot: adminRoot,
            apiRoot: apiRoot,
            userImage: assetUrl('/assets/img/user-image.png'),
            errorImageSrc: assetUrl('/ghost/img/404-ghost@2x.png'),
            errorImageSrcSet: assetUrl('/ghost/img/404-ghost.png') + ' 1x, ' +
                assetUrl('/ghost/img/404-ghost@2x.png') + ' 2x',

            url: {
                admin: function () {
                    return makeRoute(adminRoot, arguments);
                },

                api: function () {
                    return makeRoute(apiRoot, arguments);
                },

                asset: assetUrl
            }
        };
    }

    __exports__["default"] = ghostPaths;
  });
define("ghost/utils/link-view", 
  [],
  function() {
    "use strict";
    Ember.LinkView.reopen({
        active: Ember.computed('resolvedParams', 'routeArgs', function () {
            var isActive = this._super();

            Ember.set(this, 'alternateActive', isActive);

            return isActive;
        })
    });
  });
define("ghost/utils/mobile", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var mobileQuery = matchMedia('(max-width: 800px)'),

        responsiveAction = function responsiveAction(event, mediaCondition, cb) {
            if (!window.matchMedia(mediaCondition).matches) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            cb();
        };

    __exports__.mobileQuery = mobileQuery;
    __exports__.responsiveAction = responsiveAction;
    __exports__["default"] = {
        mobileQuery: mobileQuery,
        responsiveAction: responsiveAction
    };
  });
define("ghost/utils/notifications", 
  ["ghost/models/notification","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Notification = __dependency1__["default"];

    var Notifications = Ember.ArrayProxy.extend({
        delayedNotifications: [],
        content: Ember.A(),
        timeout: 3000,

        pushObject: function (object) {
            // object can be either a DS.Model or a plain JS object, so when working with
            // it, we need to handle both cases.

            // make sure notifications have all the necessary properties set.
            if (typeof object.toJSON === 'function') {
                // working with a DS.Model

                if (object.get('location') === '') {
                    object.set('location', 'bottom');
                }
            }
            else {
                if (!object.location) {
                    object.location = 'bottom';
                }
            }

            this._super(object);
        },
        handleNotification: function (message, delayed) {
            if (!message.status) {
                message.status = 'passive';
            }

            if (!delayed) {
                this.pushObject(message);
            } else {
                this.delayedNotifications.push(message);
            }
        },
        showError: function (message, options) {
            options = options || {};

            if (!options.doNotClosePassive) {
                this.closePassive();
            }

            this.handleNotification({
                type: 'error',
                message: message
            }, options.delayed);
        },
        showErrors: function (errors, options) {
            options = options || {};

            if (!options.doNotClosePassive) {
                this.closePassive();
            }

            for (var i = 0; i < errors.length; i += 1) {
                this.showError(errors[i].message || errors[i], { doNotClosePassive: true });
            }
        },
        showAPIError: function (resp, options) {
            options = options || {};

            if (!options.doNotClosePassive) {
                this.closePassive();
            }

            options.defaultErrorText = options.defaultErrorText || 'There was a problem on the server, please try again.';

            if (resp && resp.jqXHR && resp.jqXHR.responseJSON && resp.jqXHR.responseJSON.error) {
                this.showError(resp.jqXHR.responseJSON.error, options);
            } else if (resp && resp.jqXHR && resp.jqXHR.responseJSON && resp.jqXHR.responseJSON.errors) {
                this.showErrors(resp.jqXHR.responseJSON.errors, options);
            } else if (resp && resp.jqXHR && resp.jqXHR.responseJSON && resp.jqXHR.responseJSON.message) {
                this.showError(resp.jqXHR.responseJSON.message, options);
            } else {
                this.showError(options.defaultErrorText, { doNotClosePassive: true });
            }
        },
        showInfo: function (message, options) {
            options = options || {};

            if (!options.doNotClosePassive) {
                this.closePassive();
            }

            this.handleNotification({
                type: 'info',
                message: message
            }, options.delayed);
        },
        showSuccess: function (message, options) {
            options = options || {};

            if (!options.doNotClosePassive) {
                this.closePassive();
            }

            this.handleNotification({
                type: 'success',
                message: message
            }, options.delayed);
        },
        // @Todo this function isn't referenced anywhere. Should it be removed?
        showWarn: function (message, options) {
            options = options || {};

            if (!options.doNotClosePassive) {
                this.closePassive();
            }

            this.handleNotification({
                type: 'warn',
                message: message
            }, options.delayed);
        },
        displayDelayed: function () {
            var self = this;

            self.delayedNotifications.forEach(function (message) {
                self.pushObject(message);
            });
            self.delayedNotifications = [];
        },
        closeNotification: function (notification) {
            var self = this;

            if (notification instanceof Notification) {
                notification.deleteRecord();
                notification.save().finally(function () {
                    self.removeObject(notification);
                });
            } else {
                this.removeObject(notification);
            }
        },
        closePassive: function () {
            this.set('content', this.rejectBy('status', 'passive'));
        },
        closePersistent: function () {
            this.set('content', this.rejectBy('status', 'persistent'));
        },
        closeAll: function () {
            this.clear();
        }
    });

    __exports__["default"] = Notifications;
  });
define("ghost/utils/set-scroll-classname", 
  ["exports"],
  function(__exports__) {
    "use strict";
    // ## scrollShadow
    // This adds a 'scroll' class to the targeted element when the element is scrolled
    // `this` is expected to be a jQuery-wrapped element
    // **target:** The element in which the class is applied. Defaults to scrolled element.
    // **class-name:** The class which is applied.
    // **offset:** How far the user has to scroll before the class is applied.
    var setScrollClassName = function (options) {
        var $target = options.target || this,
            offset = options.offset,
            className = options.className || 'scrolling';

        if (this.scrollTop() > offset) {
            $target.addClass(className);
        } else {
            $target.removeClass(className);
        }
    };

    __exports__["default"] = setScrollClassName;
  });
define("ghost/utils/text-field", 
  [],
  function() {
    "use strict";
    Ember.TextField.reopen({
        attributeBindings: ['autofocus']
    });
  });
define("ghost/utils/titleize", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var lowerWords = ['of', 'a', 'the', 'and', 'an', 'or', 'nor', 'but', 'is', 'if',
                      'then', 'else', 'when', 'at', 'from', 'by', 'on', 'off', 'for',
                      'in', 'out', 'over', 'to', 'into', 'with'];

    function titleize(input) {
        var words = input.split(' ').map(function (word, index) {
            if (index === 0 || lowerWords.indexOf(word) === -1) {
                word = Ember.String.capitalize(word);
            }

            return word;
        });

        return words.join(' ');
    }

    __exports__["default"] = titleize;
  });
define("ghost/utils/validator-extensions", 
  ["exports"],
  function(__exports__) {
    "use strict";
    function init() {
        // Provide a few custom validators
        //
        validator.extend('empty', function (str) {
            return Ember.isBlank(str);
        });

        validator.extend('notContains', function (str, badString) {
            return !_.contains(str, badString);
        });
    }

    __exports__["default"] = {
        init: init
    };
  });
define("ghost/utils/word-count", 
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = function (s) {
        s = s.replace(/(^\s*)|(\s*$)/gi, ''); // exclude  start and end white-space
        s = s.replace(/[ ]{2,}/gi, ' '); // 2 or more space to 1
        s = s.replace(/\n /gi, '\n'); // exclude newline with a start spacing
        s = s.replace(/\n+/gi, '\n');
        return s.split(/ |\n/).length;
    }
  });
define("ghost/validators/forgotten", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var ForgotValidator = Ember.Object.create({
        check: function (model) {
            var data = model.getProperties('email'),
                validationErrors = [];

            if (!validator.isEmail(data.email)) {
                validationErrors.push({
                    message: 'Invalid email address'
                });
            }

            return validationErrors;
        }
    });

    __exports__["default"] = ForgotValidator;
  });
define("ghost/validators/new-user", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var NewUserValidator = Ember.Object.extend({
        check: function (model) {
            var data = model.getProperties('name', 'email', 'password'),
                validationErrors = [];

            if (!validator.isLength(data.name, 1)) {
                validationErrors.push({
                    message: 'Please enter a name.'
                });
            }

            if (!validator.isEmail(data.email)) {
                validationErrors.push({
                    message: 'Invalid Email.'
                });
            }

            if (!validator.isLength(data.password, 8)) {
                validationErrors.push({
                    message: 'Password must be at least 8 characters long.'
                });
            }

            return validationErrors;
        }
    });

    __exports__["default"] = NewUserValidator;
  });
define("ghost/validators/post", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var PostValidator = Ember.Object.create({
        check: function (model) {
            var validationErrors = [],

                title = model.get('title');

            if (validator.empty(title)) {
                validationErrors.push({
                    message: 'You must specify a title for the post.'
                });
            }

            return validationErrors;
        }
    });

    __exports__["default"] = PostValidator;
  });
define("ghost/validators/reset", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var ResetValidator = Ember.Object.create({
        check: function (model) {

            var data = model.getProperties('passwords'),
                p1 = data.passwords.newPassword,
                p2 = data.passwords.ne2Password,
                validationErrors = [];

            if (!validator.equals(p1, p2)) {
                validationErrors.push({
                    message: 'The two new passwords don\'t match.'
                });
            }

            if (!validator.isLength(p1, 8)) {
                validationErrors.push({
                    message: 'The password is not long enough.'
                });
            }
            return validationErrors;
        }
    });

    __exports__["default"] = ResetValidator;
  });
define("ghost/validators/setting", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var SettingValidator = Ember.Object.create({
        check: function (model) {
            var validationErrors = [],
                title = model.get('title'),
                description = model.get('description'),
                email = model.get('email'),
                postsPerPage = model.get('postsPerPage');

            if (!validator.isLength(title, 0, 150)) {
                validationErrors.push({ message: 'Title is too long' });
            }

            if (!validator.isLength(description, 0, 200)) {
                validationErrors.push({ message: 'Description is too long' });
            }

            if (!validator.isEmail(email) || !validator.isLength(email, 0, 254)) {
                validationErrors.push({ message: 'Please supply a valid email address' });
            }

            if (!validator.isInt(postsPerPage) || postsPerPage > 1000) {
                validationErrors.push({ message: 'Please use a number less than 1000' });
            }

            if (!validator.isInt(postsPerPage) || postsPerPage < 0) {
                validationErrors.push({ message: 'Please use a number greater than 0' });
            }

            return validationErrors;
        }
    });

    __exports__["default"] = SettingValidator;
  });
define("ghost/validators/setup", 
  ["ghost/validators/new-user","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var NewUserValidator = __dependency1__["default"];

    var SetupValidator = NewUserValidator.extend({
        check: function (model) {
            var data = model.getProperties('blogTitle'),
                validationErrors = this._super(model);

            if (!validator.isLength(data.blogTitle, 1)) {
                validationErrors.push({
                    message: 'Please enter a blog title.'
                });
            }

            return validationErrors;
        }
    }).create();

    __exports__["default"] = SetupValidator;
  });
define("ghost/validators/signin", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var SigninValidator = Ember.Object.create({
        check: function (model) {
            var data = model.getProperties('identification', 'password'),
                validationErrors = [];

            if (!validator.isEmail(data.identification)) {
                validationErrors.push('Invalid Email');
            }

            if (!validator.isLength(data.password || '', 1)) {
                validationErrors.push('Please enter a password');
            }

            return validationErrors;
        }
    });

    __exports__["default"] = SigninValidator;
  });
define("ghost/validators/signup", 
  ["ghost/validators/new-user","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var NewUserValidator = __dependency1__["default"];

    __exports__["default"] = NewUserValidator.create();
  });
define("ghost/validators/user", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var UserValidator = Ember.Object.create({
        check: function (model) {
            var validator = this.validators[model.get('status')];

            if (typeof validator !== 'function') {
                return [];
            }

            return validator(model);
        },

        validators: {
            invited: function (model) {
                var validationErrors = [],
                    email = model.get('email'),
                    roles = model.get('roles');

                if (!validator.isEmail(email)) {
                    validationErrors.push({ message: 'Please supply a valid email address' });
                }

                if (roles.length < 1) {
                    validationErrors.push({ message: 'Please select a role' });
                }

                return validationErrors;
            },

            active: function (model) {
                var validationErrors = [],
                    name = model.get('name'),
                    bio = model.get('bio'),
                    email = model.get('email'),
                    location = model.get('location'),
                    website = model.get('website');

                if (!validator.isLength(name, 0, 150)) {
                    validationErrors.push({ message: 'Name is too long' });
                }

                if (!validator.isLength(bio, 0, 200)) {
                    validationErrors.push({ message: 'Bio is too long' });
                }

                if (!validator.isEmail(email)) {
                    validationErrors.push({ message: 'Please supply a valid email address' });
                }

                if (!validator.isLength(location, 0, 150)) {
                    validationErrors.push({ message: 'Location is too long' });
                }

                if (!_.isEmpty(website) &&
                    (!validator.isURL(website, { protocols: ['http', 'https'], require_protocol: true }) ||
                    !validator.isLength(website, 0, 2000))) {

                    validationErrors.push({ message: 'Website is not a valid url' });
                }

                return validationErrors;
            }
        }
    });

    __exports__["default"] = UserValidator;
  });
define("ghost/views/application", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var ApplicationView = Ember.View.extend({

        setupCloseSidebar: function () {

            // #### Navigating within the sidebar closes it.
            $(document).on('click', '.js-close-sidebar', function () {
                $('body').removeClass('off-canvas');
            });

            // #### Add the blog URL to the <a> version of the ghost logo
            $('.ghost-logo-link').attr('href', this.get('controller.ghostPaths').blogRoot);

        }.on('didInsertElement'),
        
        actions: {
            //Sends the user to the front if they're not on mobile,
            //otherwise toggles the sidebar.
            toggleSidebarOrGoHome: function () {
                if (window.matchMedia('(max-width: 650px)').matches) {
                    $('body').toggleClass('off-canvas');
                }
                else {
                    window.location = this.get('controller.ghostPaths').blogRoot;
                }
            }
        }
    });

    __exports__["default"] = ApplicationView;
  });
define("ghost/views/content-list-content-view", 
  ["ghost/utils/set-scroll-classname","ghost/mixins/pagination-view-infinite-scroll","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var setScrollClassName = __dependency1__["default"];
    var PaginationViewMixin = __dependency2__["default"];


    var PostsListView = Ember.View.extend(PaginationViewMixin, {
        classNames: ['content-list-content'],

        didInsertElement: function () {
            this._super();
            var el = this.$();
            el.on('scroll', Ember.run.bind(el, setScrollClassName, {
                target: el.closest('.content-list'),
                offset: 10
            }));
        }
    });

    __exports__["default"] = PostsListView;
  });
define("ghost/views/content-preview-content-view", 
  ["ghost/utils/set-scroll-classname","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var setScrollClassName = __dependency1__["default"];

    var PostContentView = Ember.View.extend({
        classNames: ['content-preview-content'],

        didInsertElement: function () {
            var el = this.$();
            el.on('scroll', Ember.run.bind(el, setScrollClassName, {
                target: el.closest('.content-preview'),
                offset: 10
            }));
        },

        willDestroyElement: function () {
            var el = this.$();
            el.off('scroll');
        }
    });

    __exports__["default"] = PostContentView;
  });
define("ghost/views/editor-save-button", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var EditorSaveButtonView = Ember.View.extend({
        templateName: 'editor-save-button',
        tagName: 'section',
        classNames: ['js-publish-splitbutton'],
        classNameBindings: ['isDangerous:splitbutton-delete:splitbutton-save'],

        //Tracks whether we're going to change the state of the post on save
        isDangerous: function () {
            return this.get('controller.isPublished') !== this.get('controller.willPublish');
        }.property('controller.isPublished', 'controller.willPublish'),

        'save-text': function () {
            return this.get('controller.willPublish') ? this.get('publish-text') : this.get('draft-text');
        }.property('controller.willPublish'),

        'publish-text': function () {
            return this.get('controller.isPublished') ? 'Update Post' : 'Publish Now';
        }.property('controller.isPublished'),

        'draft-text': function () {
            return this.get('controller.isPublished') ? 'Unpublish' : 'Save Draft';
        }.property('controller.isPublished')
    });

    __exports__["default"] = EditorSaveButtonView;
  });
define("ghost/views/editor/edit", 
  ["ghost/mixins/editor-base-view","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var EditorViewMixin = __dependency1__["default"];

    var EditorView = Ember.View.extend(EditorViewMixin, {
        tagName: 'section',
        classNames: ['entry-container']
    });

    __exports__["default"] = EditorView;
  });
define("ghost/views/editor/new", 
  ["ghost/mixins/editor-base-view","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var EditorViewMixin = __dependency1__["default"];

    var EditorNewView = Ember.View.extend(EditorViewMixin, {
        tagName: 'section',
        templateName: 'editor/edit',
        classNames: ['entry-container']
    });

    __exports__["default"] = EditorNewView;
  });
define("ghost/views/item-view", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var ItemView = Ember.View.extend({
        classNameBindings: ['active'],

        active: function () {
            return this.get('childViews.firstObject.active');
        }.property('childViews.firstObject.active')
    });

    __exports__["default"] = ItemView;
  });
define("ghost/views/post-item-view", 
  ["ghost/views/item-view","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var itemView = __dependency1__["default"];

    var PostItemView = itemView.extend({
        classNameBindings: ['isFeatured:featured', 'isPage:page'],

        isFeatured: Ember.computed.alias('controller.model.featured'),

        isPage: Ember.computed.alias('controller.model.page'),
        
        //Edit post on double click
        doubleClick: function () {
            this.get('controller').send('openEditor', this.get('controller.model'));
        }
        
    });

    __exports__["default"] = PostItemView;
  });
define("ghost/views/post-settings-menu-view", 
  ["ghost/utils/date-formatting","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /* global moment */
    var formatDate = __dependency1__.formatDate;

    var PostSettingsMenuView = Ember.View.extend({
        templateName: 'post-settings-menu',
        publishedAtBinding: Ember.Binding.oneWay('controller.publishedAt'),
        datePlaceholder: function () {
            return formatDate(moment());
        }.property('controller.publishedAt')
    });

    __exports__["default"] = PostSettingsMenuView;
  });
define("ghost/views/post-tags-input", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var PostTagsInputView = Ember.View.extend({
        tagName: 'section',
        elementId: 'entry-tags',
        classNames: 'left',

        templateName: 'post-tags-input',

        hasFocus: false,

        keys: {
            BACKSPACE: 8,
            TAB: 9,
            ENTER: 13,
            ESCAPE: 27,
            UP: 38,
            DOWN: 40,
            NUMPAD_ENTER: 108,
            COMMA: 188
        },

        didInsertElement: function () {
            this.get('controller').send('loadAllTags');
        },

        willDestroyElement: function () {
            this.get('controller').send('reset');
        },

        overlayStyles: function () {
            var styles = [],
                leftPos;

            if (this.get('hasFocus') && this.get('controller.suggestions.length')) {
                leftPos = this.$().find('#tags').position().left;
                styles.push('display: block');
                styles.push('left: ' + leftPos + 'px');
            } else {
                styles.push('display: none');
                styles.push('left', 0);
            }

            return styles.join(';');
        }.property('hasFocus', 'controller.suggestions.length'),


        tagInputView: Ember.TextField.extend({
            focusIn: function () {
                this.get('parentView').set('hasFocus', true);
            },

            focusOut: function () {
                this.get('parentView').set('hasFocus', false);

                // if (!Ember.isEmpty(this.get('value'))) {
                //     this.get('parentView.controller').send('addNewTag');
                // }
            },

            keyDown: function (event) {
                var controller = this.get('parentView.controller'),
                    keys = this.get('parentView.keys'),
                    hasValue;

                switch (event.keyCode) {
                    case keys.UP:
                        event.preventDefault();
                        controller.send('selectPreviousSuggestion');
                        break;

                    case keys.DOWN:
                        event.preventDefault();
                        controller.send('selectNextSuggestion');
                        break;

                    case keys.TAB:
                    case keys.ENTER:
                    case keys.NUMPAD_ENTER:
                    case keys.COMMA:
                        if (event.keyCode === keys.COMMA && event.shiftKey) {
                            break;
                        }

                        if (controller.get('selectedSuggestion')) {
                            event.preventDefault();
                            controller.send('addSelectedSuggestion');
                        } else {
                            // allow user to tab out of field if input is empty
                            hasValue = !Ember.isEmpty(this.get('value'));
                            if (hasValue || event.keyCode !== keys.TAB) {
                                event.preventDefault();
                                controller.send('addNewTag');
                            }
                        }
                        break;

                    case keys.BACKSPACE:
                        if (Ember.isEmpty(this.get('value'))) {
                            event.preventDefault();
                            controller.send('deleteLastTag');
                        }
                        break;

                    case keys.ESCAPE:
                        event.preventDefault();
                        controller.send('reset');
                        break;
                }
            }
        }),


        tagView: Ember.View.extend({
            tagName: 'span',
            classNames: 'tag',

            tag: null,

            click: function () {
                this.get('parentView.controller').send('deleteTag', this.get('tag'));
            }
        }),


        suggestionView: Ember.View.extend({
            tagName: 'li',
            classNameBindings: 'suggestion.selected',

            suggestion: null,

            // we can't use the 'click' event here as the focusOut event on the
            // input will fire first

            mouseDown: function (event) {
                event.preventDefault();
            },

            mouseUp: function (event) {
                event.preventDefault();
                this.get('parentView.controller').send('addTag',
                    this.get('suggestion.tag'));
            },
        })
    });

    __exports__["default"] = PostTagsInputView;
  });
define("ghost/views/posts", 
  ["ghost/utils/mobile","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var mobileQuery = __dependency1__.mobileQuery;
    var responsiveAction = __dependency1__.responsiveAction;

    var PostsView = Ember.View.extend({
        target: Ember.computed.alias('controller'),
        classNames: ['content-view-container'],
        tagName: 'section',

        mobileInteractions: function () {
            Ember.run.scheduleOnce('afterRender', this, function () {
                var self = this;

                $(window).resize(function () {
                    if (!mobileQuery.matches) {
                        self.send('resetContentPreview');
                    }
                });

                // ### Add the blog URL to the <a> version of the ghost logo
                $('.ghost-logo-link').attr('href', this.get('controller.ghostPaths').blogRoot);

                // ### Show content preview when swiping left on content list
                $('.manage').on('click', '.content-list ol li', function (event) {
                    responsiveAction(event, '(max-width: 800px)', function () {
                        self.send('showContentPreview');
                    });
                });

                // ### Hide content preview
                $('.manage').on('click', '.content-preview .button-back', function (event) {
                    responsiveAction(event, '(max-width: 800px)', function () {
                        self.send('hideContentPreview');
                    });
                });
            });
        }.on('didInsertElement'),
    });

    __exports__["default"] = PostsView;
  });
define("ghost/views/settings", 
  ["ghost/utils/mobile","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var mobileQuery = __dependency1__.mobileQuery;

    var SettingsView = Ember.View.extend({
        classNames: ['wrapper'],
        // used by SettingsContentBaseView and on resize to mobile from desktop
        showSettingsContent: function () {
            if (mobileQuery.matches) {
                $('.settings-sidebar').animate({right: '100%', left: '-110%', 'margin-right': '15px'}, 300);
                $('.settings-content').animate({right: '0', left: '0', 'margin-left': '0'}, 300);
                $('.settings-header-inner').css('display', 'block');
            }
        },
        // used by SettingsIndexView
        showSettingsMenu: function () {
            if (mobileQuery.matches) {
                $('.settings-header-inner').css('display', 'none');
                $('.settings-sidebar').animate({right: '0', left: '0', 'margin-right': '0'}, 300);
                $('.settings-content').animate({right: '-100%', left: '100%', 'margin-left': '15'}, 300);
            }
        },
        showAll: function () {
            //Remove any styles applied by jQuery#animate
            $('.settings-sidebar, .settings-content').removeAttr('style');
        },

        mobileInteractions: function () {
            this.set('changeLayout', _.bind(function changeLayout(mq) {
                if (mq.matches) {
                    //transitioned to mobile layout, so show content
                    this.showSettingsContent();
                } else {
                    //went from mobile to desktop
                    this.showAll();
                }
            }, this));
            mobileQuery.addListener(this.changeLayout);
        }.on('didInsertElement'),

        removeMobileInteractions: function () {
            mobileQuery.removeListener(this.changeLayout);
        }.on('willDestroyElement')
    });

    __exports__["default"] = SettingsView;
  });
define("ghost/views/settings/apps", 
  ["ghost/views/settings/content-base","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var BaseView = __dependency1__["default"];

    var SettingsAppsView = BaseView.extend();

    __exports__["default"] = SettingsAppsView;
  });
define("ghost/views/settings/content-base", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
     * All settings views other than the index should inherit from this base class.
     * It ensures that the correct screen is showing when a mobile user navigates
     * to a `settings.someRouteThatIsntIndex` route.
     */

    var SettingsContentBaseView = Ember.View.extend({
        tagName: 'section',
        classNames: ['settings-content', 'fade-in'],
        showContent: function () {
            this.get('parentView').showSettingsContent();
        }.on('didInsertElement')
    });

    __exports__["default"] = SettingsContentBaseView;
  });
define("ghost/views/settings/general", 
  ["ghost/views/settings/content-base","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var BaseView = __dependency1__["default"];

    var SettingsGeneralView = BaseView.extend();

    __exports__["default"] = SettingsGeneralView;
  });
define("ghost/views/settings/index", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var SettingsIndexView = Ember.View.extend({
        //Ensure that going to the index brings the menu into view on mobile.
        showMenu: function () {
            this.get('parentView').showSettingsMenu();
        }.on('didInsertElement')
    });

    __exports__["default"] = SettingsIndexView;
  });
define("ghost/views/settings/users", 
  ["ghost/views/settings/content-base","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var BaseView = __dependency1__["default"];

    var SettingsUsersView = BaseView.extend();

    __exports__["default"] = SettingsUsersView;
  });
define("ghost/views/settings/users/user", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var SettingsUserView = Ember.View.extend({
        currentUser: Ember.computed.alias('controller.session.user'),
        
        isNotOwnProfile: Ember.computed('controller.user.id', 'currentUser.id', function () {
            return this.get('controller.user.id') !== this.get('currentUser.id');
        }),
        
        canAssignRoles: Ember.computed.or('currentUser.isAdmin', 'currentUser.isOwner'),

        canMakeOwner: Ember.computed.and('currentUser.isOwner', 'isNotOwnProfile', 'controller.user.isAdmin'),
        
        rolesDropdownIsVisible: Ember.computed.and('isNotOwnProfile', 'canAssignRoles'),

        deleteUserActionIsVisible: Ember.computed('currentUser', 'canAssignRoles', 'controller.user', function () {
            if ((this.get('canAssignRoles') && this.get('isNotOwnProfile') && !this.get('controller.user.isOwner')) ||
                (this.get('currentUser.isEditor') && (!this.get('isNotOwnProfile') ||
                this.get('controller.user.isAuthor')))) {
                return true;
            }
        }),

        userActionsAreVisible: Ember.computed.or('deleteUserActionIsVisible', 'canMakeOwner')

    });

    __exports__["default"] = SettingsUserView;
  });
define("ghost/views/settings/users/users-list-view", 
  ["ghost/mixins/pagination-view-infinite-scroll","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    //import setScrollClassName from 'ghost/utils/set-scroll-classname';
    var PaginationViewMixin = __dependency1__["default"];

    var UsersListView = Ember.View.extend(PaginationViewMixin, {
        classNames: ['settings-users']
    });

    __exports__["default"] = UsersListView;
  });
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
// Loader to create the Ember.js application
/*global require */

window.App = require('ghost/app')['default'].create();
//# sourceMappingURL=ghost.js.map