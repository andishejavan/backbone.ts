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
	export var _: underscore = (<any>root)._;

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

			var id = Backbone._.uniqueId("callback_");
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

		public changed = null;

		private _silent = null;

		private _pending = null;

		public idAttribute = 'id';

		private attributes: any;

		constructor (
			
			attributes: any = {}) {
			super();

			this.attributes = attributes;
		}

		public toJSON(): any {
			return _.clone(this.attributes);
		}

		// .. this is totally not typesafe, 
		// but how to trigger change event when setting an object?
		public get(attr) {
			return this.attributes[attr];
		}

	}
}