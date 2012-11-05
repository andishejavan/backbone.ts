/// <reference path="jQuery.d.ts" />
/// <reference path="underscore.d.ts" />

//     Backbone.ts 0.1
//     (c) 2012 Josh Baldwin
//     Backbone.ts may be freely distributed under the MIT license.
//     For all details and documentation:
//     https://github.com/jbaldwin/backbone.ts

/**
* Backbone.ts Module
**/
module Backbone {

	/**
	* Backbone.ts version.
	**/
	export var Version = "0.1";

	/**
	* Handle to the root Window.
	**/
	export var root: Window = window;

	/**
	* Handle to jQuery.
	**/
	export var $ = jQuery;

	/**
	* Handle to underscore.
	**/
	export var _: Underscore = (<any>root)._;

	/**
	* Map from CRUD to HTTP for our default `Backbone.sync` implementation.
	**/
	export var MethodType = {
		CREATE: 'POST',
		UPDATE: 'PUT',
		DELETE: 'DELETE',
		READ: 'GET'
	};

	/**
	* @short Override this function to change the manner that Backbone persists models to the server.
	*        By default makes a RESTful Ajax request to the model's `url()`.
	*
	* @info Does not currently support "emutelateHTTP" from backbone.js
	*
	* @method http method to use for the sync, set Backbone.MethodType for Backbone.ts to use
	*         different http verbs by default.
	* @model The model to sync with the server.
	* @settings the jQuery ajax settings including all jqXHR callbacks.
	* @return the jqXHR object that $.ajax creates for the sync request.
	**/
	export function sync(method: string, model: Model, settings?: JQueryAjaxSettings): JQueryXHR {

		settings || (settings = {});

		// Default JSON-request options.
		var params: JQueryAjaxSettings = { 
			type: method, 
			dataType: 'json', 
			url: model.url(),
		};

		// Ensure that we have the appropriate request data.
		if (model && (method === MethodType.CREATE || method === MethodType.UPDATE)) {
			params.contentType = 'application/json';
			params.data = JSON.stringify(model.toJSON());
		}

		// Don't process data on a non-GET request.
		if (params.type !== 'GET') {
			params.processData = false;
		}

		// Make the request, allowing the user to override any Ajax options.
		return $.ajax(_.extend(params, settings));
	};

	/**
	* IEventHandler
	* Turn on/off and trigger events through a callback functions.
	* Can have multiple callbacks per event.
	**/
	interface IEventHandler {

		/**
		* Turns on or adds a callback function to the event.
		* If the event does not exist it is added and turned on with
		* the callback function.
		* If the event already exists the callback function is added.
		* @event: The name of the event to turn on.
		* @fn: Callback function added to the event's list of callbacks.
		* @context: The 'this' argument when triggering the event, defaults to the callee.
		**/
		on(event: string, fn: Function, context?: any): void;

		/**
		* Turns off or removes a callback function from the event.
		* fn is optional, if provided only that callback function is removed
		* from the event.  If fn is not provided then all callback functions
		* are removed from the event.
		* @event: The name of the event to turn off.
		* @fn?: Optionally turns off just this callback for the event.
		**/
		off(event: string, fn?: Function): void;

		/**
		* Triggers all callback functions linked to the event with
		* the supplied arguments list.
		*
		* @future do not like how the argument list cannot be statically checked
		*       not sure how to get around this so leaving as any[]
		**/
		trigger(event: string, ...args: any[]): void;

		/**
		* Clears all events and their callback functions.
		**/
		clear(): void;
	}

	/**
	* Base Events class.  All Backbone classes (View/Model/Collection) will inherit from
	* this for native custom event handling.
	*
	* Events are called by string name.  Each event can have multiple callbacks, called in
	* the orderd they are added to the Events object.  Individual callbacks can be removed.
	*
	* There is no good way to enforce typesafety on the trigger() arguments, for now it is just
	* an any[].
	**/
	export class Events implements IEventHandler {

		/**
		* Internal structure to hold all callbacks along with their context.
		*
		* Each event is keyed by name.
		* Each event can have many callbacks, each keyed by an index.
		* Each callback can have a different context, by default 'window' is used
		* as the context if no context is provided.
		*
		* Dictionary<string, Event>:
		*       Dictionary<string, Tuple<Function, context>>
		**/
		private _callbacks: {
			[event: string]: { 
				[id: string]: {
					fn: Function;
					context: any;
				};
			};
		};

		/**
		* Initializes the Events object.
		*
		* @future support adding an list of events from the start?
		**/
		constructor () {
			this.clear();
		}

		/**
		* Turns on or adds a callback function to the event.
		* If the event does not exist it is added and turned on with
		* the callback function.
		* If the event already exists the callback function is added.
		* @event: The name of the event to turn on.
		* @fn: Callback function added to the event's list of callbacks.
		* @context: The 'this' argument when triggering the event, defaults to the callee.
		**/
		public on(event: string, fn: Function, context?: any): void {

			var id = Backbone._.uniqueId("cb_");
			// Create the event holder.
			if (this._callbacks[event] === undefined) {
				console.log("Events.on() creating event " + event);
				this._callbacks[event] = { };
			}

			if (this._callbacks[event][id] === undefined) {
				this._callbacks[event][id] = { fn: fn, context: (context || this) };
			} else {
				this._callbacks[event][id].fn = fn;
				this._callbacks[event][id].context = (context || this);
			}
		}
		
		/**
		* Turns off or removes a callback function from the event.
		* fn is optional, if provided only that callback function is removed
		* from the event.  If fn is not provided then all callback functions
		* are removed from the event.
		* @event: The name of the event to turn off.
		* @fn?: Optionally turns off just this callback for the event.
		**/
		public off(event: string, fn?: Function): void {
		
			if (this._callbacks[event] !== undefined) {
				if (fn !== undefined) {
					for (var id in this._callbacks[event]) {
						if (fn === this._callbacks[event][id].fn) {
							delete this._callbacks[event][id];
						}
					}

					// Remove event callback entirely if it is empty
					if ($.isEmptyObject(this._callbacks[event])) {
						delete this._callbacks[event];
					}
				} else {
					// Remove all events.
					delete this._callbacks[event];
				}
			}
		}

		/**
		* Triggers all callback functions linked to the event with
		* the supplied arguments list.
		*
		* @future do not like how the argument list cannot be statically checked
		*       not sure how to get around this so leaving as any[]
		**/
		public trigger(event: string, ...args: any[]): void {

			if (this._callbacks[event] !== undefined) {
				for (var key in this._callbacks[event]) {
					this._callbacks[event][key].fn.apply(
						this._callbacks[event][key].context,
						args);
				}
			}
		}

		/**
		* Clears all events and their callbacks.
		**/
		public clear(): void {
			this._callbacks = {};
		}
	}

	/**
	* Interface for DOM events.
	**/
	export interface IDOMEvent {
		fn(e: JQueryEventObject): JQuery;
		event: string;
		selector?: string;
	}

	/**
	* Simple implementation of IDOMEvent for internal use within Backbone.ts.
	* Use IDOMEvent extrnally of Backbone.ts for your own custom objects or
	* if all you need is a base implementation then use this.
	**/
	export class DOMEvent implements IDOMEvent {

		/**
		* Initializes a DOMEvent within a Backbone.View.
		* @fn: The DOMEvent callback, takes a JQueryEventObject and returns JQuery.
		* @event: The event name.
		* @event: The event's selector, default is no selector.
		**/
		constructor (
			public fn: (e: JQueryEventObject) => JQuery, 
			public event: string,
			public selector?: string = undefined) {
		}
	}

	/**
	* Backbone.View
	**/
	export class View extends Events implements IBackboneView {

		/**
		* User defined id for the view.
		**/
		public id: string;

		/**
		* Backbone defined cid for the view.
		* Format is "view_{number}".
		**/
		public cid: string;

		/**
		* The element, must be provided to the View.
		* May or may not be attached to the DOM, must be manually attached by the user.
		**/
		public el: HTMLElement;

		/**
		* jQuery reference to the element provided.
		**/
		public $el: JQuery;

		/**
		* The instance of the model associated with this view.
		* Can be undefined when using a Collection.
		* Can be undefined when the view does not save or manipulate data.
		**/
		public model: Model = undefined;

		/**
		* The instance of the collection associaed with this view.
		* Can be undefined when using a Model.
		* Can be undefined when the view does not save or manipulate data.
		**/
		public collection: Collection = undefined;

		private _domEvents: IDOMEvent[];

		/**
		* Initialize the Backbone.View.
		* @id: User defined identifier, required.
		* @el: The View's element.  Must be provided, may or may not be attached to the DOM
		*      when creating the View.  However, it must manually be attached when it is.
		* @domEvents: array of DOM Events to intialize the View with.
		* @delegeteEvents: By default the DOM Events will be delegated, see delegateEvents().
		**/
		constructor (
			id: string,
			el: HTMLElement, 
			domEvents?: IDOMEvent[] = new DOMEvent[],
			delegateEvents?: bool = true) {
			
			super();

			if (_.isNull(id) || _.isUndefined(id)) {
				throw new Error("View 'id' cannot be null or undefined.");
			}

			if (_.isNull(el) || _.isUndefined(el)) {
				throw new Error("View 'el' cannot be null or undefined.");
			}

			this.id = id;
			this.cid = _.uniqueId('view_');
			this._domEvents = _.clone(domEvents);

			if (delegateEvents) {
				this.delegateEvents(domEvents);
			}

			// Set the element and delegate events if requested.
			this.setElement(el, delegateEvents);
		}

		/**
		* jQuery delegate for element lookup, scoped to DOM elements within the
		* current view.  This should be preferred to global lookups where possible.
		* @selector: jQuery selector
		* @return: jQuery
		**/
		public $(selector): JQuery {
			return this.$el.find(selector);
		}

		/**
		* Renders the View, should only need to be called once or if a refresh
		* is required.
		* @return: This View.
		**/
		public render(): View {
			return this;
		}

		/**
		* Removes the View from the DOM.
		* Side effects includes undelegeting events (jQuery known issue), use detach to keep
		* events intact.
		* @return: This View.
		**/
		public remove(): View {
			this.$el.remove();
			return this;
		}

		/**
		* Detaches the View from the DOM.
		* Delegates to $.detach, preserving jQuery data and events.  This
		* is the preferred method if you plan on re-using the View.
		* @return: This View.
		**/
		public detach(): View {
			this.$el.detach();
			return this;
		}

		/**
		* Set the View's element (`this.el` property), by default
		* re-delegates all DOM Events previously set on the View.
		* Does not attach the new `el` to the DOM, the user must do this.
		* @el: The new HTMLElement for this View.
		* @delegate: True to delegate DOM Events to this View.
		* @return: This View.
		**/
		public setElement(el: HTMLElement, delegate?: bool = true): View {
			if (_.isNull(el) || _.isUndefined(el)) {
				throw new Error("View 'el' cannot be null or undefined.");
			}

			if (this.$el) {
				this.undelegateEvents();
			}

			this.$el = $(el);
			this.el = this.$el[0];

			if (delegate !== false) {
				this.delegateEvents(this._domEvents);
			}

			return this;
		}

		/**
		* Delegate all DOM Events to this View.
		* This will first undelegateEvents() and then use the provided DOM Events
		* for this View.
		* 
		* @example:
		*	[
		*		new Backbone.DOMEvent(Foo.prototype.onClick, "click"), 
				new Backbone.DOMEvent(Foo.prototype.mouseOver, "mouseover"), 
				new Backbone.DOMEvent(Foo.prototype.mouseOut, "mouseout")
		*	]
		*
		* Callbacks will be bound to this View, with `this` set properly.
		* Uses event delegation for efficiency.
		* Omitting the selector binds the event to `this.el`.
		* This only works for delegate-able events: not `focus`, `blur`, and
		* not `change`, `submit`, and `reset` in Internet Explorer.
		* @domEvents: Array of DOM Events to delegate to this View.
		**/
		public delegateEvents(domEvents: IDOMEvent[]): void {
			if (domEvents.length <= 0) {
				return;
			}

			this._domEvents = _.clone(domEvents);

			this.undelegateEvents();
			for (var key in domEvents) {
				
				// Bind the function to this View for context.
				var func = <(e: JQueryEventObject) => JQuery>_.bind(domEvents[key].fn, this);
				var eventName = domEvents[key].event + '.delegateEvents' + this.cid;

				if (domEvents[key].selector === undefined) {
					this.$el.on(
						eventName,
						func);
				} else {
					this.$el.delegate(
						domEvents[key].selector,
						eventName,
						func);
				}
			}
		}

		/**
		* Clears all callbacks previously bound to the view with `delegateEvents()`.
		* You usually don't need to use this, but may wish to if you have multiple
		* Backbone Views attached to the same DOM Element.
		**/
		public undelegateEvents(): void {
			this._domEvents = new DOMEvent[];
			this.$el.off('.delegateEvents' + this.cid);
		}
	}

	/**
	* Interface to help the user that is implementing a View to know which methods can / should
	* be overriden on the Backbone.View class.
	**/
	export interface IBackboneView {
		render(): View;
	}

	export class Model extends Events implements IBackboneModel {

		public id: string = undefined;

		private cid: string;

		public idAttribute: string = 'id';

		public attributes: { [key: string]: any; };

		public sync = Backbone.sync;

		public collection: Collection = undefined;

		private _escapedAttributes: { [key: string]: any; } = {};

		private _urlRoot: string;

		constructor (
			attributes: { [key: string]: any; } = {},
			urlRoot?: string = undefined) {
			super();

			this.cid = _.uniqueId('c');

			this.attributes = attributes;
			this._urlRoot = urlRoot;
		}

		public toJSON(): any {
			return _.clone(this.attributes);
		}

		public has(key: string): any {
			return this.attributes[key] != null;
		}

		public get(key: string): any {
			return this.attributes[key];
		}

		public set(key: string, value: any): bool {
			var wrap = {};
			wrap[key] = value;
			return this.setAll(wrap);
		}

		public setAll(attributes: { [key: string]: any; }): bool {
			if (!this._validate(attributes)) {
				return false;
			}
			
			for (var key in attributes) {
				this.set(key, attributes[key])
			}
			return true;
		}

		public unset(key: string): bool {
			var wrap = {};
			wrap[key] = undefined;
			return this.unsetAll(wrap);
		}

		// the values in attributes is ignored 
		public unsetAll(attributes: { [key: string]: any; }): bool {
			if (!this._validate(attributes)) {
				return false;
			}
			
			for (var key in attributes) {
				delete this.attributes[key];
			}

			return true;
		}

		public clear() {
			this.id = undefined;
			this.attributes = {};
			this._escapedAttributes = {};
		}

		public keys(): string[] {
			return _(this.attributes).keys();
		}

		public values(): any[] {
			return _(this.attributes).values();
		}

		public escape(key: string): any {
			var html;
			if (html = this._escapedAttributes[key]) {
				return html;
			}
			var val = this.get(key);
			return this._escapedAttributes[key] = _.escape(val == null ? '' : '' + val);
		}

		public fetch(settings?: JQueryAjaxSettings): JQueryXHR {
			settings = settings ? _.clone(settings) : {};
			var success = settings.success;

			// Inject between the success callback so that the model
			// attributes can be updated before sending to the user callback.
			settings.success = (data: any, status: string, jqxhr: JQueryXHR): bool => {
				if (!this.setAll(this.parse(data, jqxhr))) {
					return false;
				}

				// Call the user's success callback if the attributes
				// were set after being validated.
				if (success) {
					success(this, status, jqxhr);
				}
				return true;
			}
			
			return (this.sync || Backbone.sync).call(
				this, 
				Backbone.MethodType.READ, 
				this, 
				settings);
		}

		public save(settings?: JQueryAjaxSettings): JQueryXHR {
			settings = settings ? _.clone(settings) : {};

			var success = settings.success;
			settings.success = (data: any, status: string, jqxhr: JQueryXHR): bool => {
				var serverAttributes = this.parse(data, jqxhr);

				if (!this.setAll(serverAttributes)) {
					return false;
				}

				if (success) {
					success(this, status, jqxhr);
				}

				return true;
			}

			var method = this.isNew() ? 
				Backbone.MethodType.CREATE :
				Backbone.MethodType.UPDATE;

			var jqxhr = (this.sync || Backbone.sync).call(this, method, this, settings);
			return jqxhr;
		}

		public destroy(settings?: JQueryAjaxSettings, wait?: bool = false): JQueryXHR {
			settings = settings ? _.clone(settings) : {};

			// Nothing to do, destroy callback immediatly and exit.
			if (this.isNew()) {
				this.onDestroyed(settings);
				return null;
			}

			var success = settings.success;
			settings.success = (data: any, status: string, jqxhr: JQueryXHR): bool => {
				// Server has responded so trigger the destroy callback.
				if (wait) {
					this.onDestroyed(settings);
				}
				if (success) {
					success(data, status, jqxhr);
				} else {
					// wat? I hope this isn't supposed to be Backbone.sync...?
					this.trigger('sync', this, data, settings);
				}
				return true;
			}

			if (!wait) {
				// Destroy on client immediatly if not waiting for server response.
				this.onDestroyed(settings);
			}
			return (this.sync || Backbone.sync).call(this, Backbone.MethodType.DELETE, this, settings);
		}

		public urlRoot(urlRoot: string): void {
			this._urlRoot = urlRoot;
		}

		public url(): string {
			var base = this._urlRoot || this.collection.url || "/";
			if (this.isNew) {
				return base;
			}
			return base + (base.charAt(base.length - 1) == "/" ? "" : "/") + encodeURIComponent(this.id);
		}

		public parse(data: any, xhr: JQueryXHR = undefined): { [key: string]: any; } {
			return data;
		}

		// Create a new model with identical attributes to this one.
		public clone(): Model {
			return new Model(this.attributes);
		}

		// A model is new if it has never been saved to the server, and lacks an id.
		public isNew(): bool {
			return this.id == null;
		}

		public isValid(): bool {
			return !this._validate(this.attributes);
		}

		public validate(attributes: { [key: string]: any; }): bool {
			return true;
		}

		private _validate(attributes: { [key: string]: any; }): bool {

			attributes = _.extend({}, this.attributes, attributes);
			var error = this.validate(attributes);
			if (!error) {
				return true;
			}
			
			this.onValidateError(attributes);
			return false;
		}

		public onDestroyed(settings: JQueryAjaxSettings): void {
			
		}

		public onValidateError(attributes: { [key: string]: any; }): void {

		}
	}

	/**
	* Interface to help the user that is implementing a Model to know which methods can / should
	* be overriden on the Backbone.Model class.
	**/
	export interface IBackboneModel {
		url(): string;
		parse(data: any, xhr: JQueryXHR): { [key: string]: any; };
		validate(attributes: { [key: string]: any; }): bool;
		
		onDestroyed(settings: JQueryAjaxSettings): void;
		onValidateError(attributes: { [key: string]: any; }): void;
	}

	export class Collection extends Events implements IBackboneCollection {

		public model: Model;

		public models: Model[];

		public length: number;

		public url: string = undefined;

		public sync = Backbone.sync;

		private _byId = undefined;

		private _byCid = undefined;

		constructor (model: Model) {
			super();

			this.model = model;
		}

		public toJSON() {
			return this.map((model: Model) => {
				return model.toJSON();
			});
		}

		public add() {

		}

		public remove() {

		}

		public push() {

		}

		public pop() {

		}

		public unshift() {

		}

		public shift() {

		}

		public get() {

		}

		public getByCid() {

		}

		public at() {

		}

		public where() {

		}

		public sort() {

		}

		public pluck() {

		}

		public reset() {

		}

		public fetch() {

		}

		public create() {

		}

		public parse() {

		}

		// Proxy to _'s chain.
		public chain() {
			return _(this.models).chain();
		}

		// Underscore proxy.
		public each(iterator: (model: Model, index?: number, list?: Model[]) => any, context?): any {
			return _.each(this.models, iterator, context);
		}

		// Alias for each
		public forEach = Collection.prototype.each;

		// Underscore proxy.
		public map(iterator: (model: Model, index?: number, list?: Model[]) => any, context?): any[] {
			return _.map(this.models, iterator, context);
		}

		// Underscore proxy.
		public reduce(iterator: (model: Model, index?: number, list?: Model[]) => any, memo, context?) {
			return _.reduce(this.models, iterator, memo, context);
		}

		// Underscore proxy.
		public reduceRight(iterator: (model: Model, index?: number, list?: Model[]) => any, memo, context?) {
			return _.reduceRight(this.models, iterator, memo, context);
		}

		// Underscore proxy.
		public find(iterator: (model: Model, index?: number, list?: Model[]) => bool, context?) {
			return _.find(this.models, iterator, context);
		}

		// Alias for find
		public detect = Collection.prototype.find;

		// Underscore proxy.
		public filter(iterator: (model: Model) => bool, context? ): Model[] {
			return _.filter(this.models, iterator, context);
		}

		// Underscore proxy.
		public select = Collection.prototype.filter;

		// Underscore proxy.
		public reject(iterator: (model: Model) => bool, context?: any): Model[] {
			return _.reject(this.models, iterator, context);
		}

		// Underscore proxy.
		public all(iterator: (model: Model) => bool, context?: any): bool {
			return _.all(this.models, iterator, context);
		}

		// Alias for all.
		public every = Collection.prototype.all;

		// Underscore proxy.
		public any(iterator: (model: Model) => bool, context?: any): bool {
			return _.any(this.models, iterator, context);
		}

		// Alias for any.
		public some = Collection.prototype.any;

		// Underscore proxy.
		public contains(model: Model): bool {
			return _.contains(this.models, model);
		}

		// Alias for contains.
		public include = Collection.prototype.contains;

		// Underscore proxy.
		public invoke(methodName: string, ...args: any[]): void {
			_.invoke(this.models, methodName, args);
		}

		// Underscore proxy.
		public max(iterator?: (model: Model) => any, context?: any): Model {
			return _.max(this.models, iterator, context);
		}

		// Underscore proxy.
		public min(iterator?: (model: Model) => any, context?: any): Model {
			return _.min(this.models, iterator, context);
		}

		// Underscore proxy.
		public sortBy(iterator: (model: Model) => any, context?: any): Model[] {
			return _.sortBy(this.models, iterator, context);
		}

		// Underscore proxy.
		public groupBy(iterator: (model: Model) => any): any {
			return _.groupBy(this.models, iterator);
		}

		// Underscore proxy.
		public sortedIndex(model: Model, iterator?: (model: Model) => any) {
			return _.sortedIndex(this.models, model, iterator);
		}

		// Underscore proxy.
		public toArray(): Model[] {
			return _.toArray(this.models);
		}

		// Underscore proxy.
		public size(): number {
			return _.size(this.models);
		}

		// Underscore proxy.
		public first(): Model {
			return _.first(this.models);
		}

		// Underscore proxy.
		public initial(n?: number): Model[] {
			return _.initial(this.models, n);
		}

		// Underscore proxy.
		public last(n?: number): Model[] {
			return _.last(this.models, n);
		}

		// Underscore proxy.
		public rest(index?: number): Model[] {
			return _.rest(this.models, index);
		}

		// Underscore proxy.
		// todo: not sure if passing the arguments like this will work
		public without(...values: any[]) {
			return _.without(this.models, arguments)
		}

		// Underscore proxy.
		// isSorted: bool => Tells the function to use more efficient binary search
		// isSorted: number => Tells the function to start looking from index 
		public indexOf(model: Model, isSorted?: any): number {
			return _.indexOf(this.models, model, isSorted);
		}

		// Underscore proxy.
		public lastIndexOf(model: Model, fromIndex?: number): number {
			return _.lastIndexOf(this.models, model, fromIndex);
		}

		// Underscore proxy.
		public shuffle(): Model[] {
			return _.shuffle(this.models);
		}

		// Underscore proxy.
		public isEmpty() {
			return _.isEmpty(this.models);
		}
	}

	export interface IBackboneCollection {
		parse();
	}
}