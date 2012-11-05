/// <reference path="backbone-v2.ts" />

class Application {

	constructor () {

		var bars = new Bars();
		var barModel = new Bar();

		barModel.collection = bars;

		alert(barModel.url());

		var button = document.createElement("button");
		var button2 = document.createElement("button");

		$("#content").append(button, button2);

		var fooBtn = new Foo("btn1", button);
		fooBtn.render();
		var fooBtn2 = new Foo("btn2", button2);
		fooBtn2.render();

		fooBtn.on("test", Foo.prototype.onClick);
		fooBtn.on("test", Foo.prototype.onClick);
		fooBtn.on("test", Foo.prototype.onClick);
		fooBtn.on("test", Foo.prototype.mouseOver);
		fooBtn.trigger("test");

		fooBtn.off("test");
		//fooBtn.off("test", Foo.prototype.mouseOver);

		fooBtn.on("test", Foo.prototype.onClick);
		fooBtn.trigger("test");

	}

}

class Bar extends Backbone.Model {

	private _urlRoot: string = "bar";

	constructor () {
		super();
	}
}

class Bars extends Backbone.Collection {

	public url: string = "bars";

	constructor () {
		super();

	}
}

class Foo extends Backbone.View {

	public clickedCount: number = 0;

	constructor (id: string, el: HTMLElement) {
		super(
			id,
			el,
			[
				// ugh @ not being able to reference 'this'
				new Backbone.DOMEvent(Foo.prototype.onClick, "click"), 
				new Backbone.DOMEvent(Foo.prototype.mouseOver, "mouseover"), 
				new Backbone.DOMEvent(Foo.prototype.mouseOut, "mouseout")
			]);
	}
	;
	public render(): Foo {
		this.$el.html("Foo Button");

		return this;
	}

	public onClick(jq: JQueryEventObject): JQuery {
		console.log("clicked count = " + ++this.clickedCount);

		//return $(jq.srcElement);	// huh?
		return undefined;
	}

	public mouseOver(jq: JQueryEventObject): JQuery {
		console.log("mouseOver");
		return undefined;
	}

	public mouseOut(jq: JQueryEventObject): JQuery {
		console.log("mouseOut");
		return undefined;
	}
}