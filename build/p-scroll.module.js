/**
 * event.js module
 * a very permissive event module, with great options
 * second version built on WeakMap
 * inspired by jQuery (chaining, iterations), express (flexibility) etc.
 */

const isIterable = obj => obj ? (typeof obj[Symbol.iterator] === 'function') : false;

const whitespace = obj => typeof obj === 'string' && /\s/.test(obj);

let weakmap = new WeakMap();



function createListenersArray(target) {

	let listeners = [];

	weakmap.set(target, listeners);

	return listeners

}

function deleteListenersArray(target) {

	weakmap.delete(target);

	

}

function getAllListeners(target, createMode = false) {

	return weakmap.get(target) || (createMode ? createListenersArray(target) : null)

}

function getListenersMatching(target, type, callback = null, options = null) {

	let listeners = weakmap.get(target);

	if (!listeners)
		return []

	let result = [];

	for (let listener of listeners)
		if (listener.match(type, callback, options))
			result.push(listener);

	return result

}

function addEventListener(target, type, callback, options = undefined) {

	if (!callback) {

		console.log('event.js: addEventListener callback is null! (ignored)');
		return

	}

	if (isIterable(target)) {

		for (let element of target)
			addEventListener(element, type, callback, options);

		return target

	}

	if (whitespace(type)) {

		for (let sub of type.split(/\s/))
			addEventListener(target, sub, callback, options);

		return target

	}

	let listener = new Listener(getAllListeners(target, true), type, callback, options);

	return target

}

function once(target, type, callback, options = { }) {

	options.max = 1;

	return addEventListener(target, type, callback, options)

}

function removeEventListener(target, type, callback = null, options = { }) {

	if (isIterable(target)) {

		for (let element of target)
			removeEventListener(element, type, callback);

		return target

	}

	if (whitespace(type)) {

		for (let sub of type.split(/\s/))
			removeEventListener(target, type, callback);

		return target

	}

	for (let listener of getListenersMatching(target, type, callback, options))
		listener.kill();

	return target

}

function clearEventListener(target) {

	let listeners = weakmap.get(target);

	if (!listeners)
		return target

	while(listeners.length)
		listeners.pop().kill();

	deleteListenersArray(target);

	return target

}

function dispatchEvent(target, event, eventOptions = null) {

	if (!target)
		return null

	if (isIterable(target)) {

		for (let element of target)
			dispatchEvent(element, event, eventOptions);

		return target

	}

	if (typeof event === 'string') {

		if (whitespace(event)) {

			for (let sub of event.split(/\s/))
				dispatchEvent(target, sub, eventOptions);

			return target

		}

		return dispatchEvent(target, new Event(target, event, eventOptions))

	}



	event.currentTarget = target;

	let listeners = getListenersMatching(target, event.type).sort((A, B) => B.priority - A.priority);

	for (let listener of listeners) {

		listener.call(event);

		if (event.canceled)
			break

	}

	if (event.propagateTo)
		dispatchEvent(event.propagateTo(event.currentTarget), event);

	return target

}









const EventOptions = {

	cancelable: true,
	priority: 0,
	propagateTo: null,

};

class Event {

	constructor(target, type, options) {

		options = Object.assign({}, EventOptions, options);

		Object.defineProperty(this, 'target', { 

			value: target,

		});

		Object.defineProperty(this, 'currentTarget', { 

			writable: true,
			value: target,

		});

		Object.defineProperty(this, 'type', { value: type });

		for (let k in options) {

			Object.defineProperty(this, k, { 
				
				enumerable: k in EventOptions,
				value: options[k],

			});

		}

		Object.defineProperty(this, 'canceled', {

			writable: this.cancelable,
			value: false,

		});

	}

	cancel() {

		if (this.cancelable)
			this.canceled = true;

	}

}





class Listener {

	constructor(array, type, callback, options = undefined) {

		this.count = 0;

		this.array = array;
		this.array.push(this);

		this.enabled = true;
		this.priority = 0;

		Object.assign(this, options);

		this.type = type;
		this.callback = callback;

	}

	match(str, callback = null, options = null) {

		if (options !== null && this.match(str, callback)) {

			for (let k in options)
				if (this[k] !== options[k])
					return false

			return true

		}

		if (callback !== null)
			return this.match(str) && this.callback === callback

		if (this.type instanceof RegExp)
			return this.type.test(str)

		if (this.type instanceof Array)
			return this.type.indexOf(str) !== -1

		if (typeof this.type === 'function')
			return this.type(str)

		return this.type === str

	}

	call(event) {

		this.callback.call(this.thisArg || event.currentTarget, event, ...(this.args || []));

		this.count++;

		if (this.count === this.max)
			this.kill();

	}

	kill() {

		let index = this.array.indexOf(this);

		this.array.splice(index, 1);

		delete this.array;
		delete this.type;
		delete this.callback;
		delete this.options;

	}

}







let EventDispatcherPrototype = {

	getAllListeners(createMode = false) {

		return getAllListeners(this, createMode)

	},

	clearEventListener() {

		return clearEventListener(this)

	},
	
	addEventListener(type, callback, options = undefined) { 

		return addEventListener(this, type, callback, options) 

	},

	on(type, callback, options = undefined) { 

		return addEventListener(this, type, callback, options) 

	},

	once(type, callback, options = { }) { 

		return once(this, type, callback, options) 

	},

	removeEventListener(type, callback = undefined, options = undefined) { 

		return removeEventListener(this, type, callback, options) 

	},

	off(type, callback = undefined, options = undefined) { 

		return removeEventListener(this, type, callback, options) 

	},

	dispatchEvent(event, eventOptions = null) { 

		return dispatchEvent(this, event, eventOptions) 

	},

};







class EventDispatcher { }

Object.assign(EventDispatcher.prototype, EventDispatcherPrototype);

class Value {

	constructor(value = 0) {

		this.value_old = value;
		this.value = value;

	}

	reset(value) {

		this.value_old = 
		this.value = value;

	}

	newValue(value) {

		this.value_old = this.value;
		this.value = value;

	}

	newValueIncrement(value) {

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
	through(threshold) {

		let d = this.value - threshold;
		let d_old = this.value_old - threshold;

		return d >= 0 && d_old < 0 ? 1 : d <= 0 && d_old > 0 ? -1 : 0

	}

}

class Variable extends Value {

	constructor(value = 0, nDerivative = 1, variableLength = 10) {

		super(value);

		this.variableLength = variableLength;

		this.index = 0;
		this.values = [];

		this.sum = new Value();
		this.average = new Value();
		this.growth = new Value();

		this.reset(value);

		if (nDerivative)
			this.derivative = new Variable(0, nDerivative - 1, variableLength);

	}

	getValues() {

		return this.values.slice(this.index).concat(this.values.slice(0, this.index))

	}

	reset(value) {

		super.reset(value);

		this.index = 0;

		this.sum.reset(value * this.variableLength);
		this.average.reset(value);
		this.growth.reset(1);

		for (let i = 0; i < this.variableLength; i++)
			this.values[i] = value;

		return this

	}

	newValue(value) {

		super.newValue(value);

		this.sum.newValueIncrement(-this.values[this.index] + this.value);
		this.average.newValue(this.sum.value / this.variableLength);
		this.growth.newValue(this.value / this.value_old);

		this.values[this.index] = value;
		this.index = (this.index + 1) % this.variableLength;

		if (this.derivative)
			this.derivative.newValue(this.value - this.value_old);

		return this

	}

}

class ScrollItem extends EventDispatcher {

	trigger(type) {

		this.dispatchEvent(type);

	}

	update(state, local) {

		let state_old = this.state_old = this.state;
		this.state = state;

		this.local_old = this.local;
		this.local = local;

		if (state !== state_old) {

			if (state === 0 && state_old !== 0)
				this.trigger('enter');

			if (state !== 0 && state_old === 0)
				this.trigger('exit');

			if (state !== 0 && state_old !== 0) {

				this.trigger('touch');
				this.trigger('leave');

			}

		}

	}

}

const StopType = {

	bound: 'bound',
	trigger: 'trigger',

};

let stopCount = 0;

class Stop extends ScrollItem {

	static get Type() { return StopType }

	constructor(scroll, position, type = 'bound', margin, name, color = 'red') {

		super();

		this.scroll = scroll;

		this.position = position;
		this.type = type;
		this.margin = margin;
		this.name = name || 'stop-' + stopCount;

		stopCount++;

		this.update();

	}

	set(params) {

		for (let k in params)
			this[k] = params[k];

		return this

	}

	update() {

		let position = this.scroll.position;

		let local = position - this.position;
		let state = local < -this.margin ? -1 : local > this.margin ? 1 : 0;

		super.update(state, local);

	}

	remove() {

		if (!this.scroll)
			return this

		let index = this.scroll.stops.indexOf(this);

		scroll.stops.splice(index, 1);

		return this

	}

	toInterval({ offset, type = undefined }) {

		return this.scroll.interval({ position: this.position, offset, type })

	}

}









class Interval extends ScrollItem {

	constructor(scroll, stopMin, stopMax, color) {

		super();

		this.scroll = scroll;
		this.stopMin = stopMin;
		this.stopMax = stopMax;
		this.color = color;

		this.update();

	}

	update() {

		let position = this.scroll.position;

		let local = (position - this.stopMin.position) / (this.stopMax.position - this.stopMin.position);
		let state = local < 0 ? -1 : local > 1 ? 1 : 0;
		
		local = local < 0 ? 0 : local > 1 ? 1 : local;

		super.update(state, local);

		if ((this.local >= 0 && this.local <= 1) || this.local_old >= 0 && this.local_old <= 1)
			this.dispatchEvent('update');

	}

	remove() {

		if (!this.scroll)
			return this

		let index = this.scroll.intervals.indexOf(this);

		scroll.intervals.splice(index, 1);

		this.stopMin.remove();
		this.stopMax.remove();

		return this

	}

	overlap(other) {

		return !(other.stopMin.position > this.stopMax.position || other.stopMax.position < this.stopMin.position)

	}

	toString() {

		return `Interval[${this.stopMin.position}, ${this.stopMax.position}]`

	}

}







let scrolls = [];

class Scroll extends EventDispatcher {

	constructor() {

		super();

		this.id = 'scroll-' + (scrolls.push(this) - 1);

		this._position = 0;
		this._position_new = 0;
		this._position_old = 0;

		this._velocity = 0;
		this._velocity_new = 0;
		this._velocity_old = 0;

		this.friction = 1e-3;

		this.stops = [];
		this.intervals = [];

		this.epsilon = 1e-3;

		this.createStop({ position: 0 });

	}

	get position() { return this._position }
	set position(value) { this._position_new = value; }

	get velocity() { return this._velocity }
	set velocity(value) { this._velocity_new = value; }

	update(dt = 1 / 60) {

		this._position_old = this._position_new;
		this._velocity_old = this._velocity_new;

		this._velocity_new *= Math.pow(this.friction, dt);
		this._position_new += (this._velocity_new + this._velocity_old) / 2 * dt;

		if (Math.abs(this._position - this._position_new) < this.epsilon)
			return this

		this._position = this._position_new;
		this._velocity = this._velocity_new;

		for (let stop of this.stops)
			stop.update();

		for (let interval of this.intervals)
			interval.update();

		this.dispatchEvent('update');

		return this

	}

	stopByIndex(index) {

		return this.stops[index < 0 ? this.stops.length + index : index]

	}

	stopByName(name) {

		for (let stop of this.stops)
			if (stop.name === name)
				return stop

		return null

	}

	getStop({ position, type = null, tolerance = 1e-9 }) {

		for (let stop of this.stops)
			if ((type === null || type === stop.type) && Math.abs(stop.position - position) < tolerance)
				return stop

		return null

	}

	nearestStop({ position, type = null }) {

		let best = {

			d: Infinity,
			stop: null,

		};

		for (let stop of this.stops) {

			if (type !== null && type !== stop.type)
				continue

			let d = Math.abs(position - stop.position);

			if (d < best.d) {

				best.d = d;
				best.stop = stop;

			}

		}

		return best.stop

	}

	createStop({ position, type = 'bound', margin = .1, name = null, color = 'red' }) {

		let stop = new Stop(this, position, type, margin, name, color);

		let i = 0, n = this.stops.length;

		for (i; i < n; i++)
			if (this.stops[i].position > stop.position)
				break

		this.stops.splice(i, 0, stop);

		return stop

	}

	getInterval({ min, max, tolerance = 1e-9 }) {

		for (let interval of this.intervals)
			if (Math.abs(interval.stopMin.position - min) < tolerance && Math.abs(interval.stopMax.position - max) < tolerance)
				return interval

		return null

	}

	createInterval({ min, max, stopType = 'trigger', color = 'red' }) {

		let stopMin, stopMax;

		stopMin = this.createStop({ position: min, type: stopType });
		stopMax = this.createStop({ position: max, type: stopType });

		let interval = new Interval(this, stopMin, stopMax, color);

		this.intervals.push(interval);

		return interval

	}





	shoot() {

		let prevision = this.position - this.velocity / Math.log(this.friction);

		let target = this.nearestStop({ position: prevision, type: StopType.bound });

		this.velocity = (this.position - target.position) * Math.log(this.friction);

	}



	// shorthands:

	interval({ min, max, position, width, offset = 0, stopType = 'trigger', color = 'red' }) {

		if (!isNaN(position) && !isNaN(width))
			[min, max] = [position, position + width];

		if (!isNaN(position) && offset > 0)
			[min, max] = [position, position];

		if (isNaN(min) || isNaN(max)) {

			console.log('p-scroll.js: Scroll().interval unable to parse min & max values:', min, max);
			return null

		}

		min += -offset;
		max += offset;

		let interval = this.getInterval({ min, max }) || this.createInterval({ min, max, stopType, color });

		return interval

	}

	/**
	 * Get or create a stop
	 * @param {number|string} position position
	 */
	stop(position, type = StopType.bound) {

		if (typeof position === 'string' && position.slice(0, 2) === '+=')
			position = (this.stops.length ? this.stops[this.stops.length - 1].position : 0) + parseFloat(position.slice(2));

		let stop = this.getStop({ position, type }) || this.createStop({ position, type });

		return stop

	}

	trigger(position) {

		return this.stop(position, Stop.Type.trigger)

	}

}

function udpateScrolls() {

	requestAnimationFrame(udpateScrolls);

	for (let scroll of scrolls)
		scroll.update();

}

udpateScrolls();
















const wheelDiscreteInterval = 120;

function onMouseWheel(handler, event) {

	event.preventDefault();

	let wheelX = handler.vars.wheelX;
	let wheelY = handler.vars.wheelY;
	let wheelSpeedX = handler.vars.wheelSpeedX;
	let wheelSpeedY = handler.vars.wheelSpeedY;

	// https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode
	let unit = event.deltaMode === 0x00 ? 1 : 16;
	let dx = event.deltaX * unit;
	let dy = event.deltaY * unit;

	if (!handler.mouseWheelID) {

		wheelX.reset(dx);
		wheelY.reset(dy);

		wheelSpeedX.reset(0);
		wheelSpeedY.reset(0);

		handler.dispatchEvent('wheel-start');

		handler.mouseWheelID = setTimeout(() => mouseWheelStop(handler), wheelDiscreteInterval);

	} else {

		wheelX.newValue(dx);
		wheelY.newValue(dy);

		wheelSpeedX.newValue(wheelX.average.value);
		wheelSpeedY.newValue(wheelY.average.value);

		let through;

		if (wheelSpeedX.growth.value > 1)
			handler.dispatchEvent('wheel-increase-speed-x');

		if (wheelSpeedY.growth.value > 1)
			handler.dispatchEvent('wheel-increase-speed-y', { speed: wheelSpeedY.value });

		if (through = wheelSpeedX.growth.through(1))
			handler.dispatchEvent(through === -1 ? 'wheel-max-speed-x' : 'wheel-min-speed-x');

		if (through = wheelSpeedY.growth.through(1))
			handler.dispatchEvent(through === -1 ? 'wheel-max-speed-y' : 'wheel-min-speed-y');

		clearTimeout(handler.mouseWheelID);
		handler.mouseWheelID = setTimeout(() => mouseWheelStop(handler), wheelDiscreteInterval);

	}

}

function mouseWheelStop(handler) {

	handler.mouseWheelID = null;
	handler.dispatchEvent('wheel-stop');

}

class ScrollHandler extends EventDispatcher {

	constructor(element) {

		super();

		if (typeof element === 'string')
			element = document.querySelector(element);

		this.vars = {

			wheelX: new Variable(0, 0, 10),
			wheelY: new Variable(0, 0, 10),

			wheelSpeedX: new Variable(0, 2, 10),
			wheelSpeedY: new Variable(0, 2, 10),

		};



		element.addEventListener('mousewheel', event => onMouseWheel(this, event));

	}

}

























let svgNS = 'http://www.w3.org/2000/svg';

function svg(node, attributes) {

	if (node === 'svg') {

		node = document.createElementNS(svgNS, 'svg');
		node.setAttributeNS(svgNS, 'width', 300);
		node.setAttributeNS(svgNS, 'height', 300);

	}

	if (typeof node === 'string')
		node = document.createElementNS(svgNS, node);

	if (attributes && attributes.parent) {

		attributes.parent.appendChild(node);
		delete attributes.parent;

	}

	for (let k in attributes) 
		attributes[k] !== null ? node.setAttributeNS(null, k, attributes[k]) : node.removeAttributeNS(null, k);

	return node

}

let svgCSS = {

	position: 'fixed',
	top: 0,
	left: 0,
	width: '100%',
	'z-index': 100,

};

class ScrollSVG {

	constructor(options) {

		this.options = Object.assign({

			scale: 1,

		}, options);

		this.svg = svg('svg');

		for (let k in svgCSS)
			this.svg.style.setProperty(k, svgCSS[k]);

		this.g = svg('g', {

			parent: this.svg,

			fill: 'none',
			stroke: 'red',
			transform: 'translate(20, 20)'

		});

		if (this.options.scroll)
			this.init(this.options.scroll);

	}

	init(scroll) {

		this.scroll = scroll;

		let s = this.options.scale;

		this.line = svg('line', {

			parent: this.g,

			x1: this.scroll.stopByIndex(0).position * s,
			x2: this.scroll.stopByIndex(-1).position * s,

			y1: 0,
			y2: 0,

		});

		let scrollPosition = svg('line', {

			parent: this.g,

			x1: this.scroll.position * s,
			x2: this.scroll.position * s,

			y1: -5,
			y2: 5,

			'stroke-width': 3,

		});

		this.scroll.on('update', event => {

			svg(scrollPosition, {

				x1: this.scroll.position * s,
				x2: this.scroll.position * s,

			});

		});

		this.stops = this.scroll.stops.map(stop => {

			let size = stop.type === StopType.bound ? 5 : 1.5;

			return svg('line', {

				parent: this.g,

				stroke: stop.color,

				x1: stop.position * s,
				x2: stop.position * s,

				y1: -size,
				y2: size,

			})

		});



		let indexedIntervals = [];

		this.intervals = this.scroll.intervals.map(interval => {

			let index = 0;

			for (let a; a = indexedIntervals[index]; index++) {

				let overlap = false;

				for (let b of a)
					overlap = overlap || b.overlap(interval);

				if (!overlap)
					break

			}

			indexedIntervals[index] ? indexedIntervals[index].push(interval) : indexedIntervals[index] = [interval];

			let y = 20 + index * 12;

			let g = svg('g', {

				parent: this.g,

				stroke: interval.color,

			});

			g.dataset.interval = interval.stopMin.position + ',' + interval.stopMax.position;

			let line = svg('line', {

				parent: g,

				x1: interval.stopMin.position * s,
				x2: interval.stopMax.position * s,

				y1: y,
				y2: y,


			});

			let x = interval.stopMin.position + (interval.stopMax.position - interval.stopMin.position) * interval.local;

			x = (x * s).toFixed(2);

			let pos = svg('line', {

				parent: g,

				x1: x,
				x2: x,

				y1: y - 5,
				y2: y + 5,


			});

			interval.on(/enter|exit/, event => {

				svg(g, { 'stroke-width': interval.state ? null : 3 });

			});

			interval.on('update', event => {

				let x = interval.stopMin.position + (interval.stopMax.position - interval.stopMin.position) * interval.local;

				x = (x * s).toFixed(2);

				svg(pos, { x1: x, x2: x });

			});

			return g

		});

		return this

	}



}

export { Stop, Interval, Scroll, ScrollHandler, ScrollSVG };
