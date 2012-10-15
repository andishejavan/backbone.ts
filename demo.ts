/// <reference path="backbone-v2.ts" />

class Foo extends Backbone.View {

	constructor () {
		super(document.createElement('div'));
	}

	public render(): Foo {
		return this;
	}
}