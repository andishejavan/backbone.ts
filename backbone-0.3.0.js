/// <reference path="Backbone.ts" />
var Backbone;
(function (Backbone) {
    /**
    * A Backbone.Model's attributes.
    **/
    var Attribute = (function () {
        /**
        * Creates a new Attribute with the given key/value pair.
        * @key The attribute's key.
        * @value The attribute's value.
        **/
        function Attribute(key, value) {
            this.Key = key;
            this.Value = value;
        }
        return Attribute;
    })();
    Backbone.Attribute = Attribute;    
})(Backbone || (Backbone = {}));
/// <reference path="../lib/jQuery-1.8.d.ts" />
var Backbone;
(function (Backbone) {
    /**
    * Simple implementation of IDOMEvent for internal use within Backbone.ts.
    * Use IDOMEvent extrnally of Backbone.ts for your own custom objects or
    * if all you need is a base implementation then use this.
    **/
    var DOMEvent = (function () {
        /**
        * Initializes a DOMEvent within a Backbone.View.
        * @fn: The DOMEvent callback, takes a JQueryEventObject and returns JQuery.
        * @event: The event name.
        * @event: The event's selector, default is no selector.
        **/
        function DOMEvent(fn, event, selector) {
            if (typeof selector === "undefined") { selector = undefined; }
            this.fn = fn;
            this.event = event;
            this.selector = selector;
        }
        return DOMEvent;
    })();
    Backbone.DOMEvent = DOMEvent;    
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
    var Event = (function () {
        /**
        * Creates a new typed event.  Extend or implement a typed
        * version of IEvent to fill out the fn: Function's.
        * This base Event class will call any implementation of
        * IEvent regardless of the types defined for the function
        * callbacks.
        * @context Context when calling each function callback, default = {}.
        **/
        function Event(context) {
            if (typeof context === "undefined") { context = {
            }; }
            /**
            * List of callback listener functions.
            * Callbacks are called in the order they are added.
            **/
            this._fns = new Array();
            this._context = context;
        }
        Event.prototype.Add = /**
        * Adds a callback function to this event.
        * Duplicates are allowed and not checked for.
        * @fn Callback function to call when this event is triggered.
        **/
        function (fn) {
            this._fns.push(fn);
        };
        Event.prototype.Remove = /**
        * Removes a callback function from this event.
        * @fn Remove this callback function from this event.
        * @return True if 'fn' was removed, false if 'fn' was not removed.
        **/
        function (fn) {
            for(var i = 0; i < this._fns.length; i++) {
                if(this._fns[i] === fn) {
                    this._fns.splice(i, 1);
                    return true;
                }
            }
            return false;
        };
        Event.prototype.Clear = /**
        * Removes all callback functions from this event.
        **/
        function () {
            this._fns = [];
        };
        Event.prototype.Trigger = /**
        * Triggers all callback functions linked to this event with
        * the supplied argument list.
        * @args User supplied arguments to all callback functions.
        **/
        function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            var fns = this._fns.slice(0);
            for(var i = 0; i < fns.length; i++) {
                fns[i].apply(this._context, args || []);
            }
        };
        return Event;
    })();
    Backbone.Event = Event;    
})(Backbone || (Backbone = {}));
/// <reference path="Backbone.ts" />
var Backbone;
(function (Backbone) {
    /**
    * Backbone.View
    **/
    var View = (function () {
        /**
        * Initialize the Backbone.View.
        * @param settings View settings:<br />
        *	id: User defined identifier, required.<br />
        *	el: The View's element.  Must be provided, may or may not be attached to the DOM
        *      when creating the View.  However, it must manually be attached when it is.
        *	domEvents: array of DOM Events to intialize the View with.<br />
        *	delegeteEvents: By default the DOM Events will be delegated, see delegateEvents().
        **/
        function View(settings) {
            /**
            * The instance of the model or collection associated with this view.
            **/
            this.Data = undefined;
            var options = Backbone._.extend({
            }, settings, View._defaults);
            if(Backbone._.isNull(options.id) || Backbone._.isUndefined(options.id)) {
                throw new Error("View 'id' cannot be null or undefined.");
            }
            if(Backbone._.isNull(options.el) || Backbone._.isUndefined(options.el)) {
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
        View._defaults = {
            id: undefined,
            el: undefined,
            domEvents: [],
            delegateDOMEvents: false
        };
        View.prototype.$ = /**
        * jQuery delegate for element lookup, scoped to DOM elements within the
        * current view.  This should be preferred to global lookups where possible.
        * @selector: jQuery selector
        * @return: jQuery
        **/
        function (selector) {
            return this.$el.find(selector);
        };
        View.prototype.Render = /**
        * Renders the View, should only need to be called once or if a refresh
        * is required.
        * @return: This View.
        **/
        function () {
            return this;
        };
        View.prototype.Remove = /**
        * Removes the View from the DOM.
        * Side effects includes undelegeting events (jQuery known issue), use detach to keep
        * events intact.
        * @return: This View.
        **/
        function () {
            this.$el.remove();
            return this;
        };
        View.prototype.Detach = /**
        * Detaches the View from the DOM.
        * Delegates to $.detach, preserving jQuery data and events.  This
        * is the preferred method if you plan on re-using the View.
        * @return: This View.
        **/
        function () {
            this.$el.detach();
            return this;
        };
        View.prototype.SetElement = /**
        * Set the View's element (`this.el` property), by default
        * re-delegates all DOM Events previously set on the View.
        * Does not attach the new `el` to the DOM, the user must do this.
        * @el: The new HTMLElement for this View.
        * @delegate: True to delegate DOM Events to this View.
        * @return: This View.
        **/
        function (el, delegate) {
            if (typeof delegate === "undefined") { delegate = true; }
            if(Backbone._.isNull(el) || Backbone._.isUndefined(el)) {
                throw new Error("View `el` cannot be null or undefined.");
            }
            if(this.$el) {
                this.UndelegateEvents();
            }
            this.$el = Backbone.$(el);
            this.El = this.$el[0];
            if(delegate) {
                this.DelegateEvents(this._domEvents);
            }
            return this;
        };
        View.prototype.DelegateEvents = /**
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
        function (domEvents) {
            if(domEvents.length <= 0) {
                return;
            }
            this._domEvents = Backbone._.clone(domEvents);
            this.UndelegateEvents();
            for(var key in domEvents) {
                // Bind the function to this View for context.
                var func = Backbone._.bind(domEvents[key].fn, this);
                var eventName = domEvents[key].event + '.delegateEvents' + this.ClientId;
                if(domEvents[key].selector === undefined) {
                    this.$el.on(eventName, func);
                } else {
                    this.$el.delegate(domEvents[key].selector, eventName, func);
                }
            }
        };
        View.prototype.UndelegateEvents = /**
        * Clears all callbacks previously bound to the view with `delegateEvents()`.
        * You usually don't need to use this, but may wish to if you have multiple
        * Backbone Views attached to the same DOM Element.
        **/
        function () {
            this._domEvents = new Array();
            this.$el.off('.delegateEvents' + this.ClientId);
        };
        return View;
    })();
    Backbone.View = View;    
})(Backbone || (Backbone = {}));
/// <reference path="Backbone.ts" />
var Backbone;
(function (Backbone) {
    /**
    * Create a new model, with defined attributes.  A client id (`cid`)
    * is automatically generated and assigned for you.
    **/
    var Model = (function () {
        /**
        * Creates a new model.
        * @attributes Starting attributes.  They are not currently validated.
        * @urlRoot Model's URL root for fetch/save/destroy calls.
        **/
        function Model(attributes, urlRoot) {
            if (typeof attributes === "undefined") { attributes = {
            }; }
            if (typeof urlRoot === "undefined") { urlRoot = undefined; }
            /**
            * Model's ID.
            **/
            this.Id = undefined;
            /**
            * The default name for the JSON `id` attribute is "id".
            * Set this to the JSON `id` attribute value that should be used.
            **/
            this.IdAttribute = "id";
            /**
            * Sync function.  By default delegates to `Backbone.Sync`.
            **/
            this.Sync = Backbone.Sync;
            /**
            * The model's collection if it is a part of one.
            * If the model is not a part of a collection this is undefined.
            **/
            this.Collection = undefined;
            this.OnChange = new Backbone.Event(this);
            this.OnFetch = new Backbone.Event(this);
            this.OnSave = new Backbone.Event(this);
            this.OnDestroyed = new Backbone.Event(this);
            this.OnValidateError = new Backbone.Event(this);
            this.ClientId = Backbone._.uniqueId('model_');
            this.Attributes = attributes;
            this._urlRoot = urlRoot;
        }
        Model.prototype.ToJSON = /**
        * Converts this model's attributes into JSON format.
        * By default this is a simple conversion from IAttributeBag to JSON
        * data.  Override this function for more complex implementations.
        * By default the `ID` attribute with the key `IDAttribute` is
        * injected into the resulting JSON conversion.
        * @return This model's attributes and ID converted to JSON format.
        *         Note you will still need to use JSON.stringify().
        **/
        function () {
            var json = {
            };
            // Inject the ID attribute.
            if(!Backbone._.isUndefined(this.Id) || !Backbone._.isNull(this.Id)) {
                json[this.IdAttribute] = this.Id;
            }
            for(var key in this.Attributes) {
                json[key] = this.Attributes[key];
            }
            return json;
        };
        Model.prototype.Has = /**
        * Determines if the attribute exists on this model.
        * @key The attribute's key to check for.
        * @return True if the attribute exists on this model, otherwise false.
        **/
        function (key) {
            return this.Attributes[key] !== null;
        };
        Model.prototype.Get = /**
        * Retreives an attribute by key.
        * @key The attribute's key.
        * @return The attribute or undefined if it does not exist.
        **/
        function (key) {
            return this.Attributes[key];
        };
        Model.prototype.Set = /**
        * Adds or sets  a set of attributes on this model if validation is successful.
        * @attributes Attributes to add/set on this model.
        * @return True if the attributes were successfully set, otherwise false.
        **/
        function (attributes) {
            if(!this._validate(attributes)) {
                return false;
            }
            for(var key in attributes) {
                this.Previous[key] = this.Attributes[key];
                this.Attributes[key] = attributes[key];
            }
            this.OnChange.Trigger(this.Attributes, this.Previous);
            return true;
        };
        Model.prototype.Remove = /**
        * Removes a set of attributes from the model if validation is successful.
        * @attributes Attributes to delete/remove from this model.
        * @return True if the attributes were successfully removed, otherwise false.
        **/
        function (attributes) {
            for(var key in attributes) {
                attributes[key].Value = undefined;
            }
            if(!this._validate(attributes)) {
                return false;
            }
            for(var key in attributes) {
                this.Previous = this.Attributes[key];
                delete this.Attributes[key];
            }
            this.OnChange.Trigger(this.Attributes, this.Previous);
            return true;
        };
        Model.prototype.Clear = /**
        * Clears the entire model.  Only the ClientID remains.
        **/
        function () {
            this.Id = undefined;
            this.Attributes = {
            };
            this.Previous = {
            };
            this.Collection = undefined;
            this.OnChange.Clear();
            this.OnFetch.Clear();
            this.OnSave.Clear();
            this.OnDestroyed.Clear();
            this.OnValidateError.Clear();
        };
        Model.prototype.Keys = /**
        * Gets an array of all the attribute's keys.
        * @return Attribute key array.
        **/
        function () {
            return Backbone._(this.Attributes).keys();
        };
        Model.prototype.Values = /**
        * Gets an array of all the attribute's values.
        * @return Attribute value array.
        **/
        function () {
            var values = [];
            for(var key in this.Attributes) {
                values.push(this.Attributes[key].Value);
            }
            return values;
        };
        Model.prototype.Fetch = /**
        * Sends a fetch command to the server for this model.
        * By default uses HTTP 'GET'.  Can be overriden through the
        * jQuery Ajax settings.
        * @settings jQuery Ajax settings to use.
        * @return jQuery Ajax XHR result.
        **/
        function (settings) {
            var _this = this;
            settings = settings ? Backbone._.clone(settings) : {
            };
            var success = settings.success;
            settings.success = function (data, status, jqxhr) {
                if(!_this.Set(_this.Parse(data, jqxhr))) {
                    return false;
                }
                _this.OnFetch.Trigger(_this.Attributes);
                // Call user's jquery success callback if it exists.
                if(success) {
                    success(_this, status, jqxhr);
                }
                return true;
            };
            return (this.Sync || Backbone.Sync).call(this, Backbone.MethodType.READ, this, settings);
        };
        Model.prototype.Save = /**
        * Sends a save command to the server for this model.
        * By default uses HTTP 'POST' or 'PUT'.  Uses 'POST' if the model
        * is new and 'PUT' if the model has already been created.
        * @settings jQuery Ajax settings to use.
        * @return jQuery Ajax XHR result.
        **/
        function (settings) {
            var _this = this;
            settings = settings ? Backbone._.clone(settings) : {
            };
            var success = settings.success;
            settings.success = function (data, status, jqxhr) {
                var serverAttributes = _this.Parse(data, jqxhr);
                if(!_this.Set(serverAttributes)) {
                    return false;
                }
                _this.OnSave.Trigger(_this.Attributes);
                // Call user's jquery success callback if it exists.
                if(success) {
                    success(_this, status, jqxhr);
                }
                return true;
            };
            var method = this.IsNew() ? Backbone.MethodType.CREATE : Backbone.MethodType.UPDATE;
            return (this.Sync || Backbone.Sync).call(this, method, this, settings);
        };
        Model.prototype.Destroy = /**
        * Sends a destroy command to the server for this model.
        * By default uses HTTP 'DELETE', can override through the
        * jQuery Ajax settings.
        * @settings jQuery Ajax settings to use.
        * @wait Wait for the server to respond before triggering OnDestroyed events.
        * @return jQuery Ajax XHR result.
        **/
        function (settings, wait) {
            if (typeof wait === "undefined") { wait = false; }
            var _this = this;
            settings = settings ? Backbone._.clone(settings) : {
            };
            // Nothing to do, destroy callback immediatly and exit.
            if(this.IsNew()) {
                this.OnDestroyed.Trigger(settings);
                return null;
            }
            var success = settings.success;
            settings.success = function (data, status, jqxhr) {
                // Server has responded so trigger the destroy callback.
                if(wait) {
                    _this.OnDestroyed.Trigger(settings);
                }
                // Call user's jquery success callback if it exists.
                if(success) {
                    success(data, status, jqxhr);
                }
                return true;
            };
            if(!wait) {
                // Destroy on client immediatly if not waiting for server response.
                this.OnDestroyed.Trigger(settings);
            }
            return (this.Sync || Backbone.Sync).call(this, Backbone.MethodType.DELETE, this, settings);
        };
        Model.prototype.UrlRoot = /**
        * Sets the URL root for this model.
        * @urlRoot The new URL root for this model.
        **/
        function (urlRoot) {
            this._urlRoot = urlRoot;
        };
        Model.prototype.Url = /**
        * Determines the model's fetch/save/destroy URL.
        * If the model is new then the URL is only the model's URL root.
        * @return Model's fetch/save/destroy URL, or URL root if new.
        **/
        function () {
            var base = this._urlRoot || this.Collection.Url() || "/";
            if(this.IsNew) {
                return base;
            }
            return base + (base.charAt(base.length - 1) == "/" ? "" : "/") + encodeURIComponent(this.Id);
        };
        Model.prototype.Parse = /**
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
        function (data, jqxhr) {
            // Extract the ID if it is present in the data by default.
            if(!Backbone._.isUndefined(data[this.IdAttribute])) {
                this.Id = data[this.IdAttribute];
            }
            // Convert to IAttributeBag.
            var attributes = {
            };
            for(var key in data) {
                if(key === this.IdAttribute) {
                    continue;
                }
                attributes[key] = new Backbone.Attribute(key, data[key]);
            }
            return attributes;
        };
        Model.prototype.Clone = /**
        * Creates a clone of this model.
        * All model fields except for `Attributes` and `UrlRoot` are reset.
        * For example this means all events are removed on a clone.
        * @return Cloned model.
        **/
        function () {
            return new Model(this.Attributes, this._urlRoot);
        };
        Model.prototype.IsNew = /**
        * Determines if the model is new.  Simply checks to see if the model has had an ID assigned yet.
        * @return True if the model does not have an assigned ID, otherwise false.
        **/
        function () {
            return this.Id === undefined || this.Id === null;
        };
        Model.prototype.IsValid = /**
        * Validates the model's current `Attributes`.
        * @return True if the model's `Attributes` are valid, otherwise false.
        **/
        function () {
            return !this._validate(this.Attributes);
        };
        Model.prototype.Validate = /**
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
        function (attributes, failed) {
            return true;
        };
        Model.prototype._validate = /**
        * Pre-fills any internal `Validate` call with all current existing
        * attributes on the model.  This makes it easier so that the validate
        * function can work with its own set of attributes intead of checking
        * back into the current set on the model.
        * @attributes The set of attributes to validate for this model type.
        * @return False if the `attributes are valid, otherwise true.
        **/
        function (attributes) {
            attributes = Backbone._.extend({
            }, this.Attributes, attributes);
            var failed = {
            };
            if(this.Validate(attributes, failed)) {
                return true;
            }
            this.OnValidateError.Trigger(attributes, failed);
            return false;
        };
        return Model;
    })();
    Backbone.Model = Model;    
})(Backbone || (Backbone = {}));
var Backbone;
(function (Backbone) {
    var Collection = (function () {
        function Collection() { }
        Collection.prototype.Url = function () {
            return "";
        };
        return Collection;
    })();
    Backbone.Collection = Collection;    
})(Backbone || (Backbone = {}));
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
/// <reference path="../lib/underscore-1.4.d.ts" />
/// <reference path="../lib/jQuery-1.8.d.ts" />
/// <reference path="Attribute.ts" />
/// <reference path="Event.ts" />
/// <reference path="View.ts" />
/// <reference path="Model.ts" />
/// <reference path="Collection.ts" />
var Backbone;
(function (Backbone) {
    /**
    * Backbone.ts version.
    **/
    Backbone.Version = "0.3.0";
    /**
    * Handle to jQuery.
    **/
    Backbone.$ = jQuery;
    /**
    * Handle to underscore.
    **/
    Backbone._ = (window)._;
    /**
    * Map from CRUD to HTTP for our default `Backbone.sync` implementation.
    **/
    Backbone.MethodType = {
        CREATE: 'POST',
        UPDATE: 'PUT',
        DELETE: 'DELETE',
        READ: 'GET'
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
    function Sync(method, model, settings) {
        settings || (settings = {
        });
        // Default JSON-request options.
        var params = {
            type: method,
            dataType: 'json',
            url: model.Url()
        };
        // Ensure that we have the appropriate request data.
        if(model && (method === Backbone.MethodType.CREATE || method === Backbone.MethodType.UPDATE)) {
            params.contentType = 'application/json';
            params.data = JSON.stringify(model.ToJSON());
        }
        // Don't process data on a non-GET request.
        if(params.type !== 'GET') {
            params.processData = false;
        }
        // Make the request, allowing the user to override any Ajax options.
        return Backbone.$.ajax(Backbone._.extend(params, settings));
    }
    Backbone.Sync = Sync;
    ;
})(Backbone || (Backbone = {}));
