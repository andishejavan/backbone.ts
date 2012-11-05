var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var Application = (function () {
    function Application() {
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
        fooBtn.on("test", Foo.prototype.onClick);
        fooBtn.trigger("test");
    }
    return Application;
})();
var Bar = (function (_super) {
    __extends(Bar, _super);
    function Bar() {
        _super.call(this);
        this._urlRoot = "bar";
    }
    return Bar;
})(Backbone.Model);
var Bars = (function (_super) {
    __extends(Bars, _super);
    function Bars() {
        _super.call(this);
        this.url = "bars";
    }
    return Bars;
})(Backbone.Collection);
var Foo = (function (_super) {
    __extends(Foo, _super);
    function Foo(id, el) {
        _super.call(this, id, el, undefined, [
    new Backbone.DomEvent(Foo.prototype.onClick, "click"), 
    new Backbone.DomEvent(Foo.prototype.mouseOver, "mouseover"), 
    new Backbone.DomEvent(Foo.prototype.mouseOut, "mouseout")
]);
        this.clickedCount = 0;
    }
    Foo.prototype.render = function () {
        this.$el.html("Foo Button");
        return this;
    };
    Foo.prototype.onClick = function (jq) {
        console.log("clicked count = " + ++this.clickedCount);
        return undefined;
    };
    Foo.prototype.mouseOver = function (jq) {
        console.log("mouseOver");
        return undefined;
    };
    Foo.prototype.mouseOut = function (jq) {
        console.log("mouseOut");
        return undefined;
    };
    return Foo;
})(Backbone.View);
