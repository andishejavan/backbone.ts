var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var Foo = (function (_super) {
    __extends(Foo, _super);
    function Foo() {
        _super.call(this, document.createElement('div'));
    }
    Foo.prototype.render = function () {
        return this;
    };
    return Foo;
})(Backbone.View);
