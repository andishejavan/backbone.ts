/*
backbone-0.3.0.ts may be freely distributed under the MIT license.
Copyright (c) 2013 Josh Baldwin https://github.com/jbaldwin/backbone.ts

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation 
files (the "Software"), to deal in the Software without 
restriction, including without limitation the rights to use, 
copy, modify, merge, publish, distribute, sublicense, and/or sell 
copies of the Software, and to permit persons to whom the 
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be 
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, 
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES 
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR 
OTHER DEALINGS IN THE SOFTWARE.
*/

/// <reference path="lib/jQuery-1.8.d.ts" />
/// <reference path="lib/underscore-1.4.d.ts" />

module Backbone {
    /**
    * Interface that contains a bag of attributes key by each attribute's key.
    **/
    interface IAttributeBag {
        [key: string]: IAttribute;
    }
    /**
    * A Backbone.Model's attributes interface.  This interface can be
    * extended to give custom type safe implementations.  The example given
    * provides how to create the interface for a string attribute.
    *
    * @usage Extend this interface with your own implementation
    *        to give the value a concrete type.
    *
    * @example A simple string attribute example:
    *
    *  interface IStringAttribute extends IAttribute {
    *      Value: string;
    *  }
    *
    *  // Can still be instantiated with base Attribute implementation
    *  var strAttr: IStringAttribute = new Attribute(key, value);
    **/
    interface IAttribute {
        /**
        * The attribute's key.
        **/
        Key: string;
        /**
        * The attribute's value.
        **/
        Value: any;
    }
    /**
    * A Backbone.Model's attributes.
    **/
    class Attribute implements IAttribute {
        /**
        * The attribute's key.
        **/
        public Key: string;
        /**
        * The attribute's value.
        **/
        public Value: any;
        /**
        * Creates a new Attribute with the given key/value pair.
        * @key The attribute's key.
        * @value The attribute's value.
        **/
        constructor(key: string, value: any);
    }
}
module Backbone {
    /**
    * Interface for DOM events.
    **/
    interface IDOMEvent {
        fn(e: JQueryEventObject): JQuery;
        event: string;
        selector?: string;
    }
    /**
    * Simple implementation of IDOMEvent for internal use within Backbone.ts.
    * Use IDOMEvent extrnally of Backbone.ts for your own custom objects or
    * if all you need is a base implementation then use this.
    **/
    class DOMEvent implements IDOMEvent {
        public fn: (e: JQueryEventObject) => JQuery;
        public event: string;
        public selector: string;
        /**
        * Initializes a DOMEvent within a Backbone.View.
        * @fn: The DOMEvent callback, takes a JQueryEventObject and returns JQuery.
        * @event: The event name.
        * @event: The event's selector, default is no selector.
        **/
        constructor(fn: (e: JQueryEventObject) => JQuery, event: string, selector?: string);
    }
    /**
    * IEvent, extend your own version of this interface to give typed
    * data to the function callbacks and trigger arguments.
    *
    * @example
    *
    *	A basic message event with strongly typed arguments:
    *
    *	export interface IMessageEvent extends IEvent {
    *		Add(fn: (message: string) => void): void;
    *		Remove(fn: (message: string) => void): bool;
    *		Clear(): void;
    *		Trigger(message: string): void;
    *	}
    *
    *	Instantiate with 'Event' and cast to your interface type.
    *
    *	var event: IMessageEvent = new Event(context);
    **/
    interface IEvent {
        /**
        * Add a new function listener to the event.
        * @fn Function callback listener to add.
        **/
        Add(fn: () => void): void;
        /**
        * Remove a function listener from the event.
        * @fn Function callback listener to remove.
        * @return True if 'fn' was removed from this event, otherwise false.
        **/
        Remove(fn: () => void): bool;
        /**
        * Removes all function listeners from the event.
        **/
        Clear(): void;
        /**
        * Trigger all function listeners of this event in the order
        * they were added.
        * @args Arguments to pass to each function listener when called.
        **/
        Trigger(...args: any[]): void;
    }
    /**
    * Generic implementation of IEvent.
    * All extensions of IEvent can use this concrete implementation
    * for the behavior, the function signatures in user defined
    * Add(), Remove(), Trigger() will all pass the arguments through
    * correctly.
    *
    * This class can also be extended to add custom data, however the
    * base Add(), Remove() and Trigger() functions typically can be
    * left alone unless you require a custom implementation or different
    * behavior on how trigger works.
    **/
    class Event implements IEvent {
        /**
        * Context when calling events.  By default if no context
        * is provided then an empty object is used.
        **/
        private _context;
        /**
        * List of callback listener functions.
        * Callbacks are called in the order they are added.
        **/
        private _fns;
        /**
        * Creates a new typed event.  Extend or implement a typed
        * version of IEvent to fill out the fn: Function's.
        * This base Event class will call any implementation of
        * IEvent regardless of the types defined for the function
        * callbacks.
        * @context Context when calling each function callback, default = {}.
        **/
        constructor(context?: any);
        /**
        * Adds a callback function to this event.
        * Duplicates are allowed and not checked for.
        * @fn Callback function to call when this event is triggered.
        **/
        public Add(fn: Function): void;
        /**
        * Removes a callback function from this event.
        * @fn Remove this callback function from this event.
        * @return True if 'fn' was removed, false if 'fn' was not removed.
        **/
        public Remove(fn: Function): bool;
        /**
        * Removes all callback functions from this event.
        **/
        public Clear(): void;
        /**
        * Triggers all callback functions linked to this event with
        * the supplied argument list.
        * @args User supplied arguments to all callback functions.
        **/
        public Trigger(...args: any[]): void;
    }
}
module Backbone {
    interface IData {
    }
    interface ViewSettings {
        id?: string;
        el?: HTMLElement;
        domEvents?: DOMEvent[];
        delegateDOMEvents?: bool;
    }
    /**
    * Backbone.View
    **/
    class View {
        static _defaults: ViewSettings;
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
        public Data: IData;
        /**
        * Clone of the user provided DOMEvents in case of resetting the `el`.
        **/
        private _domEvents;
        /**
        * Initialize the Backbone.View.
        * @param settings View settings:<br />
        *	id: User defined identifier, required.<br />
        *	el: The View's element.  Must be provided, may or may not be attached to the DOM
        *      when creating the View.  However, it must manually be attached when it is.
        *	domEvents: array of DOM Events to intialize the View with.<br />
        *	delegeteEvents: By default the DOM Events will be delegated, see delegateEvents().
        **/
        constructor(settings?: ViewSettings);
        /**
        * jQuery delegate for element lookup, scoped to DOM elements within the
        * current view.  This should be preferred to global lookups where possible.
        * @selector: jQuery selector
        * @return: jQuery
        **/
        public $(selector): JQuery;
        /**
        * Renders the View, should only need to be called once or if a refresh
        * is required.
        * @return: This View.
        **/
        public Render(): View;
        /**
        * Removes the View from the DOM.
        * Side effects includes undelegeting events (jQuery known issue), use detach to keep
        * events intact.
        * @return: This View.
        **/
        public Remove(): View;
        /**
        * Detaches the View from the DOM.
        * Delegates to $.detach, preserving jQuery data and events.  This
        * is the preferred method if you plan on re-using the View.
        * @return: This View.
        **/
        public Detach(): View;
        /**
        * Set the View's element (`this.el` property), by default
        * re-delegates all DOM Events previously set on the View.
        * Does not attach the new `el` to the DOM, the user must do this.
        * @el: The new HTMLElement for this View.
        * @delegate: True to delegate DOM Events to this View.
        * @return: This View.
        **/
        public SetElement(el: HTMLElement, delegate?: bool): View;
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
        public DelegateEvents(domEvents: IDOMEvent[]): void;
        /**
        * Clears all callbacks previously bound to the view with `delegateEvents()`.
        * You usually don't need to use this, but may wish to if you have multiple
        * Backbone Views attached to the same DOM Element.
        **/
        public UndelegateEvents(): void;
    }
}
module Backbone {
    interface IOnChangeEvent extends IEvent {
        Add(fn: (attributes: IAttributeBag, previous: IAttributeBag) => void): void;
        Remove(fn: (attributes: IAttributeBag, previous: IAttributeBag) => void): bool;
        Trigger(attributes: IAttributeBag, previous: IAttributeBag): void;
    }
    interface IOnRemoveEvent extends IEvent {
        Add(fn: (attributes: IAttributeBag, removed: IAttributeBag) => void): void;
        Remove(fn: (attributes: IAttributeBag, removed: IAttributeBag) => void): bool;
        Trigger(attributes: IAttributeBag, removed: IAttributeBag): void;
    }
    interface IOnFetchEvent extends IEvent {
        Add(fn: (attributes: IAttributeBag) => void): void;
        Remove(fn: (attributes: IAttributeBag) => void): bool;
        Trigger(attributes: IAttributeBag): void;
    }
    interface IOnSaveEvent extends IEvent {
        Add(fn: (attributes: IAttributeBag) => void): void;
        Remove(fn: (attributes: IAttributeBag) => void): bool;
        Trigger(attributes: IAttributeBag): void;
    }
    interface IOnDestroyedEvent extends IEvent {
        Add(fn: (settings: JQueryAjaxSettings) => void): void;
        Remove(fn: (settings: JQueryAjaxSettings) => void): bool;
        Trigger(settings: JQueryAjaxSettings): void;
    }
    interface IOnValidateErrorEvent extends IEvent {
        Add(fn: (attributes: IAttributeBag, failed: IAttributeBag) => void): void;
        Remove(fn: (attributes: IAttributeBag, failed: IAttributeBag) => void): bool;
        Trigger(attributes: IAttributeBag, failed: IAttributeBag): void;
    }
    /**
    * Create a new model, with defined attributes.  A client id (`cid`)
    * is automatically generated and assigned for you.
    **/
    class Model {
        /**
        * Model's ID.
        **/
        public Id: string;
        /**
        * The default name for the JSON `id` attribute is "id".
        * Set this to the JSON `id` attribute value that should be used.
        **/
        public IdAttribute: string;
        /**
        * Automatically assigned client ID.
        **/
        public ClientId: string;
        /**
        * Current set of attributes for this model.
        **/
        public Attributes: IAttributeBag;
        /**
        * Previous set of attributes for this model.
        **/
        public Previous: IAttributeBag;
        /**
        * Sync function.  By default delegates to `Backbone.Sync`.
        **/
        public Sync: (method: string, model: Model, settings?: JQueryAjaxSettings) => JQueryXHR;
        /**
        * The model's collection if it is a part of one.
        * If the model is not a part of a collection this is undefined.
        **/
        public Collection: Collection;
        /**
        * The model's URL root when fetching/saving/destroying.
        **/
        private _urlRoot;
        /**
        * Event for when the model's attributes change.
        * @info This event is fired on `Set` or `Remove`.
        **/
        public OnChange: IOnChangeEvent;
        /**
        * Event for when the model's attributes are fetched from the server.
        * @info This event is only called when the fetch is successful.
        **/
        public OnFetch: IOnFetchEvent;
        /**
        * Event for when the model is saved to the server.
        * @info This event is trigged only after the model is saved and only
        *       when the save is successful.
        **/
        public OnSave: IOnSaveEvent;
        /**
        * Event for when the model is destroyed.
        **/
        public OnDestroyed: IOnDestroyedEvent;
        /**
        * Event for when trying to `Set` or `Remove` attributes but
        * the attributes failed to validate.
        * @info Note that this is called instead of `OnChange` for this
        *       use case.
        **/
        public OnValidateError: IOnValidateErrorEvent;
        /**
        * Creates a new model.
        * @attributes Starting attributes.  They are not currently validated.
        * @urlRoot Model's URL root for fetch/save/destroy calls.
        **/
        constructor(attributes?: IAttributeBag, urlRoot?: string);
        /**
        * Converts this model's attributes into JSON format.
        * By default this is a simple conversion from IAttributeBag to JSON
        * data.  Override this function for more complex implementations.
        * By default the `ID` attribute with the key `IDAttribute` is
        * injected into the resulting JSON conversion.
        * @return This model's attributes and ID converted to JSON format.
        *         Note you will still need to use JSON.stringify().
        **/
        public ToJSON(): any;
        /**
        * Determines if the attribute exists on this model.
        * @key The attribute's key to check for.
        * @return True if the attribute exists on this model, otherwise false.
        **/
        public Has(key: string): bool;
        /**
        * Retreives an attribute by key.
        * @key The attribute's key.
        * @return The attribute or undefined if it does not exist.
        **/
        public Get(key: string): IAttribute;
        /**
        * Adds or sets  a set of attributes on this model if validation is successful.
        * @attributes Attributes to add/set on this model.
        * @return True if the attributes were successfully set, otherwise false.
        **/
        public Set(attributes: IAttributeBag): bool;
        /**
        * Removes a set of attributes from the model if validation is successful.
        * @attributes Attributes to delete/remove from this model.
        * @return True if the attributes were successfully removed, otherwise false.
        **/
        public Remove(attributes: IAttributeBag): bool;
        /**
        * Clears the entire model.  Only the ClientID remains.
        **/
        public Clear(): void;
        /**
        * Gets an array of all the attribute's keys.
        * @return Attribute key array.
        **/
        public Keys(): string[];
        /**
        * Gets an array of all the attribute's values.
        * @return Attribute value array.
        **/
        public Values(): any[];
        /**
        * Sends a fetch command to the server for this model.
        * By default uses HTTP 'GET'.  Can be overriden through the
        * jQuery Ajax settings.
        * @settings jQuery Ajax settings to use.
        * @return jQuery Ajax XHR result.
        **/
        public Fetch(settings?: JQueryAjaxSettings): JQueryXHR;
        /**
        * Sends a save command to the server for this model.
        * By default uses HTTP 'POST' or 'PUT'.  Uses 'POST' if the model
        * is new and 'PUT' if the model has already been created.
        * @settings jQuery Ajax settings to use.
        * @return jQuery Ajax XHR result.
        **/
        public Save(settings?: JQueryAjaxSettings): JQueryXHR;
        /**
        * Sends a destroy command to the server for this model.
        * By default uses HTTP 'DELETE', can override through the
        * jQuery Ajax settings.
        * @settings jQuery Ajax settings to use.
        * @wait Wait for the server to respond before triggering OnDestroyed events.
        * @return jQuery Ajax XHR result.
        **/
        public Destroy(settings?: JQueryAjaxSettings, wait?: bool): JQueryXHR;
        /**
        * Sets the URL root for this model.
        * @urlRoot The new URL root for this model.
        **/
        public UrlRoot(urlRoot: string): void;
        /**
        * Determines the model's fetch/save/destroy URL.
        * If the model is new then the URL is only the model's URL root.
        * @return Model's fetch/save/destroy URL, or URL root if new.
        **/
        public Url(): string;
        /**
        * Parse the raw incoming JSON data into an IAttributeBag.
        * By default this function will check for the `IDAttribute` value
        * in the JSON and populate the `ID` field for this model.
        * It is recommended to call this version of `Parse()` as a super or
        * implement your own logic to populate the `ID` field in the overriden
        * `Parse` implementation.
        * By default this implementation only converts the incoming JSON
        * data into an IAttributeBag.  The IDAttribute if present
        * is stripped from this IAttributeBag since it is assigned to the
        * model's `ID` field.
        * @data Raw data from ajax call.
        * @return The parsed raw JSON `data` converted into IAttributeBag.
        **/
        public Parse(data: any, jqxhr: JQueryXHR): IAttributeBag;
        /**
        * Creates a clone of this model.
        * All model fields except for `Attributes` and `UrlRoot` are reset.
        * For example this means all events are removed on a clone.
        * @return Cloned model.
        **/
        public Clone(): Model;
        /**
        * Determines if the model is new.  Simply checks to see if the model has had an ID assigned yet.
        * @return True if the model does not have an assigned ID, otherwise false.
        **/
        public IsNew(): bool;
        /**
        * Validates the model's current `Attributes`.
        * @return True if the model's `Attributes` are valid, otherwise false.
        **/
        public IsValid(): bool;
        /**
        * User defined function.  Return true if the set of provided attributes
        * is valid for this model type, otherwise return false.  If validation
        * fails then populate the `failed` out argument with the attributes that
        * have failed to validate.  These failed attributes will be propagated
        * through the `OnFailedValidation` event.
        * By default this method if not overriden will validate to true everytime.
        * @override Override this method to valid your attributes for this model.
        *
        * @attributes The set of attributes to validate for this model type.
        * @failed The set of attributes that failed to validate.  This argument is 'out',
        *         however when called will always be provided with an empty instance.
        * @return True if the `attributes` are valid, otherwise false.
        **/
        public Validate(attributes: IAttributeBag, failed: IAttributeBag): bool;
        /**
        * Pre-fills any internal `Validate` call with all current existing
        * attributes on the model.  This makes it easier so that the validate
        * function can work with its own set of attributes intead of checking
        * back into the current set on the model.
        * @attributes The set of attributes to validate for this model type.
        * @return False if the `attributes are valid, otherwise true.
        **/
        private _validate(attributes);
    }
}
module Backbone {
    class Collection {
        public Url(): string;
    }
}
module Backbone {
    /**
    * Backbone.ts version.
    **/
    var Version: string;
    /**
    * Handle to jQuery.
    **/
    var $: JQueryStatic;
    /**
    * Handle to underscore.
    **/
    var _: Underscore;
    /**
    * Map from CRUD to HTTP for our default `Backbone.sync` implementation.
    **/
    var MethodType: {
        CREATE: string;
        UPDATE: string;
        DELETE: string;
        READ: string;
    };
    /**
    * Override this function to change the manner that Backbone persists models to the server.
    * By default makes a RESTful Ajax request to the model's `url()`.
    *
    * @info Does not currently support "emutelateHTTP" from backbone.js
    *
    * @method http method to use for the sync, set Backbone.MethodType for Backbone.ts to use
    *         different http verbs by default.
    * @model The model to sync with the server.
    * @settings the jQuery ajax settings including all jqXHR callbacks.
    * @return the jqXHR object that $.ajax creates for the sync request.
    **/
    function Sync(method: string, model: Model, settings?: JQueryAjaxSettings): JQueryXHR;
}
