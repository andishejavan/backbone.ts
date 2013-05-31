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
