var Backbone;
(function (Backbone) {
    var Event = (function () {
        function Event(context) {
            if (typeof context === "undefined") { context = {
            }; }
            this._fns = new Array();
            this._context = context;
        }
        Event.prototype.Add = function (fn) {
            this._fns.push(fn);
        };
        Event.prototype.Remove = function (fn) {
            for(var i = 0; i < this._fns.length; i++) {
                if(this._fns[i] === fn) {
                    this._fns.splice(i, 1);
                    return true;
                }
            }
            return false;
        };
        Event.prototype.Clear = function () {
            this._fns = [];
        };
        Event.prototype.Trigger = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            var fns = this._fns.slice(0);
            for(var i = 0; i < fns.length; i++) {
                fns[i].apply(this._context, args || []);
            }
        };
        return Event;
    })();
    Backbone.Event = Event;    
})(Backbone || (Backbone = {}));
//@ sourceMappingURL=Event.js.map
