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

	// Backbone.ts version.
	export var Version = "0.1";

	// Handle to the root window.
	export var root: Window = window;

	// Handle to jQuery.
	export var $ = jQuery;

	// Handle to underscore.
	export var _: Underscore = (<any>root)._;

	// Map from CRUD to HTTP for our default `Backbone.sync` implementation.
	export var MethodType = {
		CREATE: 'POST',
		UPDATE: 'PUT',
		DELETE: 'DELETE',
		READ: 'GET'
	};

	// Override this function to change the manner in which Backbone persists
	// models to the server. You will be passed the type of request, and the
	// model in question. By default, makes a RESTful Ajax request
	// to the model's `url()`. Some possible customizations could be:
	export function sync(method: string, model: Model, settings?: JQueryAjaxSettings): JQueryXHR {

		settings || (settings = {});

		// Default JSON-request options.
		var params: JQueryAjaxSettings = { 
			type: method, 
			dataType: 'json', 
			url: model.url,
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
		* event: The name of the event.
		* fn: Callback function.
		* context: The 'this' argument when triggering the event, defaults to the callee.
		**/
		on(event: string, fn: Function, context?: any): void;

		/**
		* Turns off or removes a callback function from the event.
		* fn is optional, if provided only that callback function is removed
		* from the event.  If fn is not provided then all callback functions
		* are removed from the event.
		**/
		off(event: string, fn?: Function): void;

		/**
		* Triggers all callback functions linked to the event with
		* the supplied arguments list.
		*
		* note: do not like how the argument list cannot be statically checked
		*       not sure how to get around this so leaving as any[]
		**/
		trigger(event: string, ...args: any[]): void;

		/**
		* Clears all events and their callback functions.
		**/
		clear(): void;
	}

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

		constructor () {
			this.clear();
		}

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

		public trigger(event: string, ...args: any[]): void {

			if (this._callbacks[event] !== undefined) {
				for (var key in this._callbacks[event]) {
					this._callbacks[event][key].fn.apply(
						this._callbacks[event][key].context,
						args);
				}
			}
		}

		public clear(): void {
			this._callbacks = {};
		}
	}

	export class Event {

		constructor ( 
			public fn: (e: JQueryEventObject) => JQuery, 
			public event: string,
			public selector?: string = undefined) {
		}
	}

	export class View extends Events {

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
		* May or may not be attached to the DOM, must be manually attached.
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
		public model: Model;

		public collection: any; // todo implement Collection

		// redundant? force user to pass in element
		public className: string;

		// redundant? force user to pass in element
		public tagName: string;

		// redundant? force user to pass in element
		public attributes: any;

		public domEvents: {
			[event: string]: Event;
		};

		constructor (
			id: string,
			el: HTMLElement, 
			model?: Model = undefined,
			events?: Event[] = new Event[]) {
			
			super();

			this.id = id;
			this.cid = _.uniqueId('view_');
			this.model = model;
			this.domEvents = {};
			for (var i = 0; i < events.length; i++) {
				this.domEvents[events[i].event] = events[i];
			}

			this.setElement(el, true);
		}

		/** jQuery delegate for element lookup, scoped to DOM elements within the
		* current view.  This should be preferred to global lookups where possible.
		* selector: jQuery selector
		* returns jQuery lookup
		**/
		public $(selector): JQuery {
			return this.$el.find(selector);
		}

		public render(): View {
			return this;
		}

		/**
		* Removes the View from the DOM.
		* Side effects includes undelegeting events, use detach to keep
		* events intact.
		**/
		public remove(): View {
			this.$el.remove();
			return this;
		}

		/**
		* Detaches the View from the DOM.
		* Delegates to $.detach, preserving jQuery data and events.  This
		* is the preferred method if you plan on re-using the View.
		**/
		public detach(): View {
			this.$el.detach();
			return this;
		}

		/**
		* Set the View's element (`this.el` property), by default
		* re-delegates all events.
		**/
		public setElement(el: HTMLElement, delegate?: bool = true): View {
			if(this.$el)
				this.undelegateEvents();

			this.$el = $(el);
			this.el = this.$el[0];

			if(delegate !== false)
				this.delegateEvents();

			return this;
		}

		public delegateEvents(): void {
			if(_.isEmpty(this.domEvents))
				return;

			this.undelegateEvents();
			for (var key in this.domEvents) {
				
				// Bind the function to this View for context.
				var func = _.bind(this.domEvents[key].fn, this);
				var eventName = this.domEvents[key].event + '.delegateEvents' + this.cid;

				if (this.domEvents[key].selector === undefined) {
					this.$el.on(
						eventName,
						func);
				} else {
					this.$el.delegate(
						this.domEvents[key].selector,
						eventName,
						<any>func);
				}
				
			}
		}

		public undelegateEvents() {
			this.$el.off('.delegateEvents' + this.cid);
		}
	}

	export class Model extends Events {

		public id: string = undefined;

		private cid: string;

		public idAttribute: string = 'id';

		public url: string;

		public attributes: { [key: string]: any; };

		public sync = Backbone.sync;

		public collection: Collection = undefined;

		private _escapedAttributes: { [key: string]: any; } = {};

		constructor (
			attributes: { [key: string]: any; } = {}) {
			super();

			this.cid = _.uniqueId('c');

			this.attributes = attributes;
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

		public escape(key: string): any {
			var html;
			if (html = this._escapedAttributes[key]) {
				return html;
			}
			var val = this.get(key);
			return this._escapedAttributes[key] = _.escape(val == null ? '' : '' + val);
		}

		public set(key: string, value: any): bool {
			if (!this.validate(key, value)) {
				return false;
			}
			this.attributes[key] = value;
			return true;
		}

		public setAll(attributes: { [key: string]: any; }): bool {
			if (!this.validateAll(attributes)) {
				return false;
			}
			
			for (var key in attributes) {
				this.set(key, attributes[key])
			}
			return true;
		}

		public unset(key: string): bool {
			if (!this.validate(key, undefined)) {
				return false;
			}

			delete this.attributes[key];
			return true;
		}

		// the values in attributes is ignored 
		public unsetAll(attributes: { [key: string]: any; }): bool {
			if (!this.validateAll(attributes)) {
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

		public onDestroyed(settings: JQueryAjaxSettings): void {

		}

		public change() {
			// need to keep track of changed attributes to suppor this
		}

		public isValid(): bool {
			return !this.validateAll(this.attributes);
		}

		public validate(key: string, value: any): bool {
			return true;
		}

		public validateAll(attributes: { [key: string]: any; }): bool {
			return true;
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
	}

	export class Collection extends Events {

	}
}