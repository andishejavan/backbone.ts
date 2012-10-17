var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var Backbone;
(function (Backbone) {
    Backbone.Version = "0.1";
    Backbone.root = window;
    Backbone.$ = jQuery;
    Backbone._ = (Backbone.root)._;
    Backbone.MethodType = {
        CREATE: 'POST',
        UPDATE: 'PUT',
        DELETE: 'DELETE',
        READ: 'GET'
    };
    function sync(method, model, settings) {
        settings || (settings = {
        });
        var params = {
            type: method,
            dataType: 'json',
            url: model.url
        };
        if(model && (method === Backbone.MethodType.CREATE || method === Backbone.MethodType.UPDATE)) {
            params.contentType = 'application/json';
            params.data = JSON.stringify(model.toJSON());
        }
        if(params.type !== 'GET') {
            params.processData = false;
        }
        return Backbone.$.ajax(Backbone._.extend(params, settings));
    }
    Backbone.sync = sync;
    ; ;
    function wrapError(onError, originalModel, options) {
        return function (model, resp) {
            resp = model === originalModel ? resp : model;
            if(onError) {
                onError(originalModel, resp, options);
            } else {
                originalModel.trigger('error', originalModel, resp, options);
            }
        }
    }
    ; ;
    var Events = (function () {
        function Events() {
            this.clear();
        }
        Events.prototype.on = function (event, fn, context) {
            var id = Backbone._.uniqueId("callback_");
            if(this._callbacks[event] === undefined) {
                console.log("Events.on() creating event " + event);
                this._callbacks[event] = {
                };
            }
            if(this._callbacks[event][id] === undefined) {
                this._callbacks[event][id] = {
                    fn: fn,
                    context: (context || this)
                };
            } else {
                this._callbacks[event][id].fn = fn;
                this._callbacks[event][id].context = (context || this);
            }
        };
        Events.prototype.off = function (event, fn) {
            if(this._callbacks[event] !== undefined) {
                if(fn !== undefined) {
                    for(var id in this._callbacks[event]) {
                        if(fn === this._callbacks[event][id].fn) {
                            delete this._callbacks[event][id];
                        }
                    }
                    if(Backbone.$.isEmptyObject(this._callbacks[event])) {
                        delete this._callbacks[event];
                    }
                } else {
                    delete this._callbacks[event];
                }
            }
        };
        Events.prototype.trigger = function (event) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            if(this._callbacks[event] !== undefined) {
                for(var key in this._callbacks[event]) {
                    this._callbacks[event][key].fn.apply(this._callbacks[event][key].context, args);
                }
            }
        };
        Events.prototype.clear = function () {
            this._callbacks = {
            };
        };
        return Events;
    })();
    Backbone.Events = Events;    
    var Event = (function () {
        function Event(fn, event, selector) {
            if (typeof selector === "undefined") { selector = undefined; }
            this.fn = fn;
            this.event = event;
            this.selector = selector;
        }
        return Event;
    })();
    Backbone.Event = Event;    
    var View = (function (_super) {
        __extends(View, _super);
        function View(id, el, model, events) {
            if (typeof model === "undefined") { model = undefined; }
            if (typeof events === "undefined") { events = new Array(); }
                _super.call(this);
            this.id = id;
            this.cid = Backbone._.uniqueId('view_');
            this.model = model;
            this.domEvents = {
            };
            for(var i = 0; i < events.length; i++) {
                this.domEvents[events[i].event] = events[i];
            }
            this.setElement(el, true);
        }
        View.prototype.$ = function (selector) {
            return this.$el.find(selector);
        };
        View.prototype.render = function () {
            return this;
        };
        View.prototype.remove = function () {
            this.$el.remove();
            return this;
        };
        View.prototype.detach = function () {
            this.$el.detach();
            return this;
        };
        View.prototype.setElement = function (el, delegate) {
            if (typeof delegate === "undefined") { delegate = true; }
            if(this.$el) {
                this.undelegateEvents();
            }
            this.$el = Backbone.$(el);
            this.el = this.$el[0];
            if(delegate !== false) {
                this.delegateEvents();
            }
            return this;
        };
        View.prototype.delegateEvents = function () {
            if(Backbone._.isEmpty(this.domEvents)) {
                return;
            }
            this.undelegateEvents();
            for(var key in this.domEvents) {
                var func = Backbone._.bind(this.domEvents[key].fn, this);
                var eventName = this.domEvents[key].event + '.delegateEvents' + this.cid;
                if(this.domEvents[key].selector === undefined) {
                    this.$el.on(eventName, func);
                } else {
                    this.$el.delegate(this.domEvents[key].selector, eventName, func);
                }
            }
        };
        View.prototype.undelegateEvents = function () {
            this.$el.off('.delegateEvents' + this.cid);
        };
        return View;
    })(Events);
    Backbone.View = View;    
    var SetOptions = (function () {
        function SetOptions(silent, unset, changes) {
            if (typeof silent === "undefined") { silent = false; }
            if (typeof unset === "undefined") { unset = false; }
            if (typeof changes === "undefined") { changes = {
            }; }
            this.silent = silent;
            this.unset = unset;
            this.changes = changes;
        }
        return SetOptions;
    })();
    Backbone.SetOptions = SetOptions;    
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(id, attributes) {
            if (typeof attributes === "undefined") { attributes = {
            }; }
                _super.call(this);
            this.idAttribute = 'id';
            this.changed = {
            };
            this._silent = {
            };
            this._pending = {
            };
            this._previousAttributes = {
            };
            this._escapedAttributes = {
            };
            this._changing = false;
            this.sync = Backbone.sync;
            this.id = id;
            this.cid = Backbone._.uniqueId('c');
            this.attributes = attributes;
            this._previousAttributes = Backbone._.clone(this.attributes);
        }
        Model.prototype.toJSON = function () {
            return Backbone._.clone(this.attributes);
        };
        Model.prototype.has = function (attribute) {
            return this.get(attribute) != null;
        };
        Model.prototype.get = function (attribute) {
            return this.attributes[attribute];
        };
        Model.prototype.escape = function (attribute) {
            var html;
            if(html = this._escapedAttributes[attribute]) {
                return html;
            }
            var val = this.get(attribute);
            return this._escapedAttributes[attribute] = Backbone._.escape(val == null ? '' : '' + val);
        };
        Model.prototype.set = function (key, value, options) {
            if (typeof options === "undefined") { options = new SetOptions(); }
            var attrs;
            var attr;
            var val;

            if(Backbone._.isObject(key) || key == null) {
                attrs = key;
            } else {
                attrs = {
                };
                attrs[key] = value;
            }
            if(!attrs) {
                return false;
            }
            if(attrs instanceof Model) {
                attrs = (attrs).attributes;
            }
            if(options.unset) {
                for(attr in attrs) {
                    attrs[attr] = void 0;
                }
            }
            if(!this._validate(attrs)) {
                return false;
            }
            if(this.idAttribute in attrs) {
                this.id = attrs[this.idAttribute];
            }
            var changes = options.changes = {
            };
            var now = this.attributes;
            var escaped = this._escapedAttributes;
            var prev = this._previousAttributes || {
            };
            for(attr in attrs) {
                val = attrs[attr];
                if(!Backbone._.isEqual(now[attr], val) || (options.unset && Backbone._.has(now, attr))) {
                    delete escaped[attr];
                    (options.silent ? this._silent : changes)[attr] = true;
                }
                options.unset ? delete now[attr] : now[attr] = val;
                if(!Backbone._.isEqual(prev[attr], val) || (Backbone._.has(now, attr) != Backbone._.has(prev, attr))) {
                    this.changed[attr] = val;
                    if(!options.silent) {
                        this._pending[attr] = true;
                    }
                } else {
                    delete this.changed[attr];
                    delete this._pending[attr];
                }
            }
            if(!options.silent) {
                this.change();
            }
            return true;
        };
        Model.prototype.unset = function (key, options) {
            options.unset = true;
            return this.set(key, null, options);
        };
        Model.prototype.clear = function (silent) {
            if (typeof silent === "undefined") { silent = false; }
            return this.unset(Backbone._.clone(this.attributes), {
                unset: true
            });
        };
        Model.prototype.fetch = function (settings) {
            var _this = this;
            settings = settings ? Backbone._.clone(settings) : {
            };
            var success = settings.success;
            settings.success = function (resp, status, xhr) {
                if(!_this.set(_this.parse(resp, xhr), settings)) {
                    return false;
                }
                if(success) {
                    (success)(_this, resp);
                }
            };
            settings.error = wrapError(settings.error, this, settings);
            return (this.sync || Backbone.sync).call(this, Backbone.MethodType.READ, this, settings);
        };
        Model.prototype.save = function (key, value, options) {
            var _this = this;
            var attrs;
            var current;

            if(Backbone._.isObject(key) || key == null) {
                attrs = key;
                options = value;
            } else {
                attrs = {
                };
                attrs[key] = value;
            }
            options = options ? Backbone._.clone(options) : {
            };
            if(options.wait) {
                if(!this._validate(attrs, options)) {
                    return false;
                }
                current = Backbone._.clone(this.attributes);
            }
            var silentOptions = Backbone._.extend({
            }, options, {
                silent: true
            });
            if(attrs && !this.set(attrs, options.wait ? silentOptions : options)) {
                return false;
            }
            var success = options.success;
            options.success = function (resp, status, xhr) {
                var serverAttrs = _this.parse(resp, xhr);
                if(options.wait) {
                    delete options.wait;
                    serverAttrs = Backbone._.extend(attrs || {
                    }, serverAttrs);
                }
                if(!_this.set(serverAttrs, options)) {
                    return false;
                }
                if(success) {
                    success(_this, resp);
                } else {
                    _this.trigger('sync', _this, resp, options);
                }
            };
            options.error = wrapError(options.error, this, options);
            var method = this.isNew() ? 'create' : 'update';
            var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
            if(options.wait) {
                this.set(current, silentOptions);
            }
            return xhr;
        };
        Model.prototype.change = function () {
        };
        Model.prototype.validate = function (key, value) {
            return true;
        };
        Model.prototype._validate = function (key, value) {
            return true;
        };
        return Model;
    })(Events);
    Backbone.Model = Model;    
})(Backbone || (Backbone = {}));

