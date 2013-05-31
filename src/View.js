var Backbone;
(function (Backbone) {
    var View = (function () {
        function View(settings) {
            this.Data = undefined;
            var options = Backbone._.extend({
            }, settings, View._defaults);
            if(Backbone._.isNull(options.id) || Backbone._.isUndefined(options.id)) {
                throw new Error("View 'id' cannot be null or undefined.");
            }
            if(Backbone._.isNull(options.el) || Backbone._.isUndefined(options.el)) {
                throw new Error("View 'el' cannot be null or undefined.");
            }
            this.Id = options.id;
            this.ClientId = Backbone._.uniqueId('view_');
            this._domEvents = options.domEvents;
            this.SetElement(options.el, options.delegateDOMEvents);
        }
        View._defaults = {
            id: undefined,
            el: undefined,
            domEvents: [],
            delegateDOMEvents: false
        };
        View.prototype.$ = function (selector) {
            return this.$el.find(selector);
        };
        View.prototype.Render = function () {
            return this;
        };
        View.prototype.Remove = function () {
            this.$el.remove();
            return this;
        };
        View.prototype.Detach = function () {
            this.$el.detach();
            return this;
        };
        View.prototype.SetElement = function (el, delegate) {
            if (typeof delegate === "undefined") { delegate = true; }
            if(Backbone._.isNull(el) || Backbone._.isUndefined(el)) {
                throw new Error("View `el` cannot be null or undefined.");
            }
            if(this.$el) {
                this.UndelegateEvents();
            }
            this.$el = Backbone.$(el);
            this.El = this.$el[0];
            if(delegate) {
                this.DelegateEvents(this._domEvents);
            }
            return this;
        };
        View.prototype.DelegateEvents = function (domEvents) {
            if(domEvents.length <= 0) {
                return;
            }
            this._domEvents = Backbone._.clone(domEvents);
            this.UndelegateEvents();
            for(var key in domEvents) {
                var func = Backbone._.bind(domEvents[key].fn, this);
                var eventName = domEvents[key].event + '.delegateEvents' + this.ClientId;
                if(domEvents[key].selector === undefined) {
                    this.$el.on(eventName, func);
                } else {
                    this.$el.delegate(domEvents[key].selector, eventName, func);
                }
            }
        };
        View.prototype.UndelegateEvents = function () {
            this._domEvents = new Array();
            this.$el.off('.delegateEvents' + this.ClientId);
        };
        return View;
    })();
    Backbone.View = View;    
})(Backbone || (Backbone = {}));
//@ sourceMappingURL=View.js.map
