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
    var Events = (function () {
        function Events() {
            this.clear();
        }
        Events.prototype.on = function (event, fn, context) {
            var id = Backbone._.uniqueId("cb_");
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
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(attributes) {
            if (typeof attributes === "undefined") { attributes = {
            }; }
                _super.call(this);
            this.id = undefined;
            this.idAttribute = 'id';
            this.sync = Backbone.sync;
            this._escapedAttributes = {
            };
            this.cid = Backbone._.uniqueId('c');
            this.attributes = attributes;
        }
        Model.prototype.toJSON = function () {
            return Backbone._.clone(this.attributes);
        };
        Model.prototype.has = function (key) {
            return this.attributes[key] != null;
        };
        Model.prototype.get = function (key) {
            return this.attributes[key];
        };
        Model.prototype.escape = function (key) {
            var html;
            if(html = this._escapedAttributes[key]) {
                return html;
            }
            var val = this.get(key);
            return this._escapedAttributes[key] = Backbone._.escape(val == null ? '' : '' + val);
        };
        Model.prototype.set = function (key, value) {
            if(!this.validate(key, value)) {
                return false;
            }
            this.attributes[key] = value;
            return true;
        };
        Model.prototype.setAll = function (attributes) {
            if(!this.validateAll(attributes)) {
                return false;
            }
            for(var key in attributes) {
                this.set(key, attributes[key]);
            }
            return true;
        };
        Model.prototype.unset = function (key) {
            if(!this.validate(key, undefined)) {
                return false;
            }
            delete this.attributes[key];
            return true;
        };
        Model.prototype.unsetAll = function (attributes) {
            if(!this.validateAll(attributes)) {
                return false;
            }
            for(var key in attributes) {
                delete this.attributes[key];
            }
            return true;
        };
        Model.prototype.clear = function () {
            this.id = undefined;
            this.attributes = {
            };
            this._escapedAttributes = {
            };
        };
        Model.prototype.keys = function () {
            return Backbone._(this.attributes).keys();
        };
        Model.prototype.values = function () {
            return Backbone._(this.attributes).values();
        };
        Model.prototype.fetch = function (settings) {
            var _this = this;
            settings = settings ? Backbone._.clone(settings) : {
            };
            var success = settings.success;
            settings.success = function (data, status, xhr) {
                if(!_this.setAll(_this.parse(data, xhr))) {
                    return false;
                }
                if(success) {
                    success(_this, status, xhr);
                }
            };
            return (this.sync || Backbone.sync).call(this, Backbone.MethodType.READ, this, settings);
        };
        Model.prototype.save = function () {
        };
        Model.prototype.change = function () {
        };
        Model.prototype.isValid = function () {
            return !this.validateAll(this.attributes);
        };
        Model.prototype.validate = function (key, value) {
            return true;
        };
        Model.prototype.validateAll = function (attributes) {
            return true;
        };
        Model.prototype.parse = function (data, xhr) {
            if (typeof xhr === "undefined") { xhr = undefined; }
            return data;
        };
        Model.prototype.clone = function () {
            return new Model(this.attributes);
        };
        Model.prototype.isNew = function () {
            return this.id == null;
        };
        return Model;
    })(Events);
    Backbone.Model = Model;    
})(Backbone || (Backbone = {}));

