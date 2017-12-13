
import * as eventjs from './event.js'
import { Variable } from './variable.js'







class ScrollItem extends eventjs.EventDispatcher {

	constructor() {

		super()

		this.state = 1

	}

	trigger(type) {

		this.dispatchEvent(type)

	}

	update(state, local) {

		let state_old = this.state_old = this.state
		this.state = state

		this.local_old = this.local
		this.local = local

		if (state !== state_old) {

			if ((state <= 0 && state_old > 0) || (state >= 0 && state_old < 0))
				this.trigger('touch')

			if (state === 0 && (state_old !== 0))
				this.trigger('enter')

			if (state !== 0 && state_old === 0)
				this.trigger('exit')

			if ((state < 0 && state_old >= 0) || (state > 0 && state_old <= 0))
				this.trigger('leave')

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

	constructor(scroll, position, type = 'bound', margin = .1, name = null, color = null) {

		super()

		this.scroll = scroll

		this.position = position
		this.type = type
		this.margin = margin
		this.name = name || 'stop-' + stopCount
		this.color = color

		stopCount++

		// this.update()

	}

	set(params) {

		for (let k in params)
			this[k] = params[k]

		return this

	}

	update() {

		let position = this.scroll._position

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

	toInterval({ offset, type = undefined }) {

		return this.scroll.interval({ position: this.position, offset, type })

	}

}









let intervalCount = 0

export class Interval extends ScrollItem {

	constructor(scroll, stopMin, stopMax, margin = .1, name = null, color = null) {

		super()

		this.scroll = scroll
		this.stopMin = stopMin
		this.stopMax = stopMax
		this.margin = margin
		this.color = color
		this.name = name || 'stop-' + stopCount

		intervalCount++

		// this.update()

	}

	update() {

		let position = this.scroll._position
		let position_old = this.scroll._position_old

		let width = this.stopMax.position - this.stopMin.position

		let localRaw = (position - this.stopMin.position) / width
		let localRaw_old = (position_old - this.stopMin.position) / width
		let local = localRaw < 0 ? 0 : localRaw > 1 ? 1 : localRaw
		let state = localRaw < -this.margin / width ? -1 : localRaw > 1 + this.margin / width ? 1 : 0
		
		super.update(state, local)

		if ((localRaw >= 0 && localRaw <= 1) || localRaw_old >= 0 && localRaw_old <= 1)
			this.dispatchEvent('update')

	}

	remove() {

		if (!this.scroll)
			return this

		let index = this.scroll.intervals.indexOf(this)

		scroll.intervals.splice(index, 1)

		this.stopMin.remove()
		this.stopMax.remove()

		return this

	}

	overlap(other) {

		return !(other.stopMin.position > this.stopMax.position || other.stopMax.position < this.stopMin.position)

	}

	toString() {

		return `Interval[${this.stopMin.position}, ${this.stopMax.position}]`

	}

}







let scrolls = []

export class Scroll extends eventjs.EventDispatcher {

	constructor({ autoStart = true } = {}) {

		super()

		this.id = 'scroll-' + (scrolls.push(this) - 1)

		this._position = 0
		this._position_new = 0
		this._position_old = 0

		this._velocity = 0
		this._velocity_new = 0
		this._velocity_old = 0

		this.friction = 1e-3

		this.frame = 0

		this.stops = []
		this.intervals = []

		this.epsilon = 1e-3

		this.createStop({ position: 0 })

		if (autoStart)
			setTimeout(() => this.start(), 0)

	}

	get position() { return this._position }
	set position(value) { this._position_new = value }

	get velocity() { return this._velocity }
	set velocity(value) { this._velocity_new = value }

	start({ position = 0 } = {}) {

		this.started = true

		this._position = position
		this._position_new = position
		this._position_old = Infinity

		this.update({ force: true })

		this.dispatchEvent('start')

	}

	clear() {

		this.stops = []
		this.intervals = []

		this.position = 0
		this.velocity = 0

		this.createStop({ position: 0 })

		this.dispatchEvent('clear')

	}

	update({ dt = 1 / 60, force = false } = {}) {

		this._position_old = this._position_new
		this._velocity_old = this._velocity_new

		this._velocity_new *= Math.pow(this.friction, dt)
		this._position_new += (this._velocity_new + this._velocity_old) / 2 * dt

		if (!force && Math.abs(this._position - this._position_new) < this.epsilon)
			return this

		this._position = this._position_new
		this._velocity = this._velocity_new

		for (let stop of this.stops)
			stop.update()

		for (let interval of this.intervals)
			interval.update()

		this.dispatchEvent('update')

		this.frame++

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

	createStop({ position, type = 'bound', margin = .1, name = null, color = null }) {

		let stop = new Stop(this, position, type, margin, name, color)

		let i = 0, n = this.stops.length

		for (i; i < n; i++)
			if (this.stops[i].position > stop.position)
				break

		this.stops.splice(i, 0, stop)

		return stop

	}

	getInterval({ min, max, tolerance = 1e-9 }) {

		for (let interval of this.intervals)
			if (Math.abs(interval.stopMin.position - min) < tolerance && Math.abs(interval.stopMax.position - max) < tolerance)
				return interval

		return null

	}

	createInterval({ min, max, stopType = 'trigger', margin = .1, color = null, name = null }) {

		let stopMin, stopMax

		stopMin = this.createStop({ position: min, type: stopType })
		stopMax = this.createStop({ position: max, type: stopType })

		let interval = new Interval(this, stopMin, stopMax, margin, name, color)

		this.intervals.push(interval)

		return interval

	}





	shoot() {

		let prevision = this.position - this.velocity / Math.log(this.friction)

		let target = this.nearestStop({ position: prevision, type: StopType.bound })

		this.velocity = (this.position - target.position) * Math.log(this.friction)

	}



	// shorthands:

	interval({ min, max, position, width, offset = 0, stopType = 'trigger', color = null }) {

		if (!isNaN(position) && !isNaN(width))
			[min, max] = [position, position + width]

		if (!isNaN(position) && offset > 0)
			[min, max] = [position, position]

		if (isNaN(min) || isNaN(max)) {

			console.log('p-scroll.js: Scroll().interval unable to parse min & max values:', min, max)
			return null

		}

		min += -offset
		max += offset

		let interval = this.getInterval({ min, max }) || this.createInterval({ min, max, stopType, color })

		return interval

	}

	/**
	 * Get or create a stop
	 * @param {number|string} position position
	 */
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
		if (scroll.started)
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
		attributes[k] === null || attributes[k] === undefined ? node.removeAttributeNS(null, k) : node.setAttributeNS(null, k, attributes[k])

	return node

}

function intervalPath(min, max, y, size) {
	
	return `M ${min} ${y} L ${max} ${y} M ${min} ${y - size} L ${min} ${y + size} M ${max} ${y - size} L ${max} ${y + size}`

}

let svgCSS = {

	position: 'fixed',
	top: 0,
	left: 0,
	width: '100%',
	'z-index': 100,

}

export class ScrollSVG {

	constructor(options) {

		this.options = Object.assign({

			scale: 1,
			color: 'red',

		}, options)

		this.svg = svg('svg')

		for (let k in svgCSS)
			this.svg.style.setProperty(k, svgCSS[k])

		this.g = svg('g', {

			parent: this.svg,

			fill: 'none',
			stroke: this.options.color,
			transform: 'translate(20, 20)'

		})

		if (this.options.scroll)
			this.init(this.options.scroll)

	}

	init(scroll) {

		this.scroll = scroll

		this.scroll.on('clear', event => {

			while (this.g.firstChild)
				this.g.firstChild.remove()

			this.draw()

		})

		this.draw()

	}

	draw() {

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

			x1: this.scroll.position * s || 0,
			x2: this.scroll.position * s || 0,

			y1: -5,
			y2: 5,

			'stroke-width': 3,

		})

		this.scroll.on('update', event => {

			svg(scrollPosition, {

				x1: this.scroll.position * s,
				x2: this.scroll.position * s,

			})

		})

		this.stops = this.scroll.stops.map(stop => {

			let size = stop.type === StopType.bound ? 5 : 1.5

			return svg('line', {

				parent: this.g,

				stroke: stop.color,

				x1: stop.position * s,
				x2: stop.position * s,

				y1: -size,
				y2: size,

			})

		})



		let indexedIntervals = []

		this.intervals = this.scroll.intervals.map(interval => {

			let index = 0

			for (let a; a = indexedIntervals[index]; index++) {

				let overlap = false

				for (let b of a)
					overlap = overlap || b.overlap(interval)

				if (!overlap)
					break

			}

			indexedIntervals[index] ? indexedIntervals[index].push(interval) : indexedIntervals[index] = [interval]

			let y = 20 + index * 12

			let g = svg('g', {

				parent: this.g,

				stroke: interval.color,

			})

			g.dataset.interval = interval.stopMin.position + ',' + interval.stopMax.position

			let line = svg('line', {

				parent: g,

				x1: interval.stopMin.position * s,
				x2: interval.stopMax.position * s,

				y1: y,
				y2: y,


			})

			// (interval.local || 0) : avoid initialization bug (interval.local === NaN)
			let x = interval.stopMin.position + (interval.stopMax.position - interval.stopMin.position) * (interval.local || 0)

			x = (x * s).toFixed(2)

			let pos = svg('line', {

				parent: g,

				x1: x,
				x2: x,

				y1: y - 5,
				y2: y + 5,


			})

			interval.on(/enter|exit/, event => {

				svg(g, { 'stroke-width': interval.state ? null : 3 })

			})

			interval.on('update', event => {

				let x = interval.stopMin.position + (interval.stopMax.position - interval.stopMin.position) * interval.local

				x = (x * s).toFixed(2)

				svg(pos, { x1: x, x2: x })

			})

			return g

		})

		return this

	}



}

