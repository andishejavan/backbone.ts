// External reference to required jQuery library.
declare var jQuery;

// External reference to required underscore library.
declare var underscore;

export module Backbone {

	export interface EventHandler {
		on(events: string, callback: (...args: any[]) => any, context?: any): any;
		off(events?: string, callback?: (...args: any[]) => any, context?: any): any;
		trigger(events: string, ...args: any[]): any;
	}

	export var slice = Array.prototype.slice;
	export var splice = Array.prototype.splice;

	export var VERSION = "0.9.2";

	export var root: Window = window;

	export var $ = jQuery;

	export var _ = underscore;

	function setDomLibrary(lib: any): void {
		Backbone.$ = lib;
	}

	export var emulateHTTP = false;

	export var emulateJSON = false;

	export var eventSplitter = /\s+/;

	export function extend(protoProps, classProps) {
		var child = inherits(this, protoProps, classProps);
		child.extend = this.extend;
		return child;
	}

	export var methodMap = {
		'create': 'POST',
		'update': 'PUT',
		'delete': 'DELETE',
		'read': 'GET'
	};

	export function sync(method, model, options) {
		var type = methodMap[method];

		// Default options, unless specified.
		options || (options = {});

		// Default JSON-request options.
		var params: any = { type: type, dataType: 'json' };

		// Ensure that we have a URL.
		if (!options.url) {
			params.url = getValue(model, 'url') || urlError();
		}

		// Ensure that we have the appropriate request data.
		if (!options.data && model && (method == 'create' || method == 'update')) {
			params.contentType = 'application/json';
			params.data = JSON.stringify(model.toJSON());
		}

		// For older servers, emulate JSON by encoding the request into an HTML-form.
		if (Backbone.emulateJSON) {
			params.contentType = 'application/x-www-form-urlencoded';
			params.data = params.data ? { model: params.data } : {};
		}

		// For older servers, emulate HTTP by mimicking the HTTP method with `_method`
		// And an `X-HTTP-Method-Override` header.
		if (Backbone.emulateHTTP) {
			if (type === 'PUT' || type === 'DELETE') {
				if (Backbone.emulateJSON) params.data._method = type;
				params.type = 'POST';
				params.beforeSend = function (xhr) {
					xhr.setRequestHeader('X-HTTP-Method-Override', type);
				};
			}
		}

		// Don't process data on a non-GET request.
		if (params.type !== 'GET' && !Backbone.emulateJSON) {
			params.processData = false;
		}

		// Make the request, allowing the user to override any Ajax options.
		return $.ajax(_.extend(params, options));
	};

	function getValue(object, prop) {
		if (!(object && object[prop])) return null;
		return _.isFunction(object[prop]) ? object[prop]() : object[prop];
	};

	function urlError() {
		throw new Error('A "url" property or function must be specified');
	};

	function ctor() { };

	function inherits(parent, protoProps, staticProps) {
		var child;

		// The constructor function for the new subclass is either defined by you
		// (the "constructor" property in your `extend` definition), or defaulted
		// by us to simply call the parent's constructor.
		if (protoProps && protoProps.hasOwnProperty('constructor')) {
			child = protoProps.constructor;
		} else {
			child = function () { parent.apply(this, arguments); };
		}

		// Inherit class (static) properties from parent.
		_.extend(child, parent);

		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function.
		ctor.prototype = parent.prototype;
		child.prototype = new ctor();

		// Add prototype properties (instance properties) to the subclass,
		// if supplied.
		if (protoProps) _.extend(child.prototype, protoProps);

		// Add static properties to the constructor function, if supplied.
		if (staticProps) _.extend(child, staticProps);

		// Correctly set child's `prototype.constructor`.
		child.prototype.constructor = child;

		// Set a convenience property in case the parent's prototype is needed later.
		child.__super__ = parent.prototype;

		return child;
	};

	function wrapError(onError, originalModel, options) {
		return function (model, resp) {
			resp = model === originalModel ? resp : model;
			if (onError) {
				onError(originalModel, resp, options);
			} else {
				originalModel.trigger('error', originalModel, resp, options);
			}
		};
	};

	class Base implements Backbone.EventHandler {
		private _callbacks = undefined;

		public on(events: string, callback: (...args: any[]) => any, context?: any): any {
			var eventsList: string[];
			var calls, event, node, tail, list;
			if (!callback) return this;
			eventsList = events.split(Backbone.eventSplitter);
			calls = this._callbacks || (this._callbacks = {});

			// Create an immutable callback list, allowing traversal during
			// modification.  The tail is an empty object that will always be used
			// as the next node.
			while (event = eventsList.shift()) {
				list = calls[event];
				node = list ? list.tail : {};
				node.next = tail = {};
				node.context = context;
				node.callback = callback;
				calls[event] = { tail: tail, next: list ? list.next : node };
			}

			return this;
		}

		public off(events?: string, callback?: (...args: any[]) => any, context?: any): any {
			var eventsList: string[];
			var event, calls, node, tail, cb, ctx;

			// No events, or removing *all* events.
			if (!(calls = this._callbacks)) return;
			if (!(events || callback || context)) {
				delete this._callbacks;
				return this;
			}

			// Loop through the listed events and contexts, splicing them out of the
			// linked list of callbacks if appropriate.
			eventsList = events ? events.split(Backbone.eventSplitter) : _.keys(calls);
			while (event = eventsList.shift()) {
				node = calls[event];
				delete calls[event];
				if (!node || !(callback || context)) continue;
				// Create a new list, omitting the indicated callbacks.
				tail = node.tail;
				while ((node = node.next) !== tail) {
					cb = node.callback;
					ctx = node.context;
					if ((callback && cb !== callback) || (context && ctx !== context)) {
						this.on(event, cb, ctx);
					}
				}
			}

			return this;
		}

		public trigger(events: string, ...args: any[]): any {
			var eventsList: string[];
			var event, node, calls, tail, args, all, rest;
			if (!(calls = this._callbacks)) return this;
			all = calls.all;
			eventsList = events.split(eventSplitter);
			rest = slice.call(arguments, 1);

			// For each event, walk through the linked list of callbacks twice,
			// first to trigger the event, then to trigger any `"all"` callbacks.
			while (event = eventsList.shift()) {
				if (node = calls[event]) {
					tail = node.tail;
					while ((node = node.next) !== tail) {
						node.callback.apply(node.context || this, rest);
					}
				}
				if (node = all) {
					tail = node.tail;
					args = [event].concat(rest);
					while ((node = node.next) !== tail) {
						node.callback.apply(node.context || this, args);
					}
				}
			}

			return this;
		}

		public extend = Backbone.extend;
	}

	export class Model extends Base {
		public changed: any = undefined;

		private _silent: any = undefined;

		private _pending: any = undefined;

		public id: string;

		public cid: string;

		public idAttribute: string = 'id';

		public attributes: any;

		private _escapedAttributes: any = undefined;

		private _previousAttributes: any = undefined;

		public sync = () => { };

		public collection: Collection = undefined;

		private _changing: bool;

		constructor (attributes?: any, options?: any) {
			super();
			var defaults: any;
			attributes || (attributes = {});
			if (options && options.parse) {
				attributes = this.parse(attributes);
			}
			if (defaults = getValue(this, 'defaults')) {
				attributes = _.extend({}, defaults, attributes);
			}
			if (options && options.collection) {
				this.collection = options.collection;
			}
			this.attributes = {};
			this._escapedAttributes = {};
			this.cid = _.uniqueId('c');
			this.changed = {};
			this._silent = {};
			this._pending = {};
			this.set(attributes, { silent: true });
			// Reset change tracking.
			this.changed = {};
			this._silent = {};
			this._pending = {};
			this._previousAttributes = _.clone(this.attributes);

			// Do not call initialize since constructor calls take care of this.
			//this.initialize.apply(this, arguments);
		}

		public toJSON(options: any): any {
			return _.clone(this.attributes);
		}

		public get(attribute): any {
			return this.attributes[attribute];
		}

		public escape(attribute) {
			var html;
			if (html = this._escapedAttributes[attribute]) {
				return html;
			}
			var val = this.get(attribute);
			return this._escapedAttributes[attribute] = _.escape(val == null ? '' : '' + val);
		}

		public has(attribute): bool {
			return this.get(attribute) != null;
		}

		public set(key, value, options?): any {
			var attrs, attr, val;

			// Handle both `"key", value` and `{key: value}` -style arguments.
			if (_.isObject(key) || key == null) {
				attrs = key;
				options = value;
			} else {
				attrs = {};
				attrs[key] = value;
			}

			// Extract attributes and options.
			options || (options = {});
			if (!attrs) return this;
			if (attrs instanceof Model) attrs = attrs.attributes;
			if (options.unset) for (attr in attrs) attrs[attr] = void 0;

			// Run validation.
			if (!this._validate(attrs, options)) return false;

			// Check for changes of `id`.
			if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

			var changes = options.changes = {};
			var now = this.attributes;
			var escaped = this._escapedAttributes;
			var prev = this._previousAttributes || {};

			// For each `set` attribute...
			for (attr in attrs) {
				val = attrs[attr];

				// If the new and current value differ, record the change.
				if (!_.isEqual(now[attr], val) || (options.unset && _.has(now, attr))) {
					delete escaped[attr];
					(options.silent ? this._silent : changes)[attr] = true;
				}

				// Update or delete the current value.
				options.unset ? delete now[attr] : now[attr] = val;

				// If the new and previous value differ, record the change.  If not,
				// then remove changes for this attribute.
				if (!_.isEqual(prev[attr], val) || (_.has(now, attr) != _.has(prev, attr))) {
					this.changed[attr] = val;
					if (!options.silent) this._pending[attr] = true;
				} else {
					delete this.changed[attr];
					delete this._pending[attr];
				}
			}

			// Fire the `"change"` events.
			if (!options.silent) this.change(options);
			return this;
		}

		public unset(attribute, options?): any {
			(options || (options = {})).unset = true;
			return this.set(attribute, null, options);
		}

		public clear(options?: any): any {
			(options || (options = {})).unset = true;
			return this.set(_.clone(this.attributes), options);
		}

		public fetch(options?: any): any {
			options = options ? _.clone(options) : {};
			var success = options.success;
			options.success = (resp, status, xhr) => {
				if (!this.set(this.parse(resp, xhr), options)) return false;
				if (success) success(this, resp);
			}
			options.error = wrapError(options.error, this, options);
			return (this.sync || Backbone.sync).call(this, 'read', this, options);
		}

		public save(key, value, options?): any {
			var attrs, current;

			// Handle both `("key", value)` and `({key: value})` -style calls.
			if (_.isObject(key) || key == null) {
				attrs = key;
				options = value;
			} else {
				attrs = {};
				attrs[key] = value;
			}
			options = options ? _.clone(options) : {};

			// If we're "wait"-ing to set changed attributes, validate early.
			if (options.wait) {
				if (!this._validate(attrs, options)) return false;
				current = _.clone(this.attributes);
			}

			// Regular saves `set` attributes before persisting to the server.
			var silentOptions = _.extend({}, options, { silent: true });
			if (attrs && !this.set(attrs, options.wait ? silentOptions : options)) {
				return false;
			}

			// After a successful server-side save, the client is (optionally)
			// updated with the server-side state.
			//var model = this;
			var success = options.success;
			options.success = (resp, status, xhr) => {
				var serverAttrs = this.parse(resp, xhr);
				if (options.wait) {
					delete options.wait;
					serverAttrs = _.extend(attrs || {}, serverAttrs);
				}
				if (!this.set(serverAttrs, options)) return false;
				if (success) {
					success(this, resp);
				} else {
					this.trigger('sync', this, resp, options);
				}
			};

			// Finish configuring and sending the Ajax request.
			options.error = wrapError(options.error, this, options);
			var method = this.isNew() ? 'create' : 'update';
			var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
			if (options.wait) this.set(current, silentOptions);
			return xhr;
		}

		public destroy(options: any): any {
			options = options ? _.clone(options) : {};

			var success = options.success;

			var triggerDestroy = () => {
				this.trigger('destroy', this, this.collection, options);
			};

			if (this.isNew()) {
				triggerDestroy();
				return false;
			}

			options.success = (resp) => {
				if (options.wait) triggerDestroy();
				if (success) {
					success(this, resp);
				} else {
					this.trigger('sync', this, resp, options);
				}
			};

			options.error = wrapError(options.error, this, options);
			var xhr = (this.sync || Backbone.sync).call(this, 'delete', this, options);
			if (!options.wait) triggerDestroy();
			return xhr;
		}

		public url(): string {
			var base = getValue(this, 'urlRoot') || getValue(this.collection, 'url') || urlError();
			if (this.isNew()) return base;
			return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
		}

		public parse(resp, xhr = undefined) {
			return resp;
		}

		public clone(): Model {
			return new Model(this.attributes);
		}

		public isNew(): bool {
			return this.id == null;
		}

		public change(options?): any {
			options || (options = {});
			var changing = this._changing;
			this._changing = true;

			// Silent changes become pending changes.
			for (var attr in this._silent) this._pending[attr] = true;

			// Silent changes are triggered.
			var changes = _.extend({}, options.changes, this._silent);
			this._silent = {};
			for (var attr in changes) {
				this.trigger('change:' + attr, this, this.get(attr), options);
			}
			if (changing) return this;

			// Continue firing `"change"` events while there are pending changes.
			while (!_.isEmpty(this._pending)) {
				this._pending = {};
				this.trigger('change', this, options);
				// Pending and silent changes still remain.
				for (var attr in this.changed) {
					if (this._pending[attr] || this._silent[attr]) continue;
					delete this.changed[attr];
				}
				this._previousAttributes = _.clone(this.attributes);
			}

			this._changing = false;
			return this;
		}

		public hasChanged(attribute?) {
			if (attribute === undefined) 
				return !_.isEmpty(this.changed);
			return _.has(this.changed, attribute);
		}

		public changedAttributes(diff) {
			if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
			var val, changed: any = false, old = this._previousAttributes;
			for (var attr in diff) {
				if (_.isEqual(old[attr], (val = diff[attr]))) continue;
				(changed || (changed = {}))[attr] = val;
			}
			return changed;
		}

		public previous(attribute?) {
			if (!arguments.length || !this._previousAttributes) return null;
			return this._previousAttributes[attribute];
		}

		public previousAttributes() {
			return _.clone(this._previousAttributes);
		}

		public isValid(): bool {
			return !this.validate(this.attributes);
		}

		private _validate(attrs, options) {
			if (options.silent || !this.validate) return true;
			attrs = _.extend({}, this.attributes, attrs);
			var error = this.validate(attrs, options);
			if (!error) return true;
			if (options && options.error) {
				options.error(this, error, options);
			} else {
				this.trigger('error', this, error, options);
			}
			return false;
		}

		public validate(attributes: any, options: any = undefined): any {

		}
	}

	export class Collection extends Base {

		public model = undefined;

		public models: Model[] = undefined;

		public length: number;

		public comparator: (model: Model) => any;

		private _byId = undefined;

		private _byCid = undefined;

		public sync = () => { };

		constructor (models: Model[], options?: any) {
			super();
			options || (options = {});
			if (options.model) {
				this.model = options.model;
			}
			if (options.comparator) {
				this.comparator = options.comparator;
			}
			this._reset();
			// Don't call initalize since constructor calls will suffice.
			//this.initialize.apply(this, arguments);
			if (models) {
				this.reset(models, { silent: true, parse: options.parse });
			}
		}

		public toJSON(options: any): any {
			return Array.prototype.map((model: Model) => {
				return model.toJSON(options);
			});
		}

		public add(models: Model[], options?: any): any {
			var i, index, length, model, cid, id, cids = {}, ids = {}, dups = [];
			options || (options = {});
			//models = _.isArray(models) ? models.slice() : [models];

			// Begin by turning bare objects into model references, and preventing
			// invalid models or duplicate models from being added.
			for (i = 0, length = models.length; i < length; i++) {
				if (!(model = models[i] = this._prepareModel(models[i], options))) {
					throw new Error("Can't add an invalid model to a collection");
				}
				cid = model.cid;
				id = model.id;
				if (cids[cid] || this._byCid[cid] || ((id != null) && (ids[id] || this._byId[id]))) {
					dups.push(i);
					continue;
				}
				cids[cid] = ids[id] = model;
			}

			// Remove duplicates.
			i = dups.length;
			while (i--) {
				models.splice(dups[i], 1);
			}

			// Listen to added models' events, and index models for lookup by
			// `id` and by `cid`.
			for (i = 0, length = models.length; i < length; i++) {
				(model = models[i]).on('all', this._onModelEvent, this);
				this._byCid[model.cid] = model;
				if (model.id != null) this._byId[model.id] = model;
			}

			// Insert models into the collection, re-sorting if needed, and triggering
			// `add` events unless silenced.
			this.length += length;
			index = options.at != null ? options.at : this.models.length;
			splice.apply(this.models, [index, 0].concat(models));
			if (this.comparator) this.sort({ silent: true });
			if (options.silent) return this;
			for (i = 0, length = this.models.length; i < length; i++) {
				if (!cids[(model = this.models[i]).cid]) continue;
				options.index = i;
				model.trigger('add', model, this, options);
			}
			return this;
		}

		public remove(models: Model[], options?) {
			var i, l, index, model;
			options || (options = {});
			//models = _.isArray(models) ? models.slice() : [models];
			for (i = 0, l = models.length; i < l; i++) {
				model = this.getByCid(models[i]) || this.get(models[i]);
				if (!model) continue;
				delete this._byId[model.id];
				delete this._byCid[model.cid];
				index = this.indexOf(model);
				this.models.splice(index, 1);
				this.length--;
				if (!options.silent) {
					options.index = index;
					model.trigger('remove', model, this, options);
				}
				this._removeReference(model);
			}
			return this;
		}

		public push(model: Model, options?) {
			model = this._prepareModel(model, options);
			this.add([model], options);
			return model;
		}

		public pop(options) {
			var model = this.at(this.length - 1);
			this.remove([model], options);
			return model;
		}

		public unshift(model, options) {
			model = this._prepareModel(model, options);
			this.add(model, _.extend({ at: 0 }, options));
			return model;
		}

		public shift(options) {
			var model = this.at(0);
			this.remove([model], options);
			return model;
		}

		public get(id) {
			if (id == null) return void 0;
			return this._byId[id.id != null ? id.id : id];
		}

		public getByCid(cid) {
			return cid && this._byCid[cid.cid || cid];
		}

		public at(index: number) {
			return this.models[index];
		}

		public where(attrs): Model[] {
			if (_.isEmpty(attrs)) 
				return [];

			return this.filter(function (model) {
				for (var key in attrs) {
					if (attrs[key] !== model.get(key)) 
						return false;
				}
				return true;
			});
		}

		public sort(options?) {
			options || (options = {});
			if (!this.comparator) 
				throw new Error('Cannot sort a set without a comparator');

			var boundComparator = _.bind(this.comparator, this);
			if (this.comparator.length == 1) {
				this.models = this.sortBy(boundComparator);
			} else {
				this.models.sort(boundComparator);
			}
			if (!options.silent) 
				this.trigger('reset', this, options);
			return this;
		}

		public pluck(attr) {
			return _.map(this.models, function (model) { return model.get(attr); });
		}

		public reset(models?: Model[], options?) {
			models || (models = []);
			options || (options = {});
			for (var i = 0, l = this.models.length; i < l; i++) {
				this._removeReference(this.models[i]);
			}
			this._reset();
			this.add(models, _.extend({ silent: true }, options));
			if (!options.silent)
				this.trigger('reset', this, options);
			return this;
		}

		public fetch(options) {
			options = options ? _.clone(options) : {};
			if (options.parse === undefined) options.parse = true;
			var collection = this;
			var success = options.success;
			options.success = function (resp, status, xhr) {
				collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr), options);
				if (success) success(collection, resp);
			};
			options.error = wrapError(options.error, collection, options);
			return (this.sync || Backbone.sync).call(this, 'read', this, options);
		}

		public create(model: Model, options?): any {
			options = options ? _.clone(options) : {};
			model = this._prepareModel(model, options);
			if (!model) 
				return false;
			if (!options.wait) 
				this.add([model], options);
			var success = options.success;
			options.success = (nextModel, resp, xhr) => {
				if (options.wait) this.add(nextModel, options);
				if (success) {
					success(nextModel, resp);
				} else {
					nextModel.trigger('sync', model, resp, options);
				}
			};
			model.save(null, options);
			return model;
		}

		public parse(resp, xhr?) {
			return resp;
		}

		private _reset(options?) {
			this.length = 0;
			this.models = [];
			this._byId = {};
			this._byCid = {};
		}

		private _prepareModel(model, options?) {
			options || (options = {});
			if (!(model instanceof Model)) {
				var attrs = model;
				options.collection = this;
				model = new this.model(attrs, options);
				if (!model._validate(model.attributes, options)) model = false;
			} else if (!model.collection) {
				model.collection = this;
			}
			return model;
		}

		private _removeReference(model) {
			if (this == model.collection) {
				delete model.collection;
			}
			model.off('all', this._onModelEvent, this);
		}

		private _onModelEvent(event, model, collection, options) {
			if ((event == 'add' || event == 'remove') && collection != this) return;
			if (event == 'destroy') {
				this.remove(model, options);
			}
			if (model && event === 'change:' + model.idAttribute) {
				delete this._byId[model.previous(model.idAttribute)];
				this._byId[model.id] = model;
			}
			this.trigger.apply(this, arguments);
		}

		// Underscore proxies
		public chain() {
			return _(this.models).chain();
		}

		public each(iterator: (model: Model, index?: number, list?: Model[]) => any, context?): any {
			return _.each(this.models, iterator, context);
		}

		// Alias for each
		public forEach = Collection.prototype.each;

		public map(iterator: (model: Model, index?: number, list?: Model[]) => any, context?): any[] {
			return _.map(this.models, iterator, context);
		}

		public reduce(iterator: (model: Model, index?: number, list?: Model[]) => any, memo, context?) {
			return _.reduce(this.models, iterator, memo, context);
		}

		public reduceRight(iterator: (model: Model, index?: number, list?: Model[]) => any, memo, context?) {
			return _.reduceRight(this.models, iterator, memo, context);
		}

		public find(iterator: (model: Model) => Model, context?) {
			return _.find(this.models, iterator, context);
		}

		// Alias for find
		public detect = Collection.prototype.find;

		public filter(iterator: (model: Model) => bool, context? ): Model[] {
			return _.filter(this.models, iterator, context);
		}

		public select(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public reject(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public every(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public all(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public some(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public any(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public include(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public contains(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public invoke(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public max(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public min(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public sortBy(...args: any[]): Model[] {
			throw new Error("Not implemented exception.");
		}

		public sortedIndex(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public toArray(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public size(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public first(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public initial(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public rest(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public last(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public without(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public indexOf(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public shuffle(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public lastIndexOf(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public isEmpty(...args: any[]) {
			throw new Error("Not implemented exception.");
		}

		public groupBy(...args: any[]) {
			throw new Error("Not implemented exception.");
		}
	}
}