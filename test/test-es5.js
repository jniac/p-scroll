var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
	'use strict';

	/**
  * event.js module
  * a very permissive event module, with great options
  * second version built on WeakMap
  * inspired by jQuery (chaining, iterations), express (flexibility) etc.
  */

	var isIterable = function isIterable(obj) {
		return obj ? typeof obj[Symbol.iterator] === 'function' : false;
	};

	var whitespace = function whitespace(obj) {
		return typeof obj === 'string' && /\s/.test(obj);
	};

	var weakmap = new WeakMap();

	function createListenersArray(target) {

		var listeners = [];

		weakmap.set(target, listeners);

		return listeners;
	}

	function deleteListenersArray(target) {

		weakmap.delete(target);
	}

	function _getAllListeners(target) {
		var createMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;


		return weakmap.get(target) || (createMode ? createListenersArray(target) : null);
	}

	function getListenersMatching(target, type) {
		var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
		var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;


		var listeners = weakmap.get(target);

		if (!listeners) return [];

		var result = [];

		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = listeners[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var listener = _step.value;

				if (listener.match(type, callback, options)) result.push(listener);
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		return result;
	}

	function _addEventListener(target, type, callback) {
		var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;


		if (!callback) {

			console.log('event.js: addEventListener callback is null! (ignored)');
			return;
		}

		if (isIterable(target)) {
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {

				for (var _iterator2 = target[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var element = _step2.value;

					_addEventListener(element, type, callback, options);
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			return target;
		}

		if (whitespace(type)) {
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {

				for (var _iterator3 = type.split(/\s/)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var sub = _step3.value;

					_addEventListener(target, sub, callback, options);
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}

			return target;
		}

		var listener = new Listener(_getAllListeners(target, true), type, callback, options);

		return target;
	}

	function _once(target, type, callback) {
		var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};


		options.max = 1;

		return _addEventListener(target, type, callback, options);
	}

	function _removeEventListener(target, type) {
		var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
		var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};


		if (isIterable(target)) {
			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {

				for (var _iterator4 = target[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var element = _step4.value;

					_removeEventListener(element, type, callback);
				}
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4.return) {
						_iterator4.return();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
					}
				}
			}

			return target;
		}

		if (whitespace(type)) {
			var _iteratorNormalCompletion5 = true;
			var _didIteratorError5 = false;
			var _iteratorError5 = undefined;

			try {

				for (var _iterator5 = type.split(/\s/)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
					var sub = _step5.value;

					_removeEventListener(target, type, callback);
				}
			} catch (err) {
				_didIteratorError5 = true;
				_iteratorError5 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion5 && _iterator5.return) {
						_iterator5.return();
					}
				} finally {
					if (_didIteratorError5) {
						throw _iteratorError5;
					}
				}
			}

			return target;
		}

		var _iteratorNormalCompletion6 = true;
		var _didIteratorError6 = false;
		var _iteratorError6 = undefined;

		try {
			for (var _iterator6 = getListenersMatching(target, type, callback, options)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
				var listener = _step6.value;

				listener.kill();
			}
		} catch (err) {
			_didIteratorError6 = true;
			_iteratorError6 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion6 && _iterator6.return) {
					_iterator6.return();
				}
			} finally {
				if (_didIteratorError6) {
					throw _iteratorError6;
				}
			}
		}

		return target;
	}

	function _clearEventListener(target) {

		var listeners = weakmap.get(target);

		if (!listeners) return target;

		while (listeners.length) {
			listeners.pop().kill();
		}deleteListenersArray(target);

		return target;
	}

	function _dispatchEvent(target, event) {
		var eventOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;


		if (!target || !event) return target;

		if (isIterable(target)) {
			var _iteratorNormalCompletion7 = true;
			var _didIteratorError7 = false;
			var _iteratorError7 = undefined;

			try {

				for (var _iterator7 = target[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
					var element = _step7.value;

					_dispatchEvent(element, event, eventOptions);
				}
			} catch (err) {
				_didIteratorError7 = true;
				_iteratorError7 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion7 && _iterator7.return) {
						_iterator7.return();
					}
				} finally {
					if (_didIteratorError7) {
						throw _iteratorError7;
					}
				}
			}

			return target;
		}

		// fast skip test (x20 speed on target with no listeners: 0.0030ms to 0.00015ms)
		if (!weakmap.has(target) && !event.propagateTo && (!eventOptions || !eventOptions.propagateTo)) return target;

		if (typeof event === 'string') {

			if (whitespace(event)) {
				var _iteratorNormalCompletion8 = true;
				var _didIteratorError8 = false;
				var _iteratorError8 = undefined;

				try {

					for (var _iterator8 = event.split(/\s/)[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
						var sub = _step8.value;

						_dispatchEvent(target, sub, eventOptions);
					}
				} catch (err) {
					_didIteratorError8 = true;
					_iteratorError8 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion8 && _iterator8.return) {
							_iterator8.return();
						}
					} finally {
						if (_didIteratorError8) {
							throw _iteratorError8;
						}
					}
				}

				return target;
			}

			return _dispatchEvent(target, new Event(target, event, eventOptions));
		}

		event.currentTarget = target;

		var listeners = getListenersMatching(target, event.type).sort(function (A, B) {
			return B.priority - A.priority;
		});

		var _iteratorNormalCompletion9 = true;
		var _didIteratorError9 = false;
		var _iteratorError9 = undefined;

		try {
			for (var _iterator9 = listeners[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
				var listener = _step9.value;


				listener.call(event);

				if (event.canceled) break;
			}
		} catch (err) {
			_didIteratorError9 = true;
			_iteratorError9 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion9 && _iterator9.return) {
					_iterator9.return();
				}
			} finally {
				if (_didIteratorError9) {
					throw _iteratorError9;
				}
			}
		}

		if (event.propagateTo) _dispatchEvent(event.propagateTo(event.currentTarget), event);

		return target;
	}

	var EventOptions = {

		cancelable: true,
		priority: 0,
		propagateTo: null

	};

	var Event = function () {
		function Event(target, type, options) {
			_classCallCheck(this, Event);

			options = Object.assign({}, EventOptions, options);

			Object.defineProperty(this, 'target', {

				value: target

			});

			Object.defineProperty(this, 'currentTarget', {

				writable: true,
				value: target

			});

			Object.defineProperty(this, 'type', { value: type });

			for (var k in options) {

				Object.defineProperty(this, k, {

					enumerable: k in EventOptions,
					value: options[k]

				});
			}

			Object.defineProperty(this, 'canceled', {

				writable: this.cancelable,
				value: false

			});
		}

		_createClass(Event, [{
			key: 'cancel',
			value: function cancel() {

				if (this.cancelable) this.canceled = true;
			}
		}]);

		return Event;
	}();

	var Listener = function () {
		function Listener(array, type, callback) {
			var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;

			_classCallCheck(this, Listener);

			this.count = 0;

			this.array = array;
			this.array.push(this);

			this.enabled = true;
			this.priority = 0;

			Object.assign(this, options);

			this.type = type;
			this.callback = callback;
		}

		_createClass(Listener, [{
			key: 'match',
			value: function match(str) {
				var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
				var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;


				if (options !== null && this.match(str, callback)) {

					for (var k in options) {
						if (this[k] !== options[k]) return false;
					}return true;
				}

				if (callback !== null) return this.match(str) && this.callback === callback;

				if (this.type instanceof RegExp) return this.type.test(str);

				if (this.type instanceof Array) return this.type.indexOf(str) !== -1;

				if (typeof this.type === 'function') return this.type(str);

				return this.type === str;
			}
		}, {
			key: 'call',
			value: function call(event) {
				var _callback;

				(_callback = this.callback).call.apply(_callback, [this.thisArg || event.currentTarget, event].concat(_toConsumableArray(this.args || [])));

				this.count++;

				if (this.count === this.max) this.kill();
			}
		}, {
			key: 'kill',
			value: function kill() {

				var index = this.array.indexOf(this);

				this.array.splice(index, 1);

				delete this.array;
				delete this.type;
				delete this.callback;
				delete this.options;
			}
		}]);

		return Listener;
	}();

	var EventDispatcherPrototype = {
		getAllListeners: function getAllListeners() {
			var createMode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;


			return _getAllListeners(this, createMode);
		},
		clearEventListener: function clearEventListener() {

			return _clearEventListener(this);
		},
		addEventListener: function addEventListener(type, callback) {
			var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;


			return _addEventListener(this, type, callback, options);
		},
		on: function on(type, callback) {
			var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;


			return _addEventListener(this, type, callback, options);
		},
		once: function once(type, callback) {
			var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


			return _once(this, type, callback, options);
		},
		removeEventListener: function removeEventListener(type) {
			var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
			var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;


			return _removeEventListener(this, type, callback, options);
		},
		off: function off(type) {
			var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
			var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;


			return _removeEventListener(this, type, callback, options);
		},
		dispatchEvent: function dispatchEvent(event) {
			var eventOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;


			return _dispatchEvent(this, event, eventOptions);
		}
	};

	var EventDispatcher = function EventDispatcher() {
		_classCallCheck(this, EventDispatcher);
	};

	Object.assign(EventDispatcher.prototype, EventDispatcherPrototype);

	var Value = function () {
		function Value() {
			var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			_classCallCheck(this, Value);

			this.value_old = value;
			this.value = value;
		}

		_createClass(Value, [{
			key: 'reset',
			value: function reset(value) {

				this.value_old = this.value = value;
			}
		}, {
			key: 'newValue',
			value: function newValue(value) {

				this.value_old = this.value;
				this.value = value;
			}
		}, {
			key: 'newValueIncrement',
			value: function newValueIncrement(value) {

				this.value_old = this.value;
				this.value += value;
			}

			/**
    * Check if the variable's value move across a threshold
    * Return a Number (that could be used as a Boolean):
    *     -1 if the variable has dropped below the threshold
    * 	   +1 if the variable passed above the threshold
    *      0 if the variable remained below or above the threshold
    */

		}, {
			key: 'through',
			value: function through(threshold) {

				var d = this.value - threshold;
				var d_old = this.value_old - threshold;

				return d >= 0 && d_old < 0 ? 1 : d <= 0 && d_old > 0 ? -1 : 0;
			}
		}]);

		return Value;
	}();

	var Variable = function (_Value) {
		_inherits(Variable, _Value);

		function Variable() {
			var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
			var nDerivative = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
			var variableLength = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;

			_classCallCheck(this, Variable);

			var _this = _possibleConstructorReturn(this, (Variable.__proto__ || Object.getPrototypeOf(Variable)).call(this, value));

			_this.variableLength = variableLength;

			_this.index = 0;
			_this.values = [];

			_this.sum = new Value();
			_this.average = new Value();
			_this.growth = new Value();

			_this.reset(value);

			if (nDerivative) _this.derivative = new Variable(0, nDerivative - 1, variableLength);

			return _this;
		}

		_createClass(Variable, [{
			key: 'getValues',
			value: function getValues() {

				return this.values.slice(this.index).concat(this.values.slice(0, this.index));
			}
		}, {
			key: 'reset',
			value: function reset(value) {

				_get(Variable.prototype.__proto__ || Object.getPrototypeOf(Variable.prototype), 'reset', this).call(this, value);

				this.index = 0;

				this.sum.reset(value * this.variableLength);
				this.average.reset(value);
				this.growth.reset(1);

				for (var i = 0; i < this.variableLength; i++) {
					this.values[i] = value;
				}return this;
			}
		}, {
			key: 'newValue',
			value: function newValue(value) {

				_get(Variable.prototype.__proto__ || Object.getPrototypeOf(Variable.prototype), 'newValue', this).call(this, value);

				this.sum.newValueIncrement(-this.values[this.index] + this.value);
				this.average.newValue(this.sum.value / this.variableLength);
				this.growth.newValue(this.value / this.value_old);

				this.values[this.index] = value;
				this.index = (this.index + 1) % this.variableLength;

				if (this.derivative) this.derivative.newValue(this.value - this.value_old);

				return this;
			}
		}]);

		return Variable;
	}(Value);

	var Tags = function () {
		function Tags() {
			_classCallCheck(this, Tags);

			this.string = '';
		}

		_createClass(Tags, [{
			key: 'add',
			value: function add(tags) {

				var a = !this.string ? [] : this.string.split(' ');

				var _iteratorNormalCompletion10 = true;
				var _didIteratorError10 = false;
				var _iteratorError10 = undefined;

				try {
					for (var _iterator10 = tags.split(' ')[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
						var tag = _step10.value;

						if (!a.includes(tag)) a.push(tag);
					}
				} catch (err) {
					_didIteratorError10 = true;
					_iteratorError10 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion10 && _iterator10.return) {
							_iterator10.return();
						}
					} finally {
						if (_didIteratorError10) {
							throw _iteratorError10;
						}
					}
				}

				this.string = a.join(' ');

				return this;
			}
		}, {
			key: 'matches',
			value: function matches(selector) {

				var a = this.string.split(' ');

				return selector.split(' ').every(function (tag) {
					return a.includes(tag);
				});
			}
		}, {
			key: 'valueOf',
			value: function valueOf() {

				return this.string;
			}
		}]);

		return Tags;
	}();

	function triggerItem(item, type) {

		item.hasTrigger = true;

		item.dispatchEvent(type);
	}

	function updateItem(item, state, local) {
		var triggerUpdate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;


		item.hasTrigger = false;

		var state_old = item.state_old = item.state;
		item.state = state;

		item.local_old = item.local;
		item.local = local;

		if (state !== state_old) {

			if (state <= 0 && state_old > 0 || state >= 0 && state_old < 0) triggerItem(item, 'touch');

			if (state === 0 && state_old !== 0) triggerItem(item, 'enter');

			if (state !== 0 && state_old === 0) triggerItem(item, 'exit');

			if (state < 0 && state_old >= 0 || state > 0 && state_old <= 0) triggerItem(item, 'leave');
		}

		if (item.hasTrigger || triggerUpdate) item.dispatchEvent('update');
	}

	function updateStop(scroll, stop) {

		var position = scroll._position;

		var local = position - stop.position;
		var state = local < -stop.margin ? -1 : local > stop.margin ? 1 : 0;

		updateItem(stop, state, local);
	}

	function updateInterval(scroll, interval) {

		var position = scroll._position;
		var position_old = scroll._position_old;

		var min = interval.stopMin.position;
		var max = interval.stopMax.position;
		var width = max - min;

		var localRaw = (position - min) / width;
		var localRaw_old = (position_old - min) / width;
		var local = localRaw < 0 ? 0 : localRaw > 1 ? 1 : localRaw;
		var state = localRaw < -interval.margin / width ? -1 : localRaw > 1 + interval.margin / width ? 1 : 0;

		var triggerUpdate = localRaw >= 0 && localRaw <= 1 || localRaw_old >= 0 && localRaw_old <= 1;

		updateItem(interval, state, local, triggerUpdate);
	}

	var Item = function (_EventDispatcher) {
		_inherits(Item, _EventDispatcher);

		function Item() {
			_classCallCheck(this, Item);

			var _this2 = _possibleConstructorReturn(this, (Item.__proto__ || Object.getPrototypeOf(Item)).call(this));

			_this2.tags = new Tags();

			_this2.state = 1;

			_this2.hasTrigger = false;

			return _this2;
		}

		_createClass(Item, [{
			key: 'set',
			value: function set(params) {

				for (var k in params) {
					this[k] = params[k];
				}return this;
			}
		}, {
			key: 'trigger',
			value: function trigger(type) {

				this.hasTrigger = true;

				this.dispatchEvent(type);
			}
		}]);

		return Item;
	}(EventDispatcher);

	var StopType = {

		bound: 'bound',
		trigger: 'trigger'

	};

	var stopCount = 0;

	var Stop = function (_Item) {
		_inherits(Stop, _Item);

		_createClass(Stop, null, [{
			key: 'Type',
			get: function get() {
				return StopType;
			}
		}]);

		function Stop(scroll, position) {
			var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'bound';
			var margin = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : .1;
			var name = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
			var color = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
			var tags = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : '';

			_classCallCheck(this, Stop);

			var _this3 = _possibleConstructorReturn(this, (Stop.__proto__ || Object.getPrototypeOf(Stop)).call(this));

			_this3.id = 'stop-' + stopCount++;

			_this3.scroll = scroll;

			_this3.position = position;
			_this3.type = type;
			_this3.margin = margin;
			_this3.name = name || _this3.id;
			_this3.color = color;
			_this3.tags.add(tags);

			return _this3;
		}

		_createClass(Stop, [{
			key: 'remove',
			value: function remove() {

				if (!this.scroll) return this;

				var index = this.scroll.stops.indexOf(this);

				scroll.stops.splice(index, 1);

				return this;
			}
		}, {
			key: 'toInterval',
			value: function toInterval(_ref) {
				var offset = _ref.offset,
				    _ref$tags = _ref.tags,
				    tags = _ref$tags === undefined ? '' : _ref$tags,
				    _ref$stopType = _ref.stopType,
				    stopType = _ref$stopType === undefined ? undefined : _ref$stopType;


				return this.scroll.interval({ position: this.position, offset: offset, stopType: stopType, tags: tags });
			}
		}]);

		return Stop;
	}(Item);

	var intervalCount = 0;

	var Interval = function (_Item2) {
		_inherits(Interval, _Item2);

		function Interval(scroll, stopMin, stopMax) {
			var margin = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : .1;
			var name = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
			var color = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
			var tags = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : '';

			_classCallCheck(this, Interval);

			var _this4 = _possibleConstructorReturn(this, (Interval.__proto__ || Object.getPrototypeOf(Interval)).call(this));

			_this4.id = 'interval-' + intervalCount++;

			_this4.scroll = scroll;
			_this4.stopMin = stopMin;
			_this4.stopMax = stopMax;
			_this4.margin = margin * 0;
			_this4.color = color;
			_this4.name = name || _this4.id;
			_this4.tags.add(tags);

			return _this4;
		}

		_createClass(Interval, [{
			key: 'remove',
			value: function remove() {

				if (!this.scroll) return this;

				var index = this.scroll.intervals.indexOf(this);

				scroll.intervals.splice(index, 1);

				this.stopMin.remove();
				this.stopMax.remove();

				return this;
			}
		}, {
			key: 'contains',
			value: function contains(position) {

				return this.stopMin.position <= position && this.stopMax.position >= position;
			}
		}, {
			key: 'overlap',
			value: function overlap(other) {

				return !(other.stopMin.position > this.stopMax.position || other.stopMax.position < this.stopMin.position);
			}
		}, {
			key: 'toString',
			value: function toString() {

				return 'Interval[' + this.stopMin.position + ', ' + this.stopMax.position + ']';
			}
		}, {
			key: 'min',
			get: function get() {
				return this.stopMin.position;
			}
		}, {
			key: 'max',
			get: function get() {
				return this.stopMax.position;
			}
		}, {
			key: 'width',
			get: function get() {
				return this.stopMax.position - this.stopMin.position;
			}
		}]);

		return Interval;
	}(Item);

	var scrolls = [];

	var Scroll = function (_EventDispatcher2) {
		_inherits(Scroll, _EventDispatcher2);

		function Scroll() {
			var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
			    _ref2$autoStart = _ref2.autoStart,
			    autoStart = _ref2$autoStart === undefined ? true : _ref2$autoStart;

			_classCallCheck(this, Scroll);

			var _this5 = _possibleConstructorReturn(this, (Scroll.__proto__ || Object.getPrototypeOf(Scroll)).call(this));

			_this5.id = 'scroll-' + (scrolls.push(_this5) - 1);

			_this5._position = 0;
			_this5._position_new = 0;
			_this5._position_old = 0;

			_this5._velocity = 0;
			_this5._velocity_new = 0;
			_this5._velocity_old = 0;

			_this5.friction = 1e-3;

			_this5.frame = 0;

			_this5.stops = [];
			_this5.intervals = [];

			_this5.epsilon = 1e-3;

			_this5.createStop({ position: 0 });

			if (autoStart) setTimeout(function () {
				return _this5.start();
			}, 0);

			return _this5;
		}

		_createClass(Scroll, [{
			key: 'start',
			value: function start() {
				var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
				    _ref3$position = _ref3.position,
				    position = _ref3$position === undefined ? 0 : _ref3$position;

				this.started = true;

				this._position = position;
				this._position_new = position;
				this._position_old = Infinity;

				this.update({ force: true });

				this.dispatchEvent('start');
			}
		}, {
			key: 'clear',
			value: function clear() {

				this.stops = [];
				this.intervals = [];

				this.position = 0;
				this.velocity = 0;

				this.createStop({ position: 0 });

				this.dispatchEvent('clear');
			}
		}, {
			key: 'update',
			value: function update() {
				var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
				    _ref4$dt = _ref4.dt,
				    dt = _ref4$dt === undefined ? 1 / 60 : _ref4$dt,
				    _ref4$force = _ref4.force,
				    force = _ref4$force === undefined ? false : _ref4$force;

				this._position_old = this._position_new;
				this._velocity_old = this._velocity_new;

				this._velocity_new *= Math.pow(this.friction, dt);
				this._position_new += (this._velocity_new + this._velocity_old) / 2 * dt;

				if (!force && Math.abs(this._position - this._position_new) < this.epsilon) return this;

				this._position = this._position_new;
				this._velocity = this._velocity_new;

				var _iteratorNormalCompletion11 = true;
				var _didIteratorError11 = false;
				var _iteratorError11 = undefined;

				try {
					for (var _iterator11 = this.stops[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
						var stop = _step11.value;

						updateStop(scroll, stop);
					}
				} catch (err) {
					_didIteratorError11 = true;
					_iteratorError11 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion11 && _iterator11.return) {
							_iterator11.return();
						}
					} finally {
						if (_didIteratorError11) {
							throw _iteratorError11;
						}
					}
				}

				var _iteratorNormalCompletion12 = true;
				var _didIteratorError12 = false;
				var _iteratorError12 = undefined;

				try {
					for (var _iterator12 = this.intervals[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
						var interval = _step12.value;

						updateInterval(scroll, interval);
					}
				} catch (err) {
					_didIteratorError12 = true;
					_iteratorError12 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion12 && _iterator12.return) {
							_iterator12.return();
						}
					} finally {
						if (_didIteratorError12) {
							throw _iteratorError12;
						}
					}
				}

				this.dispatchEvent('update');

				this.frame++;

				return this;
			}
		}, {
			key: 'stopByIndex',
			value: function stopByIndex(index) {

				return this.stops[index < 0 ? this.stops.length + index : index];
			}
		}, {
			key: 'stopByName',
			value: function stopByName(name) {
				var _iteratorNormalCompletion13 = true;
				var _didIteratorError13 = false;
				var _iteratorError13 = undefined;

				try {

					for (var _iterator13 = this.stops[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
						var stop = _step13.value;

						if (stop.name === name) return stop;
					}
				} catch (err) {
					_didIteratorError13 = true;
					_iteratorError13 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion13 && _iterator13.return) {
							_iterator13.return();
						}
					} finally {
						if (_didIteratorError13) {
							throw _iteratorError13;
						}
					}
				}

				return null;
			}
		}, {
			key: 'getStop',
			value: function getStop(_ref5) {
				var position = _ref5.position,
				    _ref5$type = _ref5.type,
				    type = _ref5$type === undefined ? null : _ref5$type,
				    _ref5$tolerance = _ref5.tolerance,
				    tolerance = _ref5$tolerance === undefined ? 1e-9 : _ref5$tolerance;
				var _iteratorNormalCompletion14 = true;
				var _didIteratorError14 = false;
				var _iteratorError14 = undefined;

				try {

					for (var _iterator14 = this.stops[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
						var stop = _step14.value;

						if ((type === null || type === stop.type) && Math.abs(stop.position - position) < tolerance) return stop;
					}
				} catch (err) {
					_didIteratorError14 = true;
					_iteratorError14 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion14 && _iterator14.return) {
							_iterator14.return();
						}
					} finally {
						if (_didIteratorError14) {
							throw _iteratorError14;
						}
					}
				}

				return null;
			}
		}, {
			key: 'nearestStop',
			value: function nearestStop(_ref6) {
				var position = _ref6.position,
				    _ref6$type = _ref6.type,
				    type = _ref6$type === undefined ? null : _ref6$type;


				var best = {

					d: Infinity,
					stop: null

				};

				var _iteratorNormalCompletion15 = true;
				var _didIteratorError15 = false;
				var _iteratorError15 = undefined;

				try {
					for (var _iterator15 = this.stops[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
						var stop = _step15.value;


						if (type !== null && type !== stop.type) continue;

						var d = Math.abs(position - stop.position);

						if (d < best.d) {

							best.d = d;
							best.stop = stop;
						}
					}
				} catch (err) {
					_didIteratorError15 = true;
					_iteratorError15 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion15 && _iterator15.return) {
							_iterator15.return();
						}
					} finally {
						if (_didIteratorError15) {
							throw _iteratorError15;
						}
					}
				}

				return best.stop;
			}
		}, {
			key: 'createStop',
			value: function createStop(_ref7) {
				var position = _ref7.position,
				    _ref7$type = _ref7.type,
				    type = _ref7$type === undefined ? 'bound' : _ref7$type,
				    _ref7$margin = _ref7.margin,
				    margin = _ref7$margin === undefined ? .1 : _ref7$margin,
				    _ref7$name = _ref7.name,
				    name = _ref7$name === undefined ? null : _ref7$name,
				    _ref7$color = _ref7.color,
				    color = _ref7$color === undefined ? null : _ref7$color;


				var stop = new Stop(this, position, type, margin, name, color);

				var i = 0,
				    n = this.stops.length;

				for (i; i < n; i++) {
					if (this.stops[i].position > stop.position) break;
				}this.stops.splice(i, 0, stop);

				return stop;
			}
		}, {
			key: 'intervalById',
			value: function intervalById(id) {
				var _iteratorNormalCompletion16 = true;
				var _didIteratorError16 = false;
				var _iteratorError16 = undefined;

				try {

					for (var _iterator16 = this.intervals[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
						var interval = _step16.value;

						if (interval.id === id) return interval;
					}
				} catch (err) {
					_didIteratorError16 = true;
					_iteratorError16 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion16 && _iterator16.return) {
							_iterator16.return();
						}
					} finally {
						if (_didIteratorError16) {
							throw _iteratorError16;
						}
					}
				}

				return null;
			}
		}, {
			key: 'getIntervals',
			value: function getIntervals(_ref8) {
				var _ref8$position = _ref8.position,
				    position = _ref8$position === undefined ? NaN : _ref8$position,
				    _ref8$selector = _ref8.selector,
				    selector = _ref8$selector === undefined ? null : _ref8$selector;


				var a = this.intervals;

				if (!isNaN(position)) a = a.filter(function (interval) {
					return interval.contains(position);
				});

				if (selector) a = a.filter(function (interval) {
					return interval.tags.matches(selector);
				});

				return a;
			}
		}, {
			key: 'getInterval',
			value: function getInterval(args) {

				return this.getIntervals(args)[0];
			}
		}, {
			key: 'intervalByMinMax',
			value: function intervalByMinMax(min, max) {
				var tolerance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1e-9;
				var _iteratorNormalCompletion17 = true;
				var _didIteratorError17 = false;
				var _iteratorError17 = undefined;

				try {

					for (var _iterator17 = this.intervals[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
						var interval = _step17.value;

						if (Math.abs(interval.min - min) < tolerance && Math.abs(interval.max - max) < tolerance) return interval;
					}
				} catch (err) {
					_didIteratorError17 = true;
					_iteratorError17 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion17 && _iterator17.return) {
							_iterator17.return();
						}
					} finally {
						if (_didIteratorError17) {
							throw _iteratorError17;
						}
					}
				}

				return null;
			}
		}, {
			key: 'createInterval',
			value: function createInterval(_ref9) {
				var min = _ref9.min,
				    max = _ref9.max,
				    _ref9$stopType = _ref9.stopType,
				    stopType = _ref9$stopType === undefined ? 'trigger' : _ref9$stopType,
				    _ref9$margin = _ref9.margin,
				    margin = _ref9$margin === undefined ? .1 : _ref9$margin,
				    _ref9$color = _ref9.color,
				    color = _ref9$color === undefined ? null : _ref9$color,
				    _ref9$name = _ref9.name,
				    name = _ref9$name === undefined ? null : _ref9$name,
				    _ref9$tags = _ref9.tags,
				    tags = _ref9$tags === undefined ? '' : _ref9$tags;


				var stopMin = void 0,
				    stopMax = void 0;

				stopMin = this.createStop({ position: min, type: stopType });
				stopMax = this.createStop({ position: max, type: stopType });

				var interval = new Interval(this, stopMin, stopMax, margin, name, color, tags);

				this.intervals.push(interval);

				return interval;
			}
		}, {
			key: 'shoot',
			value: function shoot() {

				var prevision = this.position - this.velocity / Math.log(this.friction);

				var target = this.nearestStop({ position: prevision, type: StopType.bound });

				this.velocity = (this.position - target.position) * Math.log(this.friction);
			}

			// shorthands:

		}, {
			key: 'interval',
			value: function interval(_ref10) {
				var min = _ref10.min,
				    max = _ref10.max,
				    position = _ref10.position,
				    width = _ref10.width,
				    _ref10$offset = _ref10.offset,
				    offset = _ref10$offset === undefined ? 0 : _ref10$offset,
				    _ref10$stopType = _ref10.stopType,
				    stopType = _ref10$stopType === undefined ? 'trigger' : _ref10$stopType,
				    _ref10$color = _ref10.color,
				    color = _ref10$color === undefined ? null : _ref10$color,
				    _ref10$tags = _ref10.tags,
				    tags = _ref10$tags === undefined ? '' : _ref10$tags;


				if (!isNaN(position) && !isNaN(width)) {
					;

					min = position;
					max = position + width;
				}if (!isNaN(position) && offset > 0) {
					;

					min = position;
					max = position;
				}if (isNaN(min) || isNaN(max)) {

					console.log('p-scroll.js: Scroll().interval unable to parse min & max values:', min, max);
					return null;
				}

				min += -offset;
				max += offset;

				var interval = this.intervalByMinMax(min, max) || this.createInterval({ min: min, max: max, stopType: stopType, color: color, tags: tags });

				return interval;
			}

			/**
    * Get or create a stop
    * @param {number|string} position position
    */

		}, {
			key: 'stop',
			value: function stop(position) {
				var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : StopType.bound;


				if (typeof position === 'string' && position.slice(0, 2) === '+=') position = (this.stops.length ? this.stops[this.stops.length - 1].position : 0) + parseFloat(position.slice(2));

				var stop = this.getStop({ position: position, type: type }) || this.createStop({ position: position, type: type });

				return stop;
			}
		}, {
			key: 'trigger',
			value: function trigger(position) {

				return this.stop(position, Stop.Type.trigger);
			}
		}, {
			key: 'position',
			get: function get() {
				return this._position;
			},
			set: function set(value) {
				this._position_new = value;
			}
		}, {
			key: 'velocity',
			get: function get() {
				return this._velocity;
			},
			set: function set(value) {
				this._velocity_new = value;
			}
		}]);

		return Scroll;
	}(EventDispatcher);

	function udpateScrolls() {

		requestAnimationFrame(udpateScrolls);

		var _iteratorNormalCompletion18 = true;
		var _didIteratorError18 = false;
		var _iteratorError18 = undefined;

		try {
			for (var _iterator18 = scrolls[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
				var _scroll = _step18.value;

				if (_scroll.started) _scroll.update();
			}
		} catch (err) {
			_didIteratorError18 = true;
			_iteratorError18 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion18 && _iterator18.return) {
					_iterator18.return();
				}
			} finally {
				if (_didIteratorError18) {
					throw _iteratorError18;
				}
			}
		}
	}

	udpateScrolls();

	var wheelDiscreteInterval = 120;

	function onWheel(handler, event) {

		event.preventDefault();

		var wheelX = handler.vars.wheelX;
		var wheelY = handler.vars.wheelY;
		var wheelSpeedX = handler.vars.wheelSpeedX;
		var wheelSpeedY = handler.vars.wheelSpeedY;

		// https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode
		var unit = event.deltaMode === 0x00 ? 1 : 16;
		var dx = event.deltaX * unit;
		var dy = event.deltaY * unit;

		if (!handler.mouseWheelID) {

			wheelX.reset(dx);
			wheelY.reset(dy);

			wheelSpeedX.reset(0);
			wheelSpeedY.reset(0);

			handler.dispatchEvent('wheel-start');

			handler.mouseWheelID = setTimeout(function () {
				return mouseWheelStop(handler);
			}, wheelDiscreteInterval);
		} else {

			wheelX.newValue(dx);
			wheelY.newValue(dy);

			wheelSpeedX.newValue(wheelX.average.value);
			wheelSpeedY.newValue(wheelY.average.value);

			var through = void 0;

			if (wheelSpeedX.growth.value > 1) handler.dispatchEvent('wheel-increase-speed-x');

			if (wheelSpeedY.growth.value > 1) handler.dispatchEvent('wheel-increase-speed-y', { speed: wheelSpeedY.value });

			if (through = wheelSpeedX.growth.through(1)) handler.dispatchEvent(through === -1 ? 'wheel-max-speed-x' : 'wheel-min-speed-x');

			if (through = wheelSpeedY.growth.through(1)) handler.dispatchEvent(through === -1 ? 'wheel-max-speed-y' : 'wheel-min-speed-y');

			clearTimeout(handler.mouseWheelID);
			handler.mouseWheelID = setTimeout(function () {
				return mouseWheelStop(handler);
			}, wheelDiscreteInterval);
		}
	}

	function mouseWheelStop(handler) {

		handler.mouseWheelID = null;
		handler.dispatchEvent('wheel-stop');
	}

	var ScrollHandler = function (_EventDispatcher3) {
		_inherits(ScrollHandler, _EventDispatcher3);

		function ScrollHandler(element) {
			_classCallCheck(this, ScrollHandler);

			var _this6 = _possibleConstructorReturn(this, (ScrollHandler.__proto__ || Object.getPrototypeOf(ScrollHandler)).call(this));

			if (typeof element === 'string') element = document.querySelector(element);

			_this6.vars = {

				wheelX: new Variable(0, 0, 10),
				wheelY: new Variable(0, 0, 10),

				wheelSpeedX: new Variable(0, 2, 10),
				wheelSpeedY: new Variable(0, 2, 10)

			};

			element.addEventListener('wheel', function (event) {
				return onWheel(_this6, event);
			});

			return _this6;
		}

		return ScrollHandler;
	}(EventDispatcher);

	var svgNS = 'http://www.w3.org/2000/svg';

	function waitFor(duration) {

		return new Promise(function (resolve) {

			setTimeout(resolve, duration);
		});
	}

	function svg(node, attributes) {

		if (node === 'svg') {

			node = document.createElementNS(svgNS, 'svg');
			node.setAttributeNS(svgNS, 'width', 300);
			node.setAttributeNS(svgNS, 'height', 300);
		}

		if (typeof node === 'string') node = document.createElementNS(svgNS, node);

		if (attributes && attributes.parent) {

			attributes.parent.insertBefore(node, attributes.before);
			delete attributes.parent;
			delete attributes.before;
		}

		for (var k in attributes) {
			attributes[k] === null || attributes[k] === undefined ? node.removeAttributeNS(null, k) : node.setAttributeNS(null, k, attributes[k]);
		}return node;
	}

	function svgRetrieveAttributes(node) {

		var result = {};

		var _iteratorNormalCompletion19 = true;
		var _didIteratorError19 = false;
		var _iteratorError19 = undefined;

		try {
			for (var _iterator19 = node.getAttributeNames()[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
				var k = _step19.value;


				var value = node.getAttributeNS(null, k);

				result[k] = /\d$/.test(value) && !isNaN(value) ? parseFloat(value) : value;
			}
		} catch (err) {
			_didIteratorError19 = true;
			_iteratorError19 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion19 && _iterator19.return) {
					_iterator19.return();
				}
			} finally {
				if (_didIteratorError19) {
					throw _iteratorError19;
				}
			}
		}

		return result;
	}

	function closest(element, selector) {

		while (element instanceof Element) {

			if (element.matches(selector)) return element;

			element = element.parentNode;
		}

		return null;
	}

	var svgCSS = {

		position: 'fixed',
		top: 0,
		left: 0,
		width: '100%',
		'z-index': 100,
		'font-family': 'monospace',
		'font-size': 10

	};

	var Tooltip = function () {
		function Tooltip(scrollSVG) {
			var _this7 = this;

			_classCallCheck(this, Tooltip);

			this.scrollSVG = scrollSVG;

			this.g = svg('g', {

				parent: scrollSVG.g,
				class: 'tooltip',

				fill: 'var(--color)',
				stroke: 'none',
				visibility: 'hidden'

			});

			this.g.style.setProperty('transition', 'opacity .2s');

			this.rect = svg('rect', {

				parent: this.g,

				x: 0,
				y: 0,
				width: 160,
				height: 50,
				rx: 5,
				ry: 5

			});

			this.name = svg('text', {

				parent: this.g,

				fill: 'white',
				stroke: 'none',
				x: 80,
				y: 14,
				'text-anchor': 'middle'

			});

			this.range = svg('text', {

				parent: this.g,

				fill: 'white',
				stroke: 'none',
				x: 80,
				y: 28,
				'text-anchor': 'middle'

			});

			this.info = svg('text', {

				parent: this.g,

				fill: 'white',
				stroke: 'none',
				x: 80,
				y: 42,
				'text-anchor': 'middle'

			});

			this.scrollSVG.g.addEventListener('mouseover', function (event) {

				if (closest(event.target, 'g.tooltip')) return;

				var interval = closest(event.target, 'g.interval');

				_this7.setTarget(interval);
			});

			this.scrollSVG.svg.addEventListener('mouseleave', function (event) {
				return _this7.setTarget(null);
			});
		}

		_createClass(Tooltip, [{
			key: 'setTarget',
			value: async function setTarget(value) {

				if (this.target === value || this.isWaiting) return;

				if (this.target) {

					var _interval = this.scrollSVG.scroll.intervalById(this.target.dataset.id);

					_interval.off('update', this.intervalOnUpdate);

					this.g.style.setProperty('opacity', 0);

					this.target.style.removeProperty('stroke-width');

					this.isWaiting = true;

					await waitFor(100);

					this.isWaiting = false;
				}

				this.target = value;

				svg(this.g, { visibility: this.target ? 'visible' : 'hidden' });

				if (!this.target) return;

				var interval = this.scrollSVG.scroll.intervalById(this.target.dataset.id);

				interval.on('update', this.intervalOnUpdate, { thisArg: this });

				this.g.style.setProperty('opacity', 1);

				this.target.style.setProperty('stroke-width', 3);

				this.name.innerHTML = interval.name;
				this.range.innerHTML = interval.min.toFixed(1) + ' - ' + interval.max.toFixed(1);
				this.info.innerHTML = 'local: ' + interval.local.toFixed(2) + ', state: ' + interval.state;

				svg(this.rect, {

					fill: interval.color

				});

				var attr = svgRetrieveAttributes(this.target.querySelector('line'));

				var x = (attr.x1 + attr.x2) / 2 - 80;
				var y = (attr.y1 + attr.y2) / 2 + 8;

				svg(this.g, {

					transform: 'translate(' + x + ', ' + y + ')'

				});
			}
		}, {
			key: 'intervalOnUpdate',
			value: function intervalOnUpdate(event) {

				var interval = event.target;

				this.info.innerHTML = 'local: ' + interval.local.toFixed(2) + ', state: ' + interval.state;
			}
		}]);

		return Tooltip;
	}();

	var ScrollSVG = function () {
		function ScrollSVG(options) {
			_classCallCheck(this, ScrollSVG);

			this.options = Object.assign({

				scale: 1,
				color: 'red'

			}, options);

			this.svg = svg('svg');

			for (var k in svgCSS) {
				this.svg.style.setProperty(k, svgCSS[k]);
			}this.svg.style.setProperty('--color', this.options.color);

			this.g = svg('g', {

				parent: this.svg,

				fill: 'none',
				stroke: this.options.color,
				transform: 'translate(20, 20)'

			});

			this.tooltip = new Tooltip(this);

			if (this.options.scroll) this.init(this.options.scroll);
		}

		_createClass(ScrollSVG, [{
			key: 'init',
			value: function init(scroll) {
				var _this8 = this;

				this.scroll = scroll;

				this.scroll.on('clear', function (event) {

					while (_this8.g.firstChild) {
						_this8.g.firstChild.remove();
					}_this8.draw();
				});

				this.draw();
			}
		}, {
			key: 'draw',
			value: function draw() {
				var _this9 = this;

				var s = this.options.scale;

				this.line = svg('line', {

					parent: this.g,
					before: this.tooltip.g,

					x1: this.scroll.stopByIndex(0).position * s,
					x2: this.scroll.stopByIndex(-1).position * s,

					y1: 0,
					y2: 0

				});

				var scrollPosition = svg('line', {

					parent: this.g,
					before: this.tooltip.g,

					x1: this.scroll.position * s || 0,
					x2: this.scroll.position * s || 0,

					y1: -5,
					y2: 5,

					'stroke-width': 3

				});

				this.scroll.on('update', function (event) {

					svg(scrollPosition, {

						x1: _this9.scroll.position * s,
						x2: _this9.scroll.position * s

					});
				});

				this.stops = this.scroll.stops.map(function (stop) {

					var size = stop.type === StopType.bound ? 5 : 1.5;

					return svg('line', {

						parent: _this9.g,
						before: _this9.tooltip.g,

						stroke: stop.color,

						x1: stop.position * s,
						x2: stop.position * s,

						y1: -size,
						y2: size

					});
				});

				var indexedIntervals = [];

				this.intervals = this.scroll.intervals.map(function (interval) {

					var index = 0;

					for (var a; a = indexedIntervals[index]; index++) {

						var overlap = false;

						var _iteratorNormalCompletion20 = true;
						var _didIteratorError20 = false;
						var _iteratorError20 = undefined;

						try {
							for (var _iterator20 = a[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
								var b = _step20.value;

								overlap = overlap || b.overlap(interval);
							}
						} catch (err) {
							_didIteratorError20 = true;
							_iteratorError20 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion20 && _iterator20.return) {
									_iterator20.return();
								}
							} finally {
								if (_didIteratorError20) {
									throw _iteratorError20;
								}
							}
						}

						if (!overlap) break;
					}

					indexedIntervals[index] ? indexedIntervals[index].push(interval) : indexedIntervals[index] = [interval];

					var y = 20 + index * 12;

					var g = svg('g', {

						parent: _this9.g,
						before: _this9.tooltip.g,

						class: 'interval',
						'data-id': interval.id,

						stroke: interval.color

					});

					g.dataset.interval = interval.min + ',' + interval.max;

					var line = svg('line', {

						parent: g,

						x1: interval.min * s,
						x2: interval.max * s,

						y1: y,
						y2: y

					});

					// (interval.local || 0) : avoid initialization bug (interval.local === NaN)
					var x = interval.min + interval.width * (interval.local || 0);

					x = (x * s).toFixed(2);

					var pos = svg('line', {

						parent: g,

						x1: x,
						x2: x,

						y1: y - 5,
						y2: y + 5

					});

					var hitArea = svg('rect', {

						parent: g,

						stroke: 'none',
						fill: 'transparent',

						x: interval.min * s,
						y: y - 5,
						width: interval.width * s,
						height: 10

					});

					interval.on(/enter|exit/, function (event) {

						svg(g, { 'stroke-width': interval.state ? null : 3 });
					});

					interval.on('update', function (event) {

						var x = interval.min + interval.width * interval.local;

						x = (x * s).toFixed(2);

						svg(pos, { x1: x, x2: x });
					});

					return g;
				});

				return this;
			}
		}]);

		return ScrollSVG;
	}();

	var PScroll = Object.freeze({
		Tags: Tags,
		Stop: Stop,
		Interval: Interval,
		Scroll: Scroll,
		ScrollHandler: ScrollHandler,
		ScrollSVG: ScrollSVG
	});

	// import { Scroll, ScrollHandler, ScrollSVG } from '../build/p-scroll.module.js'


	// creating the scroll

	var scrollA = new Scroll();

	var _iteratorNormalCompletion21 = true;
	var _didIteratorError21 = false;
	var _iteratorError21 = undefined;

	try {
		for (var _iterator21 = document.querySelectorAll('.wrapper-a .block')[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
			var element = _step21.value;


			var stop = scrollA.stop('+=' + element.offsetHeight);

			element.innerHTML = stop.position;
		}
	} catch (err) {
		_didIteratorError21 = true;
		_iteratorError21 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion21 && _iterator21.return) {
				_iterator21.return();
			}
		} finally {
			if (_didIteratorError21) {
				throw _iteratorError21;
			}
		}
	}

	scrollA.on('update', function (event) {

		document.querySelector('.wrapper-a .blocks').style.setProperty('transform', 'translateY(' + (-scrollA.position).toFixed(2) + 'px)');
	});

	// display an SVG for debug

	var scrollASVG = new ScrollSVG({ scroll: scrollA, scale: .5 });
	document.body.appendChild(scrollASVG.svg);

	// use an handler to detect some fundamental events (wheel max speed)

	var scrollAHandler = new ScrollHandler('.wrapper-a');

	scrollAHandler.on('wheel-increase-speed-y', function (event) {

		scrollA.velocity = event.speed * 20;
	});

	scrollAHandler.on('wheel-max-speed-y wheel-stop', function (event) {

		scrollA.shoot();
	});

	var testA = Object.freeze({
		scrollA: scrollA,
		scrollAHandler: scrollAHandler
	});

	// import { Scroll, ScrollHandler, ScrollSVG } from '../build/p-scroll.module.js'


	// creating the scroll

	var scrollB = new Scroll();

	scrollB.friction = .000001;

	var sum = 0;

	Array.prototype.forEach.call(document.querySelectorAll('.wrapper-b .block'), function (element) {

		var height = element.offsetHeight;

		var stop = scrollB.stop(sum + height / 2);

		stop.toInterval({ offset: 20 }).on('enter', function (event) {

			element.classList.add('enter');
		}).on('exit', function (event) {

			element.classList.remove('enter');
		}).on('update', function (event) {});

		element.innerHTML = '<span>' + stop.position + '</span>';

		sum += height;
	});

	scrollB.interval({ position: 300, offset: 100, color: 'blue' }).on(/enter|exit/, function (event) {

		document.querySelector('.demo').classList.toggle('foo', event.target.state === 0);
	});

	scrollB.on('update', function (event) {

		document.querySelector('.wrapper-b .blocks').style.setProperty('transform', 'translateY(' + (-scrollB.position).toFixed(2) + 'px)');
	});

	scrollB.stop(0).set({

		type: 'trigger'

	});
	scrollB.shoot();

	// display an SVG for debug

	var scrollBSVG = new ScrollSVG({ scroll: scrollB, scale: .5 });
	scrollBSVG.svg.style.setProperty('top', '60px');
	document.body.appendChild(scrollBSVG.svg);

	// use an handler to detect some fundamental events (wheel max speed)

	var scrollBHandler = new ScrollHandler('.wrapper-b');

	scrollBHandler.on('wheel-increase-speed-y', function (event) {

		scrollB.velocity = event.speed * 20;
	});

	scrollBHandler.on('wheel-max-speed-y wheel-stop', function (event) {

		scrollB.shoot();
	});

	var testB = Object.freeze({
		scrollB: scrollB,
		scrollBHandler: scrollBHandler
	});

	// exposing the local variables globally

	Object.assign(window, testA, testB, PScroll);
})();
