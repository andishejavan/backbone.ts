var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var Backbone;
(function (Backbone) {
    Backbone.Version = "0.1";
    Backbone.root = window;
    Backbone.$ = jQuery;
    Backbone._ = underscore;
    var EventCallbacks = (function () {
        function EventCallbacks(event, fns) {
            this.event = event;
            this.fns = (fns || new Function[0]());
        }
        EventCallbacks.prototype.add = function (fn) {
            if(this.fns.indexOf(fn) !== -1) {
                return false;
            }
            this.fns.push(fn);
            return true;
        };
        EventCallbacks.prototype.remove = function (fn) {
            var index = this.fns.indexOf(fn);
            if(index == -1) {
                return false;
            }
            this.fns.splice(index, 1);
            return true;
        };
        EventCallbacks.prototype.trigger = function (context) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            for(var i = 0; i < this.fns.length; i++) {
                this.fns[i].apply(context, args);
            }
        };
        EventCallbacks.prototype.clear = function () {
            this.fns = Function[0];
        };
        return EventCallbacks;
    })();    
    var Events = (function () {
        function Events() {
        }
        Events.prototype.on = function (event, fn) {
            if(this.eventCallbacks[event] === undefined) {
                this.eventCallbacks[event] = new EventCallbacks(event);
            }
            this.eventCallbacks[event].add(fn);
        };
        Events.prototype.off = function (event, fn) {
            if(!(this.eventCallbacks[event] === undefined)) {
                if(fn === undefined) {
                    this.eventCallbacks[event].clear();
                    delete this.eventCallbacks[event];
                } else {
                    this.eventCallbacks[event].remove(fn);
                }
            }
        };
        Events.prototype.trigger = function (event) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            if(!(this.eventCallbacks[event] === undefined)) {
                this.eventCallbacks[event].trigger(args);
            }
        };
        Events.prototype.clear = function () {
            for(var event in this.eventCallbacks) {
                this.eventCallbacks[event].clear();
                delete this.eventCallbacks[event];
            }
        };
        return Events;
    })();
    Backbone.Events = Events;    
    var Event = (function () {
        function Event(fn, event, selector) {
            if (typeof selector === "undefined") { selector = undefined; }
            this.fn = fn;
            this.event = event;
            this.selector = selector;
        }
        return Event;
    })();
    Backbone.Event = Event;    
    var View = (function (_super) {
        __extends(View, _super);
        function View(el, events) {
            if (typeof events === "undefined") { events = new Array(); }
                _super.call(this);
            this.cid = Backbone._.uniqueId('view_');
            this.events = {
            };
            for(var i = 0; i < events.length; i++) {
                this.events[events[i].event] = events[i];
            }
            this.setElement(el, true);
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
            if(this.$el) {
                this.undelegateEvents();
            }
            this.$el = Backbone.$(el);
            this.el = this.$el[0];
            if(delegate !== false) {
                this.delegateEvents();
            }
            return this;
        };
        View.prototype.delegateEvents = function () {
            if(Backbone._.isEmpty(this.events)) {
                return;
            }
            this.undelegateEvents();
            for(var key in this.events) {
                Backbone._.bind(this.events[key].fn, this);
                var eventName = this.events[key].event + '.delegateEvents' + this.cid;
                if(this.events[key].selector === undefined) {
                    this.$el.on(eventName, this.events[key].fn);
                } else {
                    this.$el.delegate(this.events[key].selector, eventName, this.events[key].fn);
                }
            }
        };
        View.prototype.undelegateEvents = function () {
            this.$el.off('.delegateEvents' + this.cid);
        };
        return View;
    })(Events);
    Backbone.View = View;    
})(Backbone || (Backbone = {}));

