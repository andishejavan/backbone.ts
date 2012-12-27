/// <reference path="lib/underscore-1.4.d.ts" />
/// <reference path="lib/jQuery-1.8.d.ts" />

/// <reference path="Event.ts" />
/// <reference path="View.ts" />
/// <reference path="Model.ts" />
/// <reference path="Collection.ts" />

module Backbone {

	export var Version = "0.3";

	export var $: JQueryStatic = jQuery;

	export var _: Underscore = (<any>window)._;
}
