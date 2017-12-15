
import * as eventjs from './event.js'
import { Variable } from './variable.js'
import { Point } from './geom.js'





export class Tags {

	constructor() {

		this.string = ''

	}

	add(tags) {

		let a = !this.string ? [] : this.string.split(' ')

		for (let tag of tags.split(' '))
			if (!a.includes(tag))
				a.push(tag)

		this.string = a.join(' ')

		return this

	}

	matches(selector) {

		if (selector instanceof RegExp)
			return selector.test(this.string)

		let a = this.string.split(' ')

		return selector.split(' ').every(tag => a.includes(tag))

	}

	valueOf() {

		return this.string

	}

}

function triggerItem(item, type) {

	item.hasTrigger = true

	item.dispatchEvent(type)

}

function updateItem(item, state, local, triggerUpdate = false) {

	item.hasTrigger = false

	let state_old = item.state_old = item.state
	item.state = state

	item.local_old = item.local
	item.local = local

	if (state !== state_old) {

		if ((state <= 0 && state_old > 0) || (state >= 0 && state_old < 0))
			triggerItem(item, 'touch')

		if (state === 0 && (state_old !== 0))
			triggerItem(item, 'enter')

		if (state !== 0 && state_old === 0)
			triggerItem(item, 'exit')

		if ((state < 0 && state_old >= 0) || (state > 0 && state_old <= 0))
			triggerItem(item, 'leave')

	}

	if (item.hasTrigger || triggerUpdate)
		item.dispatchEvent('update')

}

function updateStop(scroll, stop) {

	let position = scroll._position

	let local = position - stop.position
	let state = local < -stop.margin ? -1 : local > stop.margin ? 1 : 0

	updateItem(stop, state, local)

}

function updateInterval(scroll, interval) {

	let position = scroll._position
	let position_old = scroll._position_old

	let min = interval.stopMin.position
	let max = interval.stopMax.position
	let width = max - min

	let localRaw = (position - min) / width
	let localRaw_old = (position_old - min) / width
	let local = localRaw < 0 ? 0 : localRaw > 1 ? 1 : localRaw
	let state = localRaw < -interval.margin / width ? -1 : localRaw > 1 + interval.margin / width ? 1 : 0

	let triggerUpdate = (localRaw >= 0 && localRaw <= 1) || (localRaw_old >= 0 && localRaw_old <= 1)
	
	updateItem(interval, state, local, triggerUpdate)

}

class Item extends eventjs.EventDispatcher {

	constructor() {

		super()

		this.tags = new Tags()

		this.state = 1

		this.hasTrigger = false

	}

	set(params) {

		for (let k in params)
			this[k] = params[k]

		return this

	}

	trigger(type) {

		this.hasTrigger = true

		this.dispatchEvent(type)

	}

}

const StopType = {

	bound: 'bound',
	trigger: 'trigger',

}

let stopCount = 0

export class Stop extends Item {

	static get Type() { return StopType }

	constructor(scroll, position, type = 'bound', margin = .1, name = null, color = null, tags = '') {

		super()

		this.id = 'stop-' + stopCount++

		this.scroll = scroll

		this.position = position
		this.type = type
		this.margin = margin
		this.name = name || this.id
		this.color = color
		this.tags.add(tags)

	}

	remove() {

		if (!this.scroll)
			return this

		let index = this.scroll.stops.indexOf(this)

		scroll.stops.splice(index, 1)

		return this

	}

	toInterval({ offset, tags = '', stopType = undefined }) {

		return this.scroll.interval({ position: this.position, offset, stopType, tags })

	}

}









let intervalCount = 0

export class Interval extends Item {

	constructor(scroll, stopMin, stopMax, margin = .1, name = null, color = null, tags = '') {

		super()

		this.id = 'interval-' + intervalCount++

		this.scroll = scroll
		this.stopMin = stopMin
		this.stopMax = stopMax
		this.margin = margin * 0
		this.color = color
		this.name = name || this.id
		this.tags.add(tags)

	}

	get min() { return this.stopMin.position }
	get max() { return this.stopMax.position }
	get width() { return this.stopMax.position - this.stopMin.position }

	remove() {

		if (!this.scroll)
			return this

		let index = this.scroll.intervals.indexOf(this)

		scroll.intervals.splice(index, 1)

		this.stopMin.remove()
		this.stopMax.remove()

		return this

	}

	contains(position) {

		return this.stopMin.position <= position && this.stopMax.position >= position

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
			updateStop(scroll, stop)

		for (let interval of this.intervals)
			updateInterval(scroll, interval)

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

	nearestStop(position, { type = StopType.bound, mode = 'near' } = {}) {

		let best = {

			d: Infinity,
			stop: null,

		}

		for (let stop of this.stops) {

			if (type !== null && type !== stop.type)
				continue

			let d = mode === 'near' ? Math.abs(position - stop.position) :
				mode === 'prev' ? (position > stop.position ? position - stop.position : NaN) :
				mode === 'next' ? (position < stop.position ? stop.position - position : NaN) :
				NaN

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

	intervalById(id) {

		for (let interval of this.intervals)
			if (interval.id === id)
				return interval

		return null

	}

	getIntervals({ position = NaN, tags = null }) {

		let a = this.intervals

		if (!isNaN(position))
			a = a.filter(interval => interval.contains(position))

		if (tags)
			a = a.filter(interval => interval.tags.matches(tags))

		return a

	}

	getInterval(args) {

		return this.getIntervals(args)[0]

	}

	intervalByMinMax(min, max, tolerance = 1e-9) {

		for (let interval of this.intervals)
			if (Math.abs(interval.min - min) < tolerance && Math.abs(interval.max - max) < tolerance)
				return interval

		return null

	}

	createInterval({ min, max, stopType = 'trigger', margin = .1, color = null, name = null, tags = '' }) {

		let stopMin, stopMax

		stopMin = this.createStop({ position: min, type: stopType })
		stopMax = this.createStop({ position: max, type: stopType })

		let interval = new Interval(this, stopMin, stopMax, margin, name, color, tags)

		this.intervals.push(interval)

		return interval

	}





	shoot() {

		let prevision = this.position - this.velocity / Math.log(this.friction)

		let target = this.nearestStop(prevision, { type: StopType.bound })

		this.velocity = (this.position - target.position) * Math.log(this.friction)

	}

	toNextStop() {

		let target = this.nearestStop(this.position + 1, { type: StopType.bound, mode: 'next' })

		if (target)
			this.velocity = (this.position - target.position) * Math.log(this.friction)

	}

	toPreviousStop() {

		let target = this.nearestStop(this.position - 1, { type: StopType.bound, mode: 'prev' })

		if (target)
			this.velocity = (this.position - target.position) * Math.log(this.friction)

	}



	// shorthands:

	interval({ min, max, position, width, offset = 0, stopType = 'trigger', color = null, tags = '' }) {

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

		let interval = this.intervalByMinMax(min, max) || this.createInterval({ min, max, stopType, color, tags })

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

function onWheel(handler, event) {

	event.preventDefault()

	let wheelX = handler.vars.wheelX
	let wheelY = handler.vars.wheelY
	let swipeX = handler.vars.swipeX
	let swipeY = handler.vars.swipeY
	let wheelSpeedX = handler.vars.wheelSpeedX
	let wheelSpeedY = handler.vars.wheelSpeedY
	let wheelSpeedSmoothX = handler.vars.wheelSpeedSmoothX
	let wheelSpeedSmoothY = handler.vars.wheelSpeedSmoothY

	// https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode
	let unit = event.deltaMode === 0x00 ? 1 : 16
	let dx = event.deltaX * unit
	let dy = event.deltaY * unit

	if (!handler.wheelID) {

		wheelX.reset(dx)
		wheelY.reset(dy)

		wheelSpeedX.reset(dx)
		wheelSpeedY.reset(dy)

		wheelSpeedSmoothX.reset(0)
		wheelSpeedSmoothY.reset(0)

		handler.dispatchEvent('wheel-start')

		handler.wheelID = setTimeout(() => wheelStop(handler), wheelDiscreteInterval)
		handler.wheeling = true

	} else {

		wheelX.newValueIncrement(dx)
		wheelY.newValueIncrement(dy)

		swipeX.newValueIncrement(dx)
		swipeY.newValueIncrement(dy)

		if (swipeY.through(-handler.options.swipeThreshold))
			handler.dispatchEvent('swipe-up')

		if (swipeY.through(handler.options.swipeThreshold))
			handler.dispatchEvent('swipe-down')

		if (swipeX.through(-handler.options.swipeThreshold))
			handler.dispatchEvent('swipe-left')

		if (swipeX.through(handler.options.swipeThreshold))
			handler.dispatchEvent('swipe-right')

		wheelSpeedX.newValue(dx)
		wheelSpeedY.newValue(dy)

		wheelSpeedSmoothX.newValue(wheelSpeedX.average.value)
		wheelSpeedSmoothY.newValue(wheelSpeedY.average.value)

		// console.log(wheelX.value)

		if (wheelSpeedSmoothX.growth.value > 1) {

			handler.dispatchEvent('wheel-increase-speed-x')
			swipeX.reset(0)

		}

		if (wheelSpeedSmoothY.growth.value > 1) {

			handler.dispatchEvent('wheel-increase-speed-y', { speed: wheelSpeedSmoothY.value })
			swipeY.reset(0)

		}

		let through

		if (through = wheelSpeedSmoothX.growth.through(1))
			handler.dispatchEvent(through === -1 ? 'wheel-max-speed-x' : 'wheel-min-speed-x')

		if (through = wheelSpeedSmoothY.growth.through(1))
			handler.dispatchEvent(through === -1 ? 'wheel-max-speed-y' : 'wheel-min-speed-y')

		clearTimeout(handler.wheelID)
		handler.wheelID = setTimeout(() => wheelStop(handler), wheelDiscreteInterval)

	}

}

function wheelStop(handler) {

	handler.wheelID = null
	handler.wheeling = false
	handler.dispatchEvent('wheel-stop')

}

function mouseMove(handler, event) {

}

function mouseDown(handler, event) {



}

export class ScrollHandler extends eventjs.EventDispatcher {

	constructor(element, options) {

		super()

		if (typeof element === 'string')
			element = document.querySelector(element)

		this.vars = {

			wheelX: new Variable(0, 0, 10),
			wheelY: new Variable(0, 0, 10),

			swipeX: new Variable(0, 0, 1),
			swipeY: new Variable(0, 0, 1),

			wheelSpeedX: new Variable(0, 0, 10),
			wheelSpeedY: new Variable(0, 0, 10),

			wheelSpeedSmoothX: new Variable(0, 2, 10),
			wheelSpeedSmoothY: new Variable(0, 2, 10),

		}

		this.options = Object.assign({

			swipeThreshold: 100, //px

		}, options)



		element.addEventListener('wheel', event => onWheel(this, event))
		element.addEventListener('mousemove', event => mouseMove(this, event))

	}

}

























function waitFor(duration) {
	
	return new Promise(resolve => {
		
		setTimeout(resolve, duration)
		
	})

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

		attributes.parent.insertBefore(node, attributes.before)
		delete attributes.parent
		delete attributes.before

	}

	for (let k in attributes) 
		attributes[k] === null || attributes[k] === undefined ? node.removeAttributeNS(null, k) : node.setAttributeNS(null, k, attributes[k])

	return node

}

function svgRetrieveAttributes(node) {

	let result = {}

	for (let k of node.getAttributeNames()) {

		let value = node.getAttributeNS(null, k)

		result[k] = /\d$/.test(value) && !isNaN(value) ? parseFloat(value) : value
	}

	return result

}

function closest(element, selector) {

	while (element instanceof Element) {

		if (element.matches(selector))
			return element

		element = element.parentNode

	}

	return null

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
	'font-family': 'monospace',
	'font-size': 10,

}

class Tooltip {

	constructor(scrollSVG) {

		this.scrollSVG = scrollSVG

		this.g = svg('g', {

			parent: scrollSVG.g,
			class: 'tooltip',

			fill: 'var(--color)',
			stroke: 'none',
			visibility: 'hidden',

		})

		this.g.style.setProperty('transition', 'opacity .2s')

		this.rect = svg('rect', {

			parent: this.g,

			x: 0,
			y: 0,
			width: 160, 
			height: 50,
			rx: 5,
			ry: 5,

		})

		this.name = svg('text', {

			parent: this.g,

			fill: 'white',
			stroke: 'none',
			x: 80,
			y: 14,
			'text-anchor': 'middle',

		})

		this.range = svg('text', {

			parent: this.g,

			fill: 'white',
			stroke: 'none',
			x: 80,
			y: 28,
			'text-anchor': 'middle',

		})

		this.info = svg('text', {

			parent: this.g,

			fill: 'white',
			stroke: 'none',
			x: 80,
			y: 42,
			'text-anchor': 'middle',

		})

		this.scrollSVG.g.addEventListener('mouseover', event => {

			if (closest(event.target, 'g.tooltip'))
				return

			let interval = closest(event.target, 'g.interval')

			this.setTarget(interval)

		})

		this.scrollSVG.svg.addEventListener('mouseleave', event => this.setTarget(null))
	}

	async setTarget(value) {

		if (this.target === value || this.isWaiting)
			return

		if (this.target) {

			let interval = this.scrollSVG.scroll.intervalById(this.target.dataset.id)

			interval.off('update', this.intervalOnUpdate)

			this.g.style.setProperty('opacity', 0)

			this.target.style.removeProperty('stroke-width')

			this.isWaiting = true

			await waitFor(100)

			this.isWaiting = false

		}

		this.target = value

		svg(this.g, { visibility: this.target ? 'visible' : 'hidden' })

		if (!this.target)
			return

		let interval = this.scrollSVG.scroll.intervalById(this.target.dataset.id)

		interval.on('update', this.intervalOnUpdate, { thisArg: this })

		this.g.style.setProperty('opacity', 1)

		this.target.style.setProperty('stroke-width', 3)

		this.name.innerHTML = interval.name
		this.range.innerHTML = interval.min.toFixed(1) + ' - ' + interval.max.toFixed(1)
		this.info.innerHTML = `local: ${interval.local.toFixed(2)}, state: ${interval.state}`

		svg(this.rect, {

			fill: interval.color,

		})

		let attr = svgRetrieveAttributes(this.target.querySelector('line'))

		let x = (attr.x1 + attr.x2) / 2 - 80
		let y = (attr.y1 + attr.y2) / 2 + 8

		svg(this.g, {

			transform: `translate(${x}, ${y})`,

		})

	}

	intervalOnUpdate(event) {

		let interval = event.target

		this.info.innerHTML = `local: ${interval.local.toFixed(2)}, state: ${interval.state}`

	}

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

		this.svg.style.setProperty('--color', this.options.color)

		this.g = svg('g', {

			parent: this.svg,

			fill: 'none',
			stroke: this.options.color,
			transform: 'translate(20, 20)'

		})

		this.tooltip = new Tooltip(this)




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
			before: this.tooltip.g,

			x1: this.scroll.stopByIndex(0).position * s,
			x2: this.scroll.stopByIndex(-1).position * s,

			y1: 0,
			y2: 0,

		})

		let scrollPosition = svg('line', {

			parent: this.g,
			before: this.tooltip.g,

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
				before: this.tooltip.g,

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
				before: this.tooltip.g,

				class: 'interval',
				'data-id': interval.id, 

				stroke: interval.color,

			})

			g.dataset.interval = interval.min + ',' + interval.max

			let line = svg('line', {

				parent: g,

				x1: interval.min * s,
				x2: interval.max * s,

				y1: y,
				y2: y,


			})

			// (interval.local || 0) : avoid initialization bug (interval.local === NaN)
			let x = interval.min + interval.width * (interval.local || 0)

			x = (x * s).toFixed(2)

			let pos = svg('line', {

				parent: g,

				x1: x,
				x2: x,

				y1: y - 5,
				y2: y + 5,


			})

			let hitArea = svg('rect', {

				parent: g,

				stroke: 'none',
				fill: 'transparent',

				x: interval.min * s,
				y: y - 5,
				width: interval.width * s,
				height: 10,

			})

			interval.on(/enter|exit/, event => {

				svg(g, { 'stroke-width': interval.state ? null : 3 })

			})

			interval.on('update', event => {

				let x = interval.min + interval.width * interval.local

				x = (x * s).toFixed(2)

				svg(pos, { x1: x, x2: x })

			})

			return g

		})

		return this

	}



}

