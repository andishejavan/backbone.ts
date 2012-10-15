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
	export var _ = underscore;

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
		* context: The 'this' argument when triggering the event.
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

	///**
	//* Internal module class to hold callback functions for an event.
	//**/
	//class EventCallbacks {

	//	/**
	//	* The owner object of the event, used as 'this' when applying
	//	* the callback.
	//	*
	//	* note: i think this is redundant, the Event class can pass this in
	//	*       as an argument everytime an event is triggered?
	//	*       also since it is bound to the $el or delegated i think
	//	*       the context is always set?
	//	**/
	//	//public context: any;

	//	/**
	//	* The name of the event.
	//	*
	//	* note: i think this is redundant, remove? might be usedful for reverse lookup
	//	**/
	//	public event: string;

	//	/**
	//	* The list of callback functions linked to the event.
	//	**/
	//	public fns: Function[];

	//	/**
	//	* EventFuncs constructor.
	//	* event: The name of the event.
	//	* fns: An initial array of callback functions to add.
	//	**/
	//	constructor (event: string, fns?: Function[]) {
	//		this.event = event;
	//		this.fns = (fns || new Function[0]);
	//	}

	//	/**
	//	* Adds a callback function to the event.
	//	* If the function has already been added it is not added again.
	//	* fn: The callback function to add to the event.
	//	* return: true if the callback is added, otherwise false.
	//	**/
	//	public add(fn: Function): bool {

	//		// Do not add duplicate functions.
	//		if (this.fns.indexOf(fn) !== -1)
	//			return false;

	//		this.fns.push(fn);
	//		return true;
	//	}

	//	/**
	//	* Removes a callback function from the event.
	//	* fn: The callback function to remove from the event.
	//	* return: true if the callback is removed, otherwise false.
	//	**/
	//	public remove(fn: Function): bool {

	//		var index = this.fns.indexOf(fn);
	//		if (index == -1)
	//			return false;

	//		this.fns.splice(index, 1);

	//		return true;
	//	}

	//	/**
	//	* Triggers all callback functions with the supplied arguments.
	//	* Goes through each callback function in the order they were
	//	* added (linear array).
	//	**/
	//	public trigger(context: any, ...args: any[]): void {

	//		// trigger  all functions bound to this event.
	//		for (var i = 0; i < this.fns.length; i++) {
	//			this.fns[i].apply(context, args);
	//		}
	//	}

	//	/**
	//	* Clears all callback functions.
	//	**/
	//	clear(): void {
	//		this.fns = Function[0];
	//	}
	//}

	export class Events implements IEventHandler {

		// Dictionary of events and their callback functions.
		//private eventCallbacks: {
		//	[event: string]: EventCallbacks;
		//};

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
			this._callbacks[event].context = context;

			//if (this.eventCallbacks[event] === undefined) {
			//	this.eventCallbacks[event] = new EventCallbacks(event);
			//}
			
			//this.eventCallbacks[event].add(fn);
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

			//if (!(this.eventCallbacks[event] === undefined)) {
			//	if (fn === undefined) {
			//		this.eventCallbacks[event].clear();
			//		delete this.eventCallbacks[event];
			//	}
			//	else {
			//		this.eventCallbacks[event].remove(fn);
			//	}
			//}
		}

		public trigger(event: string, ...args: any[]): void {

			if (this._callbacks[event] !== undefined) {
				for (var fn in this._callbacks[event]) {
					this._callbacks[event][fn].apply(
						this._callbacks[event].context,
						args);
				}
			}

			//if (!(this.eventCallbacks[event] === undefined)) {
			//	this.eventCallbacks[event].trigger(args);
			//}
		}

		public clear(): void {
			this._callbacks = {};
			
			//// Dictionary, use for..in rather than for loop
			//for (var event in this.eventCallbacks) {
			//	this.eventCallbacks[event].clear();
			//	delete this.eventCallbacks[event];
			//}
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

		public events: {
			[event: string]: Event;
		};

		constructor (
			el: HTMLElement, 
			events?: Event[] = new Event[]) {
			
			super();

			this.cid = _.uniqueId('view_');
			this.events = {};
			for (var i = 0; i < events.length; i++) {
				this.events[events[i].event] = events[i];
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
			if(_.isEmpty(this.events))
				return;

			this.undelegateEvents();
			for (var key in this.events) {
				
				// Bind the function to this View for context.
				_.bind(this.events[key].fn, this);

				var eventName = this.events[key].event + '.delegateEvents' + this.cid;

				if (this.events[key].selector === undefined) {
					this.$el.on(
						eventName,
						this.events[key].fn);
				} else {
					this.$el.delegate(
						this.events[key].selector,
						eventName,
						this.events[key].fn);
				}
				
			}
		}

		public undelegateEvents() {
			this.$el.off('.delegateEvents' + this.cid);
		}
	}
}