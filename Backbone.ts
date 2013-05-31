//     Backbone.ts 0.3
//     (c) 2012 Josh Baldwin
//     Backbone.ts may be freely distributed under the MIT license.
//     For all details and documentation:
//     https://github.com/jbaldwin/backbone.ts

/// <reference path="lib/underscore-1.4.d.ts" />
/// <reference path="lib/jQuery-1.8.d.ts" />

/// <reference path="Attribute.ts" />
/// <reference path="Event.ts" />
/// <reference path="View.ts" />
/// <reference path="Model.ts" />
/// <reference path="Collection.ts" />

module Backbone {

	/**
	* Backbone.ts version.
	**/
	export var Version = "0.3.0";

	/**
	* Handle to jQuery.
	**/
	export var $: JQueryStatic = jQuery;

	/**
	* Handle to underscore.
	**/
	export var _: Underscore = (<any>window)._;

	/**
	* Map from CRUD to HTTP for our default `Backbone.sync` implementation.
	**/
	export var MethodType = {
		CREATE: 'POST',
		UPDATE: 'PUT',
		DELETE: 'DELETE',
		READ:   'GET'
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
	export function Sync(method: string, model: Model, settings?: JQueryAjaxSettings): JQueryXHR {

		settings || (settings = {});

		// Default JSON-request options.
		var params: JQueryAjaxSettings = { 
			type: method, 
			dataType: 'json', 
			url: model.Url(),
		};

		// Ensure that we have the appropriate request data.
		if (model && (method === MethodType.CREATE || method === MethodType.UPDATE)) {
			params.contentType = 'application/json';
			params.data = JSON.stringify(model.ToJSON());
		}

		// Don't process data on a non-GET request.
		if (params.type !== 'GET') {
			params.processData = false;
		}

		// Make the request, allowing the user to override any Ajax options.
		return $.ajax(_.extend(params, settings));
	};
}
