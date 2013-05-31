/// <reference path="Backbone.ts" />


module Backbone {

	export interface IOnChangeEvent extends IEvent {
		Add(fn: (attributes: IAttributeBag, previous: IAttributeBag) => void ): void;
		Remove(fn: (attributes: IAttributeBag, previous: IAttributeBag) => void ): bool;
		Trigger(attributes: IAttributeBag, previous: IAttributeBag): void;
	}

	export interface IOnRemoveEvent extends IEvent {
		Add(fn: (attributes: IAttributeBag, removed: IAttributeBag) => void ): void;
		Remove(fn: (attributes: IAttributeBag, removed: IAttributeBag) => void ): bool;
		Trigger(attributes: IAttributeBag, removed: IAttributeBag): void;
	}

	export interface IOnFetchEvent extends IEvent {
		Add(fn: (attributes: IAttributeBag) => void ): void;
		Remove(fn: (attributes: IAttributeBag) => void ): bool;
		Trigger(attributes: IAttributeBag): void;
	}

	export interface IOnSaveEvent extends IEvent {
		Add(fn: (attributes: IAttributeBag) => void ): void;
		Remove(fn: (attributes: IAttributeBag) => void ): bool;
		Trigger(attributes: IAttributeBag): void;
	}

	export interface IOnDestroyedEvent extends IEvent {
		Add(fn: (settings: JQueryAjaxSettings) => void ): void;
		Remove(fn: (settings: JQueryAjaxSettings) => void ): bool;
		Trigger(settings: JQueryAjaxSettings): void;
	}

	export interface IOnValidateErrorEvent extends IEvent {
		Add(fn: (attributes: IAttributeBag, failed: IAttributeBag) => void ): void;
		Remove(fn: (attributes: IAttributeBag, failed: IAttributeBag) => void ): bool;
		Trigger(attributes: IAttributeBag, failed: IAttributeBag): void;
	}

	/**
	* Create a new model, with defined attributes.  A client id (`cid`)
	* is automatically generated and assigned for you.
	**/
	export class Model {

		/**
		* Model's ID.
		**/
		public Id: string = undefined;

		/**
		* The default name for the JSON `id` attribute is "id".
		* Set this to the JSON `id` attribute value that should be used.
		**/
		public IdAttribute: string = "id";

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
		public Sync = Backbone.Sync;

		/**
		* The model's collection if it is a part of one.
		* If the model is not a part of a collection this is undefined.
		**/
		public Collection: Collection = undefined;

		/**
		* The model's URL root when fetching/saving/destroying.
		**/
		private _urlRoot: string;

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
		constructor(
			attributes: IAttributeBag = {},
			urlRoot?: string = undefined) {

			this.OnChange = new Event(this);
			this.OnFetch = new Event(this);
			this.OnSave = new Event(this);
			this.OnDestroyed = new Event(this);
			this.OnValidateError = new Event(this);

			this.ClientId = Backbone._.uniqueId('model_');
			this.Attributes = attributes;
			this._urlRoot = urlRoot;
		}

		/**
		* Converts this model's attributes into JSON format.
		* By default this is a simple conversion from IAttributeBag to JSON
		* data.  Override this function for more complex implementations.
		* By default the `ID` attribute with the key `IDAttribute` is
		* injected into the resulting JSON conversion.
		* @return This model's attributes and ID converted to JSON format.
		*         Note you will still need to use JSON.stringify().
		**/
		public ToJSON(): any {
			var json = {};
			// Inject the ID attribute.
			if (!Backbone._.isUndefined(this.Id) || !Backbone._.isNull(this.Id)) {
				json[this.IdAttribute] = this.Id;
			}

			for (var key in this.Attributes) {
				json[key] = this.Attributes[key]
			}

			return json;
		}

		/**
		* Determines if the attribute exists on this model.
		* @key The attribute's key to check for.
		* @return True if the attribute exists on this model, otherwise false.
		**/
		public Has(key: string): bool {
			return this.Attributes[key] !== null;
		}

		/**
		* Retreives an attribute by key.
		* @key The attribute's key.
		* @return The attribute or undefined if it does not exist.
		**/
		public Get(key: string): IAttribute {
			return this.Attributes[key];
		}

		/**
		* Adds or sets  a set of attributes on this model if validation is successful.
		* @attributes Attributes to add/set on this model.
		* @return True if the attributes were successfully set, otherwise false.
		**/
		public Set(attributes: IAttributeBag): bool {
			if (!this._validate(attributes)) {
				return false;
			}

			for (var key in attributes) {
				this.Previous[key] = this.Attributes[key];
				this.Attributes[key] = attributes[key];
			}

			this.OnChange.Trigger(this.Attributes, this.Previous);

			return true;
		}

		/**
		* Removes a set of attributes from the model if validation is successful.
		* @attributes Attributes to delete/remove from this model.
		* @return True if the attributes were successfully removed, otherwise false.
		**/
		public Remove(attributes: IAttributeBag): bool {
			
			for (var key in attributes) {
				attributes[key].Value = undefined;
			}

			if (!this._validate(attributes)) {
				return false;
			}

			for (var key in attributes) {
				this.Previous = this.Attributes[key];
				delete this.Attributes[key];
			}

			this.OnChange.Trigger(this.Attributes, this.Previous);

			return true;
		}

		/**
		* Clears the entire model.  Only the ClientID remains.
		**/
		public Clear() {
			this.Id = undefined;
			this.Attributes = {};
			this.Previous = {};
			this.Collection = undefined;
			this.OnChange.Clear();
			this.OnFetch.Clear();
			this.OnSave.Clear();
			this.OnDestroyed.Clear();
			this.OnValidateError.Clear();
		}

		/**
		* Gets an array of all the attribute's keys.
		* @return Attribute key array.
		**/
		public Keys(): string[] {
			return _(this.Attributes).keys();
		}

		/**
		* Gets an array of all the attribute's values.
		* @return Attribute value array.
		**/
		public Values(): any[] {
			var values = [];
			for (var key in this.Attributes) {
				values.push(this.Attributes[key].Value);
			}
			return values;
		}

		/**
		* Sends a fetch command to the server for this model.
		* By default uses HTTP 'GET'.  Can be overriden through the
		* jQuery Ajax settings.
		* @settings jQuery Ajax settings to use.
		* @return jQuery Ajax XHR result.
		**/
		public Fetch(settings?: JQueryAjaxSettings): JQueryXHR {
			settings = settings ? Backbone._.clone(settings) : {};
			var success = settings.success;

			settings.success = (data: any, status: string, jqxhr: JQueryXHR): bool => {
				if (!this.Set(this.Parse(data, jqxhr))) {
					return false;
				}

				this.OnFetch.Trigger(this.Attributes);

				// Call user's jquery success callback if it exists.
				if (success) {
					success(this, status, jqxhr);
				}
				return true;
			}

			return (this.Sync || Backbone.Sync).call(
				this,
				Backbone.MethodType.READ,
				this,
				settings);
		}

		/**
		* Sends a save command to the server for this model.
		* By default uses HTTP 'POST' or 'PUT'.  Uses 'POST' if the model
		* is new and 'PUT' if the model has already been created.
		* @settings jQuery Ajax settings to use.
		* @return jQuery Ajax XHR result.
		**/
		public Save(settings?: JQueryAjaxSettings): JQueryXHR {
			settings = settings ? _.clone(settings) : {};

			var success = settings.success;
			settings.success = (data: any, status: string, jqxhr: JQueryXHR): bool => {
				var serverAttributes = this.Parse(data, jqxhr);

				if (!this.Set(serverAttributes)) {
					return false;
				}

				this.OnSave.Trigger(this.Attributes);

				// Call user's jquery success callback if it exists.
				if (success) {
					success(this, status, jqxhr);
				}

				return true;
			}

			var method = this.IsNew() ? 
				Backbone.MethodType.CREATE :
				Backbone.MethodType.UPDATE;

			return (this.Sync || Backbone.Sync).call(
				this,
				method,
				this,
				settings);
		}

		/**
		* Sends a destroy command to the server for this model.
		* By default uses HTTP 'DELETE', can override through the
		* jQuery Ajax settings.
		* @settings jQuery Ajax settings to use.
		* @wait Wait for the server to respond before triggering OnDestroyed events.
		* @return jQuery Ajax XHR result.
		**/
		public Destroy(settings?: JQueryAjaxSettings, wait?: bool = false): JQueryXHR {
			settings = settings ? _.clone(settings) : {};

			// Nothing to do, destroy callback immediatly and exit.
			if (this.IsNew()) {
				this.OnDestroyed.Trigger(settings);
				return null;
			}

			var success = settings.success;
			settings.success = (data: any, status: string, jqxhr: JQueryXHR): bool => {
				// Server has responded so trigger the destroy callback.
				if (wait) {
					this.OnDestroyed.Trigger(settings);
				}

				// Call user's jquery success callback if it exists.
				if (success) {
					success(data, status, jqxhr);
				}
				return true;
			}

			if (!wait) {
				// Destroy on client immediatly if not waiting for server response.
				this.OnDestroyed.Trigger(settings);
			}
			return (this.Sync || Backbone.Sync).call(
				this,
				Backbone.MethodType.DELETE,
				this,
				settings);
		}

		/**
		* Sets the URL root for this model.
		* @urlRoot The new URL root for this model.
		**/
		public UrlRoot(urlRoot: string): void {
			this._urlRoot = urlRoot;
		}

		/**
		* Determines the model's fetch/save/destroy URL.
		* If the model is new then the URL is only the model's URL root.
		* @return Model's fetch/save/destroy URL, or URL root if new.
		**/
		public Url(): string {
			var base = this._urlRoot || this.Collection.Url() || "/";
			if (this.IsNew) {
				return base;
			}
			return base + (base.charAt(base.length - 1) == "/" ? "" : "/") + encodeURIComponent(this.Id);

		}

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
		public Parse(data: any, jqxhr: JQueryXHR): IAttributeBag {
			// Extract the ID if it is present in the data by default.
			if (!Backbone._.isUndefined(data[this.IdAttribute])) {
				this.Id = data[this.IdAttribute]
			}

			// Convert to IAttributeBag.
			var attributes: IAttributeBag = {};
			for (var key in data) {
				if (key === this.IdAttribute) {
					continue;
				}
				attributes[key] = new Attribute(key, data[key]);
			}

			return attributes;
		}

		/**
		* Creates a clone of this model.
		* All model fields except for `Attributes` and `UrlRoot` are reset.
		* For example this means all events are removed on a clone.
		* @return Cloned model.
		**/
		public Clone(): Model {
			return new Model(this.Attributes, this._urlRoot);
		}

		/**
		* Determines if the model is new.  Simply checks to see if the model has had an ID assigned yet.
		* @return True if the model does not have an assigned ID, otherwise false.
		**/
		public IsNew(): bool {
			return this.Id === undefined || this.Id === null;
		}

		/**
		* Validates the model's current `Attributes`.
		* @return True if the model's `Attributes` are valid, otherwise false.
		**/
		public IsValid(): bool {
			return !this._validate(this.Attributes);
		}

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
		public Validate(attributes: IAttributeBag, failed: IAttributeBag): bool {
			return true;
		}

		/**
		* Pre-fills any internal `Validate` call with all current existing
		* attributes on the model.  This makes it easier so that the validate
		* function can work with its own set of attributes intead of checking
		* back into the current set on the model.
		* @attributes The set of attributes to validate for this model type.
		* @return False if the `attributes are valid, otherwise true.
		**/
		private _validate(attributes: IAttributeBag): bool {
			attributes = _.extend({}, this.Attributes, attributes);
			var failed = {};
			if (this.Validate(attributes, failed)) {
				return true;
			}
			
			this.OnValidateError.Trigger(attributes, failed);
			return false;
		}
	}
}
