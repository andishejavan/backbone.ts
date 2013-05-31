/// <reference path="Backbone.ts" />

module Backbone {

	/**
	* Interface that contains a bag of attributes key by each attribute's key.
	**/
	export interface IAttributeBag {
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
	export interface IAttribute {
		
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
	export class Attribute implements IAttribute {

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
		constructor(key: string, value: any) {
			this.Key = key;
			this.Value = value;
		}
	}
}
