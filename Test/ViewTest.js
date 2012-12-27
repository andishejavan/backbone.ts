var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ViewTest = (function () {
    function ViewTest() { }
    ViewTest.RunTests = function RunTests() {
        var clickMe = new ClickMe("clickMe", $("#content"));
        clickMe.render();
        clickMe.render();
    }
    return ViewTest;
})();
var ClickMe = (function (_super) {
    __extends(ClickMe, _super);
    function ClickMe(id, $parent) {
        _super.call(this, id, $("<button>").get(), [
    new Backbone.DOMEvent(ClickMe.prototype.onClick, "click"), 
    new Backbone.DOMEvent(ClickMe.prototype.mouseOver, "mouseover"), 
    new Backbone.DOMEvent(ClickMe.prototype.mouseOut, "mouseout")
]);
        this.clickedCount = 0;
        this.$parent = $parent;
    }
    ClickMe.prototype.render = function () {
        console.log("rendering " + this.id);
        this.$parent.append(this.$el);
        this.$el.html("Click Me!");
        this.$el.show();
        return this;
    };
    ClickMe.prototype.onClick = function (jq) {
        console.log("clicked count = " + ++this.clickedCount);
        return undefined;
    };
    ClickMe.prototype.mouseOver = function (jq) {
        console.log("mouseOver");
        return undefined;
    };
    ClickMe.prototype.mouseOut = function (jq) {
        console.log("mouseOut");
        return undefined;
    };
    return ClickMe;
})(Backbone.View);
//@ sourceMappingURL=ViewTest.js.map
