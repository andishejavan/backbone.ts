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
	export var _ = (<any>root)._;

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
		* context: The 'this' argument when triggering the event, defaults to window
		*          if no context is given.
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

		private _callbacks: {
			[event: string]: {
				[id: string]: Function;
				context: string;
			};
		};

		constructor () {

		}

		public on(event: string, fn: Function, context?: any): void {

			if (this._callbacks[event] === undefined) {
				this._callbacks[event] = <any>{};	// don't know how to declare properly
													// set to empty object literal
			}

			this._callbacks[event][fn.toString()] = fn;
			this._callbacks[event].context = (context || Backbone.root);
		}
		
		
		public off(event: string, fn?: Function): void {
		
			if (this._callbacks[event] !== undefined) {
				if (fn !== undefined) {
					delete this._callbacks[event][fn.toString()];

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
				for (var fn in this._callbacks[event]) {
					this._callbacks[event][fn].apply(
						this._callbacks[event].context,
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

		public cid: string;

		public id: string;

		public el: HTMLElement;

		public $el: JQuery;

		public model: any; // todo implement Model

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
			el: HTMLElement, 
			events?: Event[] = new Event[]) {
			
			super();

			this.cid = _.uniqueId('view_');
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
						func);
				}
				
			}
		}

		public undelegateEvents() {
			this.$el.off('.delegateEvents' + this.cid);
		}
	}

	export class Model extends Events {

		constructor () {
			super();
		}

	}
}