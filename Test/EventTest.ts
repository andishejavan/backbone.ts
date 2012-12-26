/// <reference path="../Event.ts" />

// message interface
interface IMsgEvent extends Backbone.IEvent {

	Add(fn: (message: string) => void ): void;
	Remove(fn: (message: string) => void ): bool;
	Trigger(message: string): void;

	// no reason to include Clear(): void since its signature does not change
}


class MessageHandler {

	private msg: string = "hello there!";

	public msgEvent: IMsgEvent = new Backbone.Event();

	public changeMsg(msg: string): void {

		// update with the new msg
		this.msg = msg;

		// trigger with new msg.
		this.msgEvent.Trigger(this.msg);
	}

}

function callback(msg: string): void {
	alert("new message: " + msg);
}

var handler = new MessageHandler();
// add the event callback
handler.msgEvent.Add(callback);
// trigger the event
handler.changeMsg("im the new message and discovered through a typed event!");

// remove the event callback
handler.msgEvent.Remove(callback);
handler.changeMsg("no callbacks so this won't be seen.");
