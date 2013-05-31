var EventTest = (function () {
    function EventTest() { }
    EventTest.RunTests = function RunTests() {
        var handler = new MessageHandler();
        handler.msgEvent.Add(callback);
        handler.changeMsg("im the new message and discovered through a typed event!");
        handler.msgEvent.Remove(callback);
        handler.changeMsg("no callbacks so this won't be seen.");
    };
    return EventTest;
})();
var MessageHandler = (function () {
    function MessageHandler() {
        this.msg = "hello there!";
        this.msgEvent = new Backbone.Event();
    }
    MessageHandler.prototype.changeMsg = function (msg) {
        this.msg = msg;
        this.msgEvent.Trigger(this.msg);
    };
    return MessageHandler;
})();
function callback(msg) {
    alert("new message: " + msg);
}
//@ sourceMappingURL=EventTest.js.map
