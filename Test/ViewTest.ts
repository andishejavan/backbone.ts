/// <reference path="../Backbone.ts" />

class ViewTest {

	public static RunTests() {

		var clickMe = new ClickMe("clickMe", $("#content"));
		clickMe.Render();
		clickMe.Render();
	}

}


class ClickMe extends Backbone.View {

	public clickedCount: number = 0;

	public $parent: JQuery;

	constructor(id: string, $parent: JQuery) {
		super({
			id: id,
			el: $("<button>").get(),
			domEvents: [
				new Backbone.DOMEvent(ClickMe.prototype.onClick, "click"), 
				new Backbone.DOMEvent(ClickMe.prototype.mouseOver, "mouseover"), 
				new Backbone.DOMEvent(ClickMe.prototype.mouseOut, "mouseout")
			]});

		this.$parent = $parent;
		
	}

	public Render(): ClickMe {
		console.log("rendering " + this.Id);

		this.$parent.append(this.$el);
		this.$el.html("Click Me!");
		this.$el.show();
		return this;
	}

	public onClick(jq: JQueryEventObject): JQuery {
		console.log("clicked count = " + ++this.clickedCount);
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
