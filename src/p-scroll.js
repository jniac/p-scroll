
import * as eventjs from './event.js'
import { Variable } from './variable.js'







class ScrollItem extends eventjs.EventDispatcher {

	trigger(type) {

		this.dispatchEvent(type)

	}

	update(state, local) {

		let state_old = this.state_old = this.state
		this.state = state

		this.local_old = this.local
		this.local = local

		if (state !== state_old) {

			if (state === 0 && state_old !== 0)
				this.trigger('enter')

			if (state !== 0 && state_old === 0)
				this.trigger('exit')

			if (state !== 0 && state_old !== 0) {

				this.trigger('touch')
				this.trigger('leave')

			}

		}

	}

}

const StopType = {

	bound: 'bound',
	trigger: 'trigger',

}

let stopCount = 0

export class Stop extends ScrollItem {

	static get Type() { return StopType }

	constructor(scroll, position, type = 'bound', margin) {

		super()

		this.scroll = scroll

		this.position = position
		this.type = type
		this.margin = margin
		this.name = name || 'stop-' + stopCount

		stopCount++

	}

	set(params) {

		for (let k in params)
			this[k] = params[k]

		return this

	}

	update(position, position_old) {

		let local = position - this.position
		let state = local < -this.margin ? -1 : local > this.margin ? 1 : 0

		super.update(state, local)

	}

	remove() {

		if (!this.scroll)
			return this

		let index = this.scroll.stops.indexOf(this)

		scroll.stops.splice(index, 1)

		return this

	}

	toInterval({ offset, type = null }) {

		return this.scroll.createInterval({ position: this.position - offset, width: offset * 2, type })

	}

}









export class Interval extends ScrollItem {

	constructor(scroll, stopA, stopB) {

		super()

		this.scroll = scroll
		this.stopA = stopA
		this.stopB = stopB

	}

	update(position) {

		let local = (position - this.stopA.position) / (this.stopB.position - this.stopA.position)
		let state = local < 0 ? -1 : local > 1 ? 1 : 0

		super.update(state, local)

		if ((this.local >= 0 && this.local <= 1) || this.local_old >= 0 && this.local_old <= 1)
			this.dispatchEvent('update')
		
	}

	remove() {

		if (!this.scroll)
			return this

		let index = this.scroll.intervals.indexOf(this)

		scroll.intervals.splice(index, 1)

		this.stopA.remove()
		this.stopB.remove()

		return this

	}

}







let scrolls = []

export class Scroll extends eventjs.EventDispatcher {

	constructor() {

		super()

		this.id = 'scroll-' + (scrolls.push(this) - 1)

		this._position = 0
		this._position_new = 0
		this._position_old = 0

		this._velocity = 0
		this._velocity_new = 0
		this._velocity_old = 0

		this.friction = 0.001

		this.stops = []
		this.intervals = []

		this.epsilon = 1e-3

		this.createStop({ position: 0 })

	}

	get position() { return this._position }
	set position(value) { this._position_new = value }

	get velocity() { return this._velocity }
	set velocity(value) { this._velocity_new = value }

	update(dt = 1 / 60) {

		this._position_old = this._position_new
		this._velocity_old = this._velocity_new

		this._velocity_new *= Math.pow(this.friction, dt)
		this._position_new += (this._velocity_new + this._velocity_old) / 2 * dt

		if (Math.abs(this._position - this._position_new) < this.epsilon)
			return this

		this._position = this._position_new
		this._velocity = this._velocity_new

		for (let stop of this.stops)
			stop.update(this._position, this._position_old)

		for (let interval of this.intervals)
			interval.update(this._position, this.position_old)

		this.dispatchEvent('update')

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

		}

		for (let stop of this.stops) {

			if (type !== null && type !== stop.type)
				continue

			let d = Math.abs(position - stop.position)

			if (d < best.d) {

				best.d = d
				best.stop = stop

			}

		}

		return best.stop

	}

	createStop({ position, type = 'bound', margin = .1, name = null }) {

		let stop = new Stop(this, position, type, margin, name)

		let i = 0, n = this.stops.length

		for (i; i < n; i++)
			if (this.stops[i].position > stop.position)
				break

		this.stops.splice(i, 0, stop)

		return stop

	}

	createInterval({ position, width, type = 'trigger' }) {

		let stopA, stopB

		stopA = this.createStop({ position: position, type })
		stopB = this.createStop({ position: position + width, type })

		let interval = new Interval(this, stopA, stopB)

		this.intervals.push(interval)

		return interval

	}





	shoot() {

		let prevision = this.position - this.velocity / Math.log(this.friction)

		let target = this.nearestStop({ position: prevision, type: StopType.bound })

		this.velocity = (this.position - target.position) * Math.log(this.friction)

	}



	// shorthands:

	stop(position, type = StopType.bound) {

		if (typeof position === 'string' && position.slice(0, 2) === '+=')
			position = (this.stops.length ? this.stops[this.stops.length - 1].position : 0) + parseFloat(position.slice(2))

		let stop = this.getStop({ position, type }) || this.createStop({ position, type })

		return stop

	}

	trigger(position) {

		return this.stop(position, Stop.Type.trigger)

	}

}

function udpateScrolls() {

	requestAnimationFrame(udpateScrolls)

	for (let scroll of scrolls)
		scroll.update()

}

udpateScrolls()











const wheelDiscreteInterval = 120

function onMouseWheel(handler, event) {

	event.preventDefault()

	let wheelX = handler.vars.wheelX
	let wheelY = handler.vars.wheelY
	let wheelSpeedX = handler.vars.wheelSpeedX
	let wheelSpeedY = handler.vars.wheelSpeedY

	// https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode
	let unit = event.deltaMode === 0x00 ? 1 : 16
	let dx = event.deltaX * unit
	let dy = event.deltaY * unit

	if (!handler.mouseWheelID) {

		wheelX.reset(dx)
		wheelY.reset(dy)

		wheelSpeedX.reset(0)
		wheelSpeedY.reset(0)

		handler.dispatchEvent('wheel-start')

		handler.mouseWheelID = setTimeout(() => mouseWheelStop(handler), wheelDiscreteInterval)

	} else {

		wheelX.newValue(dx)
		wheelY.newValue(dy)

		wheelSpeedX.newValue(wheelX.average.value)
		wheelSpeedY.newValue(wheelY.average.value)

		let through

		if (wheelSpeedX.growth.value > 1)
			handler.dispatchEvent('wheel-increase-speed-x')

		if (wheelSpeedY.growth.value > 1)
			handler.dispatchEvent('wheel-increase-speed-y', { speed: wheelSpeedY.value })

		if (through = wheelSpeedX.growth.through(1))
			handler.dispatchEvent(through === -1 ? 'wheel-max-speed-x' : 'wheel-min-speed-x')

		if (through = wheelSpeedY.growth.through(1))
			handler.dispatchEvent(through === -1 ? 'wheel-max-speed-y' : 'wheel-min-speed-y')

		clearTimeout(handler.mouseWheelID)
		handler.mouseWheelID = setTimeout(() => mouseWheelStop(handler), wheelDiscreteInterval)

	}

}

function mouseWheelStop(handler) {

	handler.mouseWheelID = null
	handler.dispatchEvent('wheel-stop')

}

export class ScrollHandler extends eventjs.EventDispatcher {

	constructor(element) {

		super()

		if (typeof element === 'string')
			element = document.querySelector(element)

		this.vars = {

			wheelX: new Variable(0, 0, 10),
			wheelY: new Variable(0, 0, 10),

			wheelSpeedX: new Variable(0, 2, 10),
			wheelSpeedY: new Variable(0, 2, 10),

		}



		element.addEventListener('mousewheel', event => onMouseWheel(this, event))

	}

}















let svgNS = 'http://www.w3.org/2000/svg'

function svg(node, attributes) {

	if (node === 'svg') {

		node = document.createElementNS(svgNS, 'svg')
		node.setAttributeNS(svgNS, 'width', 300)
		node.setAttributeNS(svgNS, 'height', 300)

	}

	if (typeof node === 'string')
		node = document.createElementNS(svgNS, node)

	if (attributes && attributes.parent) {

		attributes.parent.appendChild(node)
		delete attributes.parent

	}

	for (let k in attributes)
		node.setAttributeNS(null, k, attributes[k])

	return node

}

let svgCSS = {

	position: 'absolute',
	top: 0,
	left: 0,
	width: '100%',

}

export class ScrollSVG {

	constructor(options) {

		this.options = Object.assign({

			scale: 1,

		}, options)

		this.svg = svg('svg')

		for (let k in svgCSS)
			this.svg.style.setProperty(k, svgCSS[k])

		this.g = svg('g', {

			parent: this.svg,

			fill: 'none',
			stroke: 'red',
			transform: 'translate(20, 20)'

		})

		if (this.options.scroll)
			this.init(this.options.scroll)

	}

	init(scroll) {

		this.scroll = scroll

		let s = this.options.scale

		this.line = svg('line', {

			parent: this.g,

			x1: this.scroll.stopByIndex(0).position * s,
			x2: this.scroll.stopByIndex(-1).position * s,

			y1: 0,
			y2: 0,

		})

		let scrollPosition = svg('line', {

			parent: this.g,

			x1: this.scroll.position * s,
			x2: this.scroll.position * s,

			y1: -4,
			y2: 4,

			'stroke-width': 3,

		})

		this.scroll.on('update', event => {

			svg(scrollPosition, {

				x1: this.scroll.position * s,
				x2: this.scroll.position * s,

			})

		})

		this.stops = this.scroll.stops.map(stop => {

			return svg('line', {

				parent: this.g,

				x1: stop.position * s,
				x2: stop.position * s,

				y1: -4,
				y2: 4,

			})

		})

		return this

	}



}

