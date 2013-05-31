/// <reference path="Backbone.ts" />

module Backbone {

	export interface IData {

	}

	export interface ViewSettings {
		id?: string;
		el?: HTMLElement;
		domEvents?: Backbone.DOMEvent[];
		delegateDOMEvents?: bool;
	}

	/**
	* Backbone.View
	**/
	export class View {

		public static _defaults: ViewSettings = {
			id: undefined,
			el: undefined,
			domEvents: [],
			delegateDOMEvents: false
		};

		/**
		* User defined id for the view.
		**/
		public Id: string;

		/**
		* Backbone defined cid for the view.
		* Format is "view_{number}".
		**/
		public ClientId: string;

		/**
		* The element, must be provided to the View.
		* May or may not be attached to the DOM, must be manually attached by the user.
		**/
		public El: HTMLElement;

		/**
		* jQuery reference to the element provided.
		**/
		public $el: JQuery;

		/**
		* The instance of the model or collection associated with this view.
		**/
		public Data: IData = undefined;

		/**
		* Clone of the user provided DOMEvents in case of resetting the `el`.
		**/
		private _domEvents: IDOMEvent[];

		/**
		* Initialize the Backbone.View.
		* @param settings View settings:<br />
		*	id: User defined identifier, required.<br />
		*	el: The View's element.  Must be provided, may or may not be attached to the DOM
		*      when creating the View.  However, it must manually be attached when it is.
		*	domEvents: array of DOM Events to intialize the View with.<br />
		*	delegeteEvents: By default the DOM Events will be delegated, see delegateEvents().
		**/
		constructor (settings?: ViewSettings) {

			var options = <ViewSettings>Backbone._.extend({}, settings, View._defaults);

			if (Backbone._.isNull(options.id) || Backbone._.isUndefined(options.id)) {
				throw new Error("View 'id' cannot be null or undefined.");
			}

			if (Backbone._.isNull(options.el) || Backbone._.isUndefined(options.el)) {
				throw new Error("View 'el' cannot be null or undefined.");
			}

			this.Id = options.id;
			this.ClientId = Backbone._.uniqueId('view_');
			this._domEvents = options.domEvents;

			//if (delegateDOMEvents) {
			//	this.delegateEvents(domEvents);
			//}

			// Set the element and delegate events if requested.
			this.SetElement(options.el, options.delegateDOMEvents);
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
		public Render(): View {
			return this;
		}

		/**
		* Removes the View from the DOM.
		* Side effects includes undelegeting events (jQuery known issue), use detach to keep
		* events intact.
		* @return: This View.
		**/
		public Remove(): View {
			this.$el.remove();
			return this;
		}

		/**
		* Detaches the View from the DOM.
		* Delegates to $.detach, preserving jQuery data and events.  This
		* is the preferred method if you plan on re-using the View.
		* @return: This View.
		**/
		public Detach(): View {
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
		public SetElement(el: HTMLElement, delegate?: bool = true): View {
			if (Backbone._.isNull(el) || Backbone._.isUndefined(el)) {
				throw new Error("View `el` cannot be null or undefined.");
			}

			if (this.$el) {
				this.UndelegateEvents();
			}

			this.$el = $(el);
			this.El = this.$el[0];

			if (delegate) {
				this.DelegateEvents(this._domEvents);
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
		public DelegateEvents(domEvents: IDOMEvent[]): void {
			if (domEvents.length <= 0) {
				return;
			}

			this._domEvents = _.clone(domEvents);

			this.UndelegateEvents();
			for (var key in domEvents) {
				
				// Bind the function to this View for context.
				var func = <(e: JQueryEventObject) => JQuery>_.bind(domEvents[key].fn, this);
				var eventName = domEvents[key].event + '.delegateEvents' + this.ClientId;

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
		public UndelegateEvents(): void {
			this._domEvents = new DOMEvent[];
			this.$el.off('.delegateEvents' + this.ClientId);
		}
	}
}
