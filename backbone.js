var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
(function (Backbone) {
    Backbone.slice = Array.prototype.slice;
    Backbone.splice = Array.prototype.splice;
    Backbone.VERSION = "0.9.2";
    Backbone.root = window;
    Backbone.$ = jQuery;
    Backbone._ = underscore;
    function setDomLibrary(lib) {
        Backbone.$ = lib;
    }
    Backbone.emulateHTTP = false;
    Backbone.emulateJSON = false;
    Backbone.eventSplitter = /\s+/;
    function extend(protoProps, classProps) {
        var child = inherits(this, protoProps, classProps);
        child.extend = this.extend;
        return child;
    }
    Backbone.extend = extend;
    Backbone.methodMap = {
        'create': 'POST',
        'update': 'PUT',
        'delete': 'DELETE',
        'read': 'GET'
    };
    function sync(method, model, options) {
        var type = Backbone.methodMap[method];
        options || (options = {
        });
        var params = {
            type: type,
            dataType: 'json'
        };
        if(!options.url) {
            params.url = getValue(model, 'url') || urlError();
        }
        if(!options.data && model && (method == 'create' || method == 'update')) {
            params.contentType = 'application/json';
            params.data = JSON.stringify(model.toJSON());
        }
        if(Backbone.emulateJSON) {
            params.contentType = 'application/x-www-form-urlencoded';
            params.data = params.data ? {
                model: params.data
            } : {
            };
        }
        if(Backbone.emulateHTTP) {
            if(type === 'PUT' || type === 'DELETE') {
                if(Backbone.emulateJSON) {
                    params.data._method = type;
                }
                params.type = 'POST';
                params.beforeSend = function (xhr) {
                    xhr.setRequestHeader('X-HTTP-Method-Override', type);
                };
            }
        }
        if(params.type !== 'GET' && !Backbone.emulateJSON) {
            params.processData = false;
        }
        return Backbone.$.ajax(Backbone._.extend(params, options));
    }
    Backbone.sync = sync;
    ; ;
    function getValue(object, prop) {
        if(!(object && object[prop])) {
            return null;
        }
        return Backbone._.isFunction(object[prop]) ? object[prop]() : object[prop];
    }
    ; ;
    function urlError() {
        throw new Error('A "url" property or function must be specified');
    }
    ; ;
    function ctor() {
    }
    ; ;
    function inherits(parent, protoProps, staticProps) {
        var child;
        if(protoProps && protoProps.hasOwnProperty('constructor')) {
            child = protoProps.constructor;
        } else {
            child = function () {
                parent.apply(this, arguments);
            };
        }
        Backbone._.extend(child, parent);
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        if(protoProps) {
            Backbone._.extend(child.prototype, protoProps);
        }
        if(staticProps) {
            Backbone._.extend(child, staticProps);
        }
        child.prototype.constructor = child;
        child.__super__ = parent.prototype;
        return child;
    }
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
    var Base = (function () {
        function Base() {
            this._callbacks = undefined;
            this.extend = Backbone.extend;
        }
        Base.prototype.on = function (events, callback, context) {
            var eventsList;
            var calls;
            var event;
            var node;
            var tail;
            var list;

            if(!callback) {
                return this;
            }
            eventsList = events.split(Backbone.eventSplitter);
            calls = this._callbacks || (this._callbacks = {
            });
            while(event = eventsList.shift()) {
                list = calls[event];
                node = list ? list.tail : {
                };
                node.next = tail = {
                };
                node.context = context;
                node.callback = callback;
                calls[event] = {
                    tail: tail,
                    next: list ? list.next : node
                };
            }
            return this;
        };
        Base.prototype.off = function (events, callback, context) {
            var eventsList;
            var event;
            var calls;
            var node;
            var tail;
            var cb;
            var ctx;

            if(!(calls = this._callbacks)) {
                return;
            }
            if(!(events || callback || context)) {
                delete this._callbacks;
                return this;
            }
            eventsList = events ? events.split(Backbone.eventSplitter) : Backbone._.keys(calls);
            while(event = eventsList.shift()) {
                node = calls[event];
                delete calls[event];
                if(!node || !(callback || context)) {
                    continue;
                }
                tail = node.tail;
                while((node = node.next) !== tail) {
                    cb = node.callback;
                    ctx = node.context;
                    if((callback && cb !== callback) || (context && ctx !== context)) {
                        this.on(event, cb, ctx);
                    }
                }
            }
            return this;
        };
        Base.prototype.trigger = function (events) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            var eventsList;
            var event;
            var node;
            var calls;
            var tail;
            var args;
            var all;
            var rest;

            if(!(calls = this._callbacks)) {
                return this;
            }
            all = calls.all;
            eventsList = events.split(Backbone.eventSplitter);
            rest = Backbone.slice.call(arguments, 1);
            while(event = eventsList.shift()) {
                if(node = calls[event]) {
                    tail = node.tail;
                    while((node = node.next) !== tail) {
                        node.callback.apply(node.context || this, rest);
                    }
                }
                if(node = all) {
                    tail = node.tail;
                    args = [
                        event
                    ].concat(rest);
                    while((node = node.next) !== tail) {
                        node.callback.apply(node.context || this, args);
                    }
                }
            }
            return this;
        };
        return Base;
    })();    
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(attributes, options) {
                _super.call(this);
            this.changed = undefined;
            this._silent = undefined;
            this._pending = undefined;
            this.idAttribute = 'id';
            this._escapedAttributes = undefined;
            this._previousAttributes = undefined;
            this.sync = function () {
            };
            this.collection = undefined;
            var defaults;
            attributes || (attributes = {
            });
            if(options && options.parse) {
                attributes = this.parse(attributes);
            }
            if(defaults = getValue(this, 'defaults')) {
                attributes = Backbone._.extend({
                }, defaults, attributes);
            }
            if(options && options.collection) {
                this.collection = options.collection;
            }
            this.attributes = {
            };
            this._escapedAttributes = {
            };
            this.cid = Backbone._.uniqueId('c');
            this.changed = {
            };
            this._silent = {
            };
            this._pending = {
            };
            this.set(attributes, {
                silent: true
            });
            this.changed = {
            };
            this._silent = {
            };
            this._pending = {
            };
            this._previousAttributes = Backbone._.clone(this.attributes);
        }
        Model.prototype.toJSON = function (options) {
            return Backbone._.clone(this.attributes);
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
        Model.prototype.has = function (attribute) {
            return this.get(attribute) != null;
        };
        Model.prototype.set = function (key, value, options) {
            var attrs;
            var attr;
            var val;

            if(Backbone._.isObject(key) || key == null) {
                attrs = key;
                options = value;
            } else {
                attrs = {
                };
                attrs[key] = value;
            }
            options || (options = {
            });
            if(!attrs) {
                return this;
            }
            if(attrs instanceof Model) {
                attrs = attrs.attributes;
            }
            if(options.unset) {
                for(attr in attrs) {
                    attrs[attr] = void 0;
                }
            }
            if(!this._validate(attrs, options)) {
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
                this.change(options);
            }
            return this;
        };
        Model.prototype.unset = function (attribute, options) {
            (options || (options = {
            })).unset = true;
            return this.set(attribute, null, options);
        };
        Model.prototype.clear = function (options) {
            (options || (options = {
            })).unset = true;
            return this.set(Backbone._.clone(this.attributes), options);
        };
        Model.prototype.fetch = function (options) {
            var _this = this;
            options = options ? Backbone._.clone(options) : {
            };
            var success = options.success;
            options.success = function (resp, status, xhr) {
                if(!_this.set(_this.parse(resp, xhr), options)) {
                    return false;
                }
                if(success) {
                    success(_this, resp);
                }
            };
            options.error = wrapError(options.error, this, options);
            return (this.sync || Backbone.sync).call(this, 'read', this, options);
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
        Model.prototype.destroy = function (options) {
            var _this = this;
            options = options ? Backbone._.clone(options) : {
            };
            var success = options.success;
            var triggerDestroy = function () {
                _this.trigger('destroy', _this, _this.collection, options);
            };
            if(this.isNew()) {
                triggerDestroy();
                return false;
            }
            options.success = function (resp) {
                if(options.wait) {
                    triggerDestroy();
                }
                if(success) {
                    success(_this, resp);
                } else {
                    _this.trigger('sync', _this, resp, options);
                }
            };
            options.error = wrapError(options.error, this, options);
            var xhr = (this.sync || Backbone.sync).call(this, 'delete', this, options);
            if(!options.wait) {
                triggerDestroy();
            }
            return xhr;
        };
        Model.prototype.url = function () {
            var base = getValue(this, 'urlRoot') || getValue(this.collection, 'url') || urlError();
            if(this.isNew()) {
                return base;
            }
            return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
        };
        Model.prototype.parse = function (resp, xhr) {
            if (typeof xhr === "undefined") { xhr = undefined; }
            return resp;
        };
        Model.prototype.clone = function () {
            return new Model(this.attributes);
        };
        Model.prototype.isNew = function () {
            return this.id == null;
        };
        Model.prototype.change = function (options) {
            options || (options = {
            });
            var changing = this._changing;
            this._changing = true;
            for(var attr in this._silent) {
                this._pending[attr] = true;
            }
            var changes = Backbone._.extend({
            }, options.changes, this._silent);
            this._silent = {
            };
            for(var attr in changes) {
                this.trigger('change:' + attr, this, this.get(attr), options);
            }
            if(changing) {
                return this;
            }
            while(!Backbone._.isEmpty(this._pending)) {
                this._pending = {
                };
                this.trigger('change', this, options);
                for(var attr in this.changed) {
                    if(this._pending[attr] || this._silent[attr]) {
                        continue;
                    }
                    delete this.changed[attr];
                }
                this._previousAttributes = Backbone._.clone(this.attributes);
            }
            this._changing = false;
            return this;
        };
        Model.prototype.hasChanged = function (attribute) {
            if(attribute === undefined) {
                return !Backbone._.isEmpty(this.changed);
            }
            return Backbone._.has(this.changed, attribute);
        };
        Model.prototype.changedAttributes = function (diff) {
            if(!diff) {
                return this.hasChanged() ? Backbone._.clone(this.changed) : false;
            }
            var val;
            var changed = false;
            var old = this._previousAttributes;

            for(var attr in diff) {
                if(Backbone._.isEqual(old[attr], (val = diff[attr]))) {
                    continue;
                }
                (changed || (changed = {
                }))[attr] = val;
            }
            return changed;
        };
        Model.prototype.previous = function (attribute) {
            if(!arguments.length || !this._previousAttributes) {
                return null;
            }
            return this._previousAttributes[attribute];
        };
        Model.prototype.previousAttributes = function () {
            return Backbone._.clone(this._previousAttributes);
        };
        Model.prototype.isValid = function () {
            return !this.validate(this.attributes);
        };
        Model.prototype._validate = function (attrs, options) {
            if(options.silent || !this.validate) {
                return true;
            }
            attrs = Backbone._.extend({
            }, this.attributes, attrs);
            var error = this.validate(attrs, options);
            if(!error) {
                return true;
            }
            if(options && options.error) {
                options.error(this, error, options);
            } else {
                this.trigger('error', this, error, options);
            }
            return false;
        };
        Model.prototype.validate = function (attributes, options) {
            if (typeof options === "undefined") { options = undefined; }
        };
        return Model;
    })(Base);
    Backbone.Model = Model;    
    var Collection = (function (_super) {
        __extends(Collection, _super);
        function Collection(models, options) {
                _super.call(this);
            this.model = undefined;
            this.models = undefined;
            this._byId = undefined;
            this._byCid = undefined;
            this.sync = function () {
            };
            this.forEach = Collection.prototype.each;
            this.detect = Collection.prototype.find;
            this.select = Collection.prototype.filter;
            this.every = Collection.prototype.all;
            this.some = Collection.prototype.any;
            this.include = Collection.prototype.contains;
            options || (options = {
            });
            if(options.model) {
                this.model = options.model;
            }
            if(options.comparator) {
                this.comparator = options.comparator;
            }
            this._reset();
            if(models) {
                this.reset(models, {
                    silent: true,
                    parse: options.parse
                });
            }
        }
        Collection.prototype.toJSON = function (options) {
            return Array.prototype.map(function (model) {
                return model.toJSON(options);
            });
        };
        Collection.prototype.add = function (models, options) {
            var i;
            var index;
            var length;
            var model;
            var cid;
            var id;
            var cids = {
            };
            var ids = {
            };
            var dups = [];

            options || (options = {
            });
            for(i = 0 , length = models.length; i < length; i++) {
                if(!(model = models[i] = this._prepareModel(models[i], options))) {
                    throw new Error("Can't add an invalid model to a collection");
                }
                cid = model.cid;
                id = model.id;
                if(cids[cid] || this._byCid[cid] || ((id != null) && (ids[id] || this._byId[id]))) {
                    dups.push(i);
                    continue;
                }
                cids[cid] = ids[id] = model;
            }
            i = dups.length;
            while(i--) {
                models.splice(dups[i], 1);
            }
            for(i = 0 , length = models.length; i < length; i++) {
                (model = models[i]).on('all', this._onModelEvent, this);
                this._byCid[model.cid] = model;
                if(model.id != null) {
                    this._byId[model.id] = model;
                }
            }
            this.length += length;
            index = options.at != null ? options.at : this.models.length;
            Backbone.splice.apply(this.models, [
                index, 
                0
            ].concat(models));
            if(this.comparator) {
                this.sort({
                    silent: true
                });
            }
            if(options.silent) {
                return this;
            }
            for(i = 0 , length = this.models.length; i < length; i++) {
                if(!cids[(model = this.models[i]).cid]) {
                    continue;
                }
                options.index = i;
                model.trigger('add', model, this, options);
            }
            return this;
        };
        Collection.prototype.remove = function (models, options) {
            var i;
            var l;
            var index;
            var model;

            options || (options = {
            });
            for(i = 0 , l = models.length; i < l; i++) {
                model = this.getByCid(models[i]) || this.get(models[i]);
                if(!model) {
                    continue;
                }
                delete this._byId[model.id];
                delete this._byCid[model.cid];
                index = this.indexOf(model);
                this.models.splice(index, 1);
                this.length--;
                if(!options.silent) {
                    options.index = index;
                    model.trigger('remove', model, this, options);
                }
                this._removeReference(model);
            }
            return this;
        };
        Collection.prototype.push = function (model, options) {
            model = this._prepareModel(model, options);
            this.add([
                model
            ], options);
            return model;
        };
        Collection.prototype.pop = function (options) {
            var model = this.at(this.length - 1);
            this.remove([
                model
            ], options);
            return model;
        };
        Collection.prototype.unshift = function (model, options) {
            model = this._prepareModel(model, options);
            this.add(model, Backbone._.extend({
                at: 0
            }, options));
            return model;
        };
        Collection.prototype.shift = function (options) {
            var model = this.at(0);
            this.remove([
                model
            ], options);
            return model;
        };
        Collection.prototype.get = function (id) {
            if(id == null) {
                return void 0;
            }
            return this._byId[id.id != null ? id.id : id];
        };
        Collection.prototype.getByCid = function (cid) {
            return cid && this._byCid[cid.cid || cid];
        };
        Collection.prototype.at = function (index) {
            return this.models[index];
        };
        Collection.prototype.where = function (attrs) {
            if(Backbone._.isEmpty(attrs)) {
                return [];
            }
            return this.filter(function (model) {
                for(var key in attrs) {
                    if(attrs[key] !== model.get(key)) {
                        return false;
                    }
                }
                return true;
            });
        };
        Collection.prototype.sort = function (options) {
            options || (options = {
            });
            if(!this.comparator) {
                throw new Error('Cannot sort a set without a comparator');
            }
            var boundComparator = Backbone._.bind(this.comparator, this);
            if(this.comparator.length == 1) {
                this.models = this.sortBy(boundComparator);
            } else {
                this.models.sort(boundComparator);
            }
            if(!options.silent) {
                this.trigger('reset', this, options);
            }
            return this;
        };
        Collection.prototype.pluck = function (attr) {
            return Backbone._.map(this.models, function (model) {
                return model.get(attr);
            });
        };
        Collection.prototype.reset = function (models, options) {
            models || (models = []);
            options || (options = {
            });
            for(var i = 0, l = this.models.length; i < l; i++) {
                this._removeReference(this.models[i]);
            }
            this._reset();
            this.add(models, Backbone._.extend({
                silent: true
            }, options));
            if(!options.silent) {
                this.trigger('reset', this, options);
            }
            return this;
        };
        Collection.prototype.fetch = function (options) {
            options = options ? Backbone._.clone(options) : {
            };
            if(options.parse === undefined) {
                options.parse = true;
            }
            var collection = this;
            var success = options.success;
            options.success = function (resp, status, xhr) {
                collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr), options);
                if(success) {
                    success(collection, resp);
                }
            };
            options.error = wrapError(options.error, collection, options);
            return (this.sync || Backbone.sync).call(this, 'read', this, options);
        };
        Collection.prototype.create = function (model, options) {
            var _this = this;
            options = options ? Backbone._.clone(options) : {
            };
            model = this._prepareModel(model, options);
            if(!model) {
                return false;
            }
            if(!options.wait) {
                this.add([
                    model
                ], options);
            }
            var success = options.success;
            options.success = function (nextModel, resp, xhr) {
                if(options.wait) {
                    _this.add(nextModel, options);
                }
                if(success) {
                    success(nextModel, resp);
                } else {
                    nextModel.trigger('sync', model, resp, options);
                }
            };
            model.save(null, options);
            return model;
        };
        Collection.prototype.parse = function (resp, xhr) {
            return resp;
        };
        Collection.prototype._reset = function (options) {
            this.length = 0;
            this.models = [];
            this._byId = {
            };
            this._byCid = {
            };
        };
        Collection.prototype._prepareModel = function (model, options) {
            options || (options = {
            });
            if(!(model instanceof Model)) {
                var attrs = model;
                options.collection = this;
                model = new this.model(attrs, options);
                if(!model._validate(model.attributes, options)) {
                    model = false;
                }
            } else {
                if(!model.collection) {
                    model.collection = this;
                }
            }
            return model;
        };
        Collection.prototype._removeReference = function (model) {
            if(this == model.collection) {
                delete model.collection;
            }
            model.off('all', this._onModelEvent, this);
        };
        Collection.prototype._onModelEvent = function (event, model, collection, options) {
            if((event == 'add' || event == 'remove') && collection != this) {
                return;
            }
            if(event == 'destroy') {
                this.remove(model, options);
            }
            if(model && event === 'change:' + model.idAttribute) {
                delete this._byId[model.previous(model.idAttribute)];
                this._byId[model.id] = model;
            }
            this.trigger.apply(this, arguments);
        };
        Collection.prototype.chain = function () {
            return Backbone._(this.models).chain();
        };
        Collection.prototype.each = function (iterator, context) {
            return Backbone._.each(this.models, iterator, context);
        };
        Collection.prototype.map = function (iterator, context) {
            return Backbone._.map(this.models, iterator, context);
        };
        Collection.prototype.reduce = function (iterator, memo, context) {
            return Backbone._.reduce(this.models, iterator, memo, context);
        };
        Collection.prototype.reduceRight = function (iterator, memo, context) {
            return Backbone._.reduceRight(this.models, iterator, memo, context);
        };
        Collection.prototype.find = function (iterator, context) {
            return Backbone._.find(this.models, iterator, context);
        };
        Collection.prototype.filter = function (iterator, context) {
            return Backbone._.filter(this.models, iterator, context);
        };
        Collection.prototype.reject = function (iterator, context) {
            return Backbone._.reject(this.models, iterator, context);
        };
        Collection.prototype.all = function (iterator, context) {
            return Backbone._.all(this.models, iterator, context);
        };
        Collection.prototype.any = function (iterator, context) {
            return Backbone._.any(this.models, iterator, context);
        };
        Collection.prototype.contains = function (model) {
            return Backbone._.contains(this.models, model);
        };
        Collection.prototype.invoke = function (methodName) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            Backbone._.invoke(this.models, methodName, args);
        };
        Collection.prototype.max = function (iterator, context) {
            return Backbone._.max(this.models, iterator, context);
        };
        Collection.prototype.min = function (iterator, context) {
            return Backbone._.min(this.models, iterator, context);
        };
        Collection.prototype.sortBy = function (iterator, context) {
            return Backbone._.sortBy(this.models, iterator, context);
        };
        Collection.prototype.groupBy = function (iterator) {
            return Backbone._.groupBy(this.models, iterator);
        };
        Collection.prototype.sortedIndex = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            throw new Error("Not implemented exception.");
        };
        Collection.prototype.toArray = function () {
            return Backbone._.toArray(this.models);
        };
        Collection.prototype.size = function () {
            return Backbone._.size(this.models);
        };
        Collection.prototype.first = function () {
            return Backbone._.first(this.models);
        };
        Collection.prototype.initial = function (n) {
            return Backbone._.initial(this.models, n);
        };
        Collection.prototype.last = function (n) {
            return Backbone._.last(this.models, n);
        };
        Collection.prototype.rest = function (index) {
            return Backbone._.rest(this.models, index);
        };
        Collection.prototype.without = function () {
            var values = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                values[_i] = arguments[_i + 0];
            }
            return Backbone._.without(this.models, arguments);
        };
        Collection.prototype.indexOf = function (model, isSorted) {
            return Backbone._.indexOf(this.models, model, isSorted);
        };
        Collection.prototype.lastIndexOf = function (model, fromIndex) {
            return Backbone._.lastIndexOf(this.models, model, fromIndex);
        };
        Collection.prototype.shuffle = function () {
            return Backbone._.shuffle(this.models);
        };
        Collection.prototype.isEmpty = function () {
            return Backbone._.isEmpty(this.models);
        };
        return Collection;
    })(Base);
    Backbone.Collection = Collection;    
    var Router = (function (_super) {
        __extends(Router, _super);
        function Router(options) {
                _super.call(this);
            options || (options = {
            });
            if(options.routes) {
                this.routes = options.routes;
            }
            this._bindRoutes();
        }
        Router.namedParam = /:\w+/g;
        Router.splatParam = /\*\w+/g;
        Router.escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;
        Router.prototype.route = function (route, name, callback) {
            Backbone.history || (Backbone.history = new History());
            if(!Backbone._.isRegExp(route)) {
                route = this._routeToRegExp(route);
            }
            if(!callback) {
                callback = this[name];
            }
            Backbone.history.route(route, Backbone._.bind(function (fragment) {
                var args = this._extractParameters(route, fragment);
                callback && callback.apply(this, args);
                this.trigger.apply(this, [
                    'route:' + name
                ].concat(args));
                Backbone.history.trigger('route', this, name, args);
            }, this));
            return this;
        };
        Router.prototype.navigate = function (fragment, options) {
            Backbone.history.navigate(fragment, options);
        };
        Router.prototype._bindRoutes = function () {
            if(!this.routes) {
                return;
            }
            var routes = [];
            for(var route in this.routes) {
                routes.unshift([
                    route, 
                    this.routes[route]
                ]);
            }
            for(var i = 0, l = routes.length; i < l; i++) {
                this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
            }
        };
        Router.prototype._routeToRegExp = function (route) {
            route = route.replace(Router.escapeRegExp, '\\$&').replace(Router.namedParam, '([^\/]+)').replace(Router.splatParam, '(.*?)');
            return new RegExp('^' + route + '$');
        };
        Router.prototype._extractParameters = function (route, fragment) {
            return route.exec(fragment).slice(1);
        };
        return Router;
    })(Base);
    Backbone.Router = Router;    
    Backbone.history;
    var History = (function (_super) {
        __extends(History, _super);
        function History() {
                _super.call(this);
            this.started = false;
            this.interval = 50;
            this.handlers = [];
            Backbone._.bindAll(this, 'checkUrl');
        }
        History.routeStripper = /^[#\/]/;
        History.isExplorer = /msie [\w.]+/;
        History.prototype.getHash = function (windowOverride) {
            var loc = windowOverride ? windowOverride.location : window.location;
            var match = loc.href.match(/#(.*)$/);
            return match ? match[1] : '';
        };
        History.prototype.getFragment = function (fragment, forcePushState) {
            if(fragment == null) {
                if(this._hasPushState || forcePushState) {
                    fragment = window.location.pathname;
                    var search = window.location.search;
                    if(search) {
                        fragment += search;
                    }
                } else {
                    fragment = this.getHash();
                }
            }
            if(!fragment.indexOf(this.options.root)) {
                fragment = fragment.substr(this.options.root.length);
            }
            return fragment.replace(routeStripper, '');
        };
        return History;
    })(Base);
    Backbone.History = History;    
})(exports.Backbone || (exports.Backbone = {}));


