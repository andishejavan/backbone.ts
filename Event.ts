

module Backbone {

	
	/**
	* IEvent, extend your own version of this interface to give typed
	* data to the function callbacks and trigger arguments.
	*
	* @example
	*
	*	A basic message event with strongly typed arguments:
	*
	*	export interface IMessageEvent extends IEvent {
	*		Add(fn: (message: string) => void): void;
	*		Remove(fn: (message: string) => void): bool;
	*		Clear(): void;
	*		Trigger(message: string): void;
	*	}
	*
	*	Instantiate with 'Event' and cast to your interface type.
	*
	*	var event: IMessageEvent = new Event(context);
	**/
	export interface IEvent {

		/**
		* Add a new function listener to the event.
		* @fn Function callback listener to add.
		**/
		Add(fn: () => void): void;

		/**
		* Remove a function listener from the event.
		* @fn Function callback listener to remove.
		* @return True if 'fn' was removed from this event, otherwise false.
		**/
		Remove(fn: () => void): bool;

		/**
		* Removes all function listeners from the event.
		**/
		Clear(): void;

		/**
		* Trigger all function listeners of this event in the order
		* they were added.
		* @args Arguments to pass to each function listener when called.
		**/
		Trigger(...args: any[]): void;
	}


	/**
	* Generic implementation of IEvent.
	* All extensions of IEvent can use this concrete implementation
	* for the behavior, the function signatures in user defined
	* Add(), Remove(), Trigger() will all pass the arguments through
	* correctly.
	*
	* This class can also be extended to add custom data, however the
	* base Add(), Remove() and Trigger() functions typically can be
	* left alone unless you require a custom implementation or different
	* behavior on how trigger works.
	**/
	export class Event implements IEvent {

		/**
		* Context when calling events.  By default if no context
		* is provided then an empty object is used.
		**/
		private _context: {};

		/**
		* List of callback listener functions.
		* Callbacks are called in the order they are added.
		**/
		private _fns: Function[] = new Function[];

		/**
		* Creates a new typed event.  Extend or implement a typed
		* version of IEvent to fill out the fn: Function's.
		* This base Event class will call any implementation of
		* IEvent regardless of the types defined for the function
		* callbacks.
		* @context Context when calling each function callback, default = {}.
		**/
		constructor(context?: any = {}) {
			this._context = context;
		}

		/**
		* Adds a callback function to this event.
		* Duplicates are allowed and not checked for.
		* @fn Callback function to call when this event is triggered.
		**/
		public Add(fn: Function): void {
			this._fns.push(fn);
		}

		/**
		* Removes a callback function from this event.
		* @fn Remove this callback function from this event.
		* @return True if 'fn' was removed, false if 'fn' was not removed.
		**/
		public Remove(fn: Function): bool {
			for (var i = 0; i < this._fns.length; i++) {
				if (this._fns[i] === fn) {
					this._fns.splice(i, 1);
					return true;
				}
			}
			return false;
		}

		/**
		* Removes all callback functions from this event.
		**/
		public Clear(): void {
			this._fns = [];
		}

		/**
		* Triggers all callback functions linked to this event with
		* the supplied argument list.
		* @args User supplied arguments to all callback functions.
		**/
		public Trigger(...args: any[]): void {
			var fns = this._fns.slice(0);
			for (var i = 0; i < fns.length; i++) {
				fns[i].apply(this._context, args || []);
			}
		}
	}
}