var Backbone;
(function (Backbone) {
    var Model = (function () {
        function Model(attributes, urlRoot) {
            if (typeof attributes === "undefined") { attributes = {
            }; }
            if (typeof urlRoot === "undefined") { urlRoot = undefined; }
            this.Id = undefined;
            this.IdAttribute = "id";
            this.Sync = Backbone.Sync;
            this.Collection = undefined;
            this.OnChange = new Backbone.Event(this);
            this.OnFetch = new Backbone.Event(this);
            this.OnSave = new Backbone.Event(this);
            this.OnDestroyed = new Backbone.Event(this);
            this.OnValidateError = new Backbone.Event(this);
            this.ClientId = Backbone._.uniqueId('model_');
            this.Attributes = attributes;
            this._urlRoot = urlRoot;
        }
        Model.prototype.ToJSON = function () {
            var json = {
            };
            if(!Backbone._.isUndefined(this.Id) || !Backbone._.isNull(this.Id)) {
                json[this.IdAttribute] = this.Id;
            }
            for(var key in this.Attributes) {
                json[key] = this.Attributes[key];
            }
            return json;
        };
        Model.prototype.Has = function (key) {
            return this.Attributes[key] !== null;
        };
        Model.prototype.Get = function (key) {
            return this.Attributes[key];
        };
        Model.prototype.Set = function (attributes) {
            if(!this._validate(attributes)) {
                return false;
            }
            for(var key in attributes) {
                this.Previous[key] = this.Attributes[key];
                this.Attributes[key] = attributes[key];
            }
            this.OnChange.Trigger(this.Attributes, this.Previous);
            return true;
        };
        Model.prototype.Remove = function (attributes) {
            for(var key in attributes) {
                attributes[key].Value = undefined;
            }
            if(!this._validate(attributes)) {
                return false;
            }
            for(var key in attributes) {
                this.Previous = this.Attributes[key];
                delete this.Attributes[key];
            }
            this.OnChange.Trigger(this.Attributes, this.Previous);
            return true;
        };
        Model.prototype.Clear = function () {
            this.Id = undefined;
            this.Attributes = {
            };
            this.Previous = {
            };
            this.Collection = undefined;
            this.OnChange.Clear();
            this.OnFetch.Clear();
            this.OnSave.Clear();
            this.OnDestroyed.Clear();
            this.OnValidateError.Clear();
        };
        Model.prototype.Keys = function () {
            return Backbone._(this.Attributes).keys();
        };
        Model.prototype.Values = function () {
            var values = [];
            for(var key in this.Attributes) {
                values.push(this.Attributes[key].Value);
            }
            return values;
        };
        Model.prototype.Fetch = function (settings) {
            var _this = this;
            settings = settings ? Backbone._.clone(settings) : {
            };
            var success = settings.success;
            settings.success = function (data, status, jqxhr) {
                if(!_this.Set(_this.Parse(data, jqxhr))) {
                    return false;
                }
                _this.OnFetch.Trigger(_this.Attributes);
                if(success) {
                    success(_this, status, jqxhr);
                }
                return true;
            };
            return (this.Sync || Backbone.Sync).call(this, Backbone.MethodType.READ, this, settings);
        };
        Model.prototype.Save = function (settings) {
            var _this = this;
            settings = settings ? Backbone._.clone(settings) : {
            };
            var success = settings.success;
            settings.success = function (data, status, jqxhr) {
                var serverAttributes = _this.Parse(data, jqxhr);
                if(!_this.Set(serverAttributes)) {
                    return false;
                }
                _this.OnSave.Trigger(_this.Attributes);
                if(success) {
                    success(_this, status, jqxhr);
                }
                return true;
            };
            var method = this.IsNew() ? Backbone.MethodType.CREATE : Backbone.MethodType.UPDATE;
            return (this.Sync || Backbone.Sync).call(this, method, this, settings);
        };
        Model.prototype.Destroy = function (settings, wait) {
            if (typeof wait === "undefined") { wait = false; }
            var _this = this;
            settings = settings ? Backbone._.clone(settings) : {
            };
            if(this.IsNew()) {
                this.OnDestroyed.Trigger(settings);
                return null;
            }
            var success = settings.success;
            settings.success = function (data, status, jqxhr) {
                if(wait) {
                    _this.OnDestroyed.Trigger(settings);
                }
                if(success) {
                    success(data, status, jqxhr);
                }
                return true;
            };
            if(!wait) {
                this.OnDestroyed.Trigger(settings);
            }
            return (this.Sync || Backbone.Sync).call(this, Backbone.MethodType.DELETE, this, settings);
        };
        Model.prototype.UrlRoot = function (urlRoot) {
            this._urlRoot = urlRoot;
        };
        Model.prototype.Url = function () {
            var base = this._urlRoot || this.Collection.Url() || "/";
            if(this.IsNew) {
                return base;
            }
            return base + (base.charAt(base.length - 1) == "/" ? "" : "/") + encodeURIComponent(this.Id);
        };
        Model.prototype.Parse = function (data, jqxhr) {
            if(!Backbone._.isUndefined(data[this.IdAttribute])) {
                this.Id = data[this.IdAttribute];
            }
            var attributes = {
            };
            for(var key in data) {
                if(key === this.IdAttribute) {
                    continue;
                }
                attributes[key] = new Backbone.Attribute(key, data[key]);
            }
            return attributes;
        };
        Model.prototype.Clone = function () {
            return new Model(this.Attributes, this._urlRoot);
        };
        Model.prototype.IsNew = function () {
            return this.Id === undefined || this.Id === null;
        };
        Model.prototype.IsValid = function () {
            return !this._validate(this.Attributes);
        };
        Model.prototype.Validate = function (attributes, failed) {
            return true;
        };
        Model.prototype._validate = function (attributes) {
            attributes = Backbone._.extend({
            }, this.Attributes, attributes);
            var failed = {
            };
            if(this.Validate(attributes, failed)) {
                return true;
            }
            this.OnValidateError.Trigger(attributes, failed);
            return false;
        };
        return Model;
    })();
    Backbone.Model = Model;    
})(Backbone || (Backbone = {}));
//@ sourceMappingURL=Model.js.map
