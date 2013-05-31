var Backbone;
(function (Backbone) {
    Backbone.Version = "0.3";
    Backbone.$ = jQuery;
    Backbone._ = (window)._;
    Backbone.MethodType = {
        CREATE: 'POST',
        UPDATE: 'PUT',
        DELETE: 'DELETE',
        READ: 'GET'
    };
    function Sync(method, model, settings) {
        settings || (settings = {
        });
        var params = {
            type: method,
            dataType: 'json',
            url: model.Url()
        };
        if(model && (method === Backbone.MethodType.CREATE || method === Backbone.MethodType.UPDATE)) {
            params.contentType = 'application/json';
            params.data = JSON.stringify(model.ToJSON());
        }
        if(params.type !== 'GET') {
            params.processData = false;
        }
        return Backbone.$.ajax(Backbone._.extend(params, settings));
    }
    Backbone.Sync = Sync;
    ;
})(Backbone || (Backbone = {}));
//@ sourceMappingURL=Backbone.js.map
