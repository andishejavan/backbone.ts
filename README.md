backbone.ts
===========

Full backbone.js port to typescript, this is not just a definitions file for backbone.d.js.

v0.3
====

Re-working the repository after much learned on the box2dweb.d.ts project.  There will be a backbone.min.ts provided so that multiple files do not have to be linked against for production.

Re-working events to be completely typed.  DOM events will remain as is.  This also means that moving forward the main classes like Model, View, Collection will no longer inherit from the Event class.  Rather they will expose events directly.  The user will need to extend the classes and add their specifiec events directly.  This has the advantage of removing the discoverability issue of events.

```javascript

// Backbone IEvent declaration
interface IEvent {
  Add(fn: () => void): void;
  Remove(fn: () => void): void;
  Trigger(...args: any[]): void;
}

// Generic Backbone IEvent implementation
// This can be used for any typings
class Event implements IEvent {
  
}

// User defined interface to make IEvent have true typing
interface IMessageEvent extends IEvent {
    Add(fn: (msg: string) => void): void;
    Remove(fn: (msg: string) => void): void;
    Trigger(msg: string): void;
}

// However the intstance can still be just the base Backbone.Event class
var messageEvent: IMessageEvent = new Backbone.Event();

```


v0.2
====

Expirmental, more direct typing.  Removing the readme from this section since it is quite large and outdated.

v0.1 -> Also backbone.ts 0.9.2
=============================

Direct port, tagged as v0.1

