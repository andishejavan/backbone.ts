backbone.ts
===========

Full backbone.js port to typescript, this is not just a definitions file for backbone.d.js.

Inspired to learn more in-depth on how backbone.js works and at the same time the new typescript language.

## backbone.ts 0.9.2 release

### Class based inheritence

backbone.ts offers the following interfaces and classes to extend directly within your typescript code.

#### Backbone.IEventHandler

Using as an argument for an arbitrary type that implements the IEventHandler:
<pre><code>
function foo(handler: IEventHandler, condition: any): void {
  if(conditon === something) 
    handler.trigger('my-event');
}
</code></pre>

Implementing the IEventHandler Example: <br />
Note that Backbone.Events implemenation provides the default
backbone.js implementation for you already.
<pre><code>
class Foo implements IEventHandler {

  public on(events: string, callback: (...args: any[]) => any, context?: any) {
    ...
  }

  public off(events?: string, callback?: (...args: any[]) => any, context?: any) {
    ...
  }

  public trigger(events: string, ...args: any[])) {
    ...
  }
}
</code></pre>

#### Backbone.Events

Provides the ported backbone.js IEventHandler implementation.  All other Backbone.ts classes inherit from the Events class.
<pre><code>
  on()
  off()
  trigger()
  
  bind()    // for legacy
  unbind()  // for legacy
</code></pre>


#### Backbone.Model

<pre><code>
class MyModel extends Model {

  // todo: add explicit options for constructor

  // override the validate function
  // implementation from backbone.js documentation:
  public validate(attributes: any, options?: any): any {
    if (attrs.end  attrs.start) {
      return "can't end before it starts";
    }
  }
}
</code></pre>

#### Backbone.Collection

<pre><code>
class MyCollection extends Collection {

  // todo: add explicit options for constructor

  // there are no functions to override
}
</code></pre>

#### Backbone.View

<pre><code>
class MyView extends View {

  // todo: add explicit options for constructor

  // backbone.js documentation:
  // **render** is the core function that your view should override, in order
  // to populate its element (`this.el`), with the appropriate HTML. The
  // convention is for **render** to always return `this`.
  public render(): View {
    return this;
  }
}
</code></pre>

#### Backbone.Router

<pre><code>
// todo: add explicit options for constructor

var router = new Backbone.Router(options);
</code></pre>

#### Backbone.History

There is also a Backbone.history: History object that is automatically instantiated when History.route(args) is invoked.  This is invoked when a Router class is instantiated.

<pre><code>
// todo: add explicit options for constructor

var history = new Backbone.History(options);
</code></pre>