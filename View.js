var Backbone;
(function (Backbone) {
    var View = (function () {
        function View(id, el, domEvents, delegateDOMEvents) {
            if (typeof domEvents === "undefined") { domEvents = new Array(); }
            if (typeof delegateDOMEvents === "undefined") { delegateDOMEvents = true; }
            this.data = undefined;
            if(Backbone._.isNull(id) || Backbone._.isUndefined(id)) {
                throw new Error("View 'id' cannot be null or undefined.");
            }
            if(Backbone._.isNull(el) || Backbone._.isUndefined(el)) {
                throw new Error("View 'el' cannot be null or undefined.");
            }
            this.id = id;
            this.cid = Backbone._.uniqueId('view_');
            this._domEvents = domEvents;
            this.setElement(el, delegateDOMEvents);
        }
        View.prototype.$ = function (selector) {
            return this.$el.find(selector);
        };
        View.prototype.render = function () {
            return this;
        };
        View.prototype.remove = function () {
            this.$el.remove();
            return this;
        };
        View.prototype.detach = function () {
            this.$el.detach();
            return this;
        };
        View.prototype.setElement = function (el, delegate) {
            if (typeof delegate === "undefined") { delegate = true; }
            if(Backbone._.isNull(el) || Backbone._.isUndefined(el)) {
                throw new Error("View `el` cannot be null or undefined.");
            }
            if(this.$el) {
                this.undelegateEvents();
            }
            this.$el = Backbone.$(el);
            this.el = this.$el[0];
            if(delegate) {
                this.delegateEvents(this._domEvents);
            }
            return this;
        };
        View.prototype.delegateEvents = function (domEvents) {
            if(domEvents.length <= 0) {
                return;
            }
            this._domEvents = Backbone._.clone(domEvents);
            this.undelegateEvents();
            for(var key in domEvents) {
                var func = Backbone._.bind(domEvents[key].fn, this);
                var eventName = domEvents[key].event + '.delegateEvents' + this.cid;
                if(domEvents[key].selector === undefined) {
                    this.$el.on(eventName, func);
                } else {
                    this.$el.delegate(domEvents[key].selector, eventName, func);
                }
            }
        };
        View.prototype.undelegateEvents = function () {
            this._domEvents = new Array();
            this.$el.off('.delegateEvents' + this.cid);
        };
        return View;
    })();
    Backbone.View = View;    
})(Backbone || (Backbone = {}));
//@ sourceMappingURL=View.js.map
