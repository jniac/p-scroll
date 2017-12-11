
import * as eventjs from './event.js'









const StopType = {

	bound: 'bound',
	trigger: 'trigger',

}

export class Stop extends eventjs.EventDispatcher {

	static get Type() { return StopType }

	constructor(position, type = 'bound', margin) {

		super()

		this.position = position
		this.type = type
		this.margin = margin

	}

	update(position, position_old) {

		this.scrollPosition = position - this.position
		this.state = this.scrollPosition < -this.margin ? -1 : this.scrollPosition > this.margin ? 1 : 0

	}

}









export class Interval extends eventjs.EventDispatcher {

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

		this.epsilon = 1e-6

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

	getStop({ position, type = null, tolerance = 1e-9 }) {

		for (let stop of this.stops)
			if ((type === null || type === stop.type) && Math.abs(stop.position - position) < tolerance)
				return stop

		return null

	}

	createStop({ position, type = 'bound', margin = .1 }) {

		let stop = new Stop(position, margin)

		let i = 0, n = this.stops.length

		for (i; i < n; i++)
			if (this.stops[i].position > stop.position)
				break

		this.stops.splice(i, 0, stop)

		return stop

	}



	// shorthands:

	stop(position, type = StopType.bound) {

		let stop = this.getStop({ position, type }) || this.createStop({ position })

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

export class ScrollSVG {

	constructor() {

		this.svg = svg('svg')

		this.g = svg('g', {

			parent: this.svg,

			fill: 'none',
			stroke: 'red',
			transform: 'translate(20, 20)'

		})

	}

	feed(scroll) {

		this.scroll = scroll

		this.line = svg('line', {

			parent: this.g,

			x1: this.scroll.stopByIndex(0).position,
			x2: this.scroll.stopByIndex(-1).position,

			y1: 0,
			y2: 0,

		})

		let scrollPosition = svg('line', {

			parent: this.g,

			x1: this.scroll.position,
			x2: this.scroll.position,

			y1: -4,
			y2: 4,

			'stroke-width': 3,

		})

		this.scroll.on('update', event => {

			svg(scrollPosition, {

				x1: this.scroll.position,
				x2: this.scroll.position,

			})

		})

		this.stops = this.scroll.stops.map(stop => {

			return svg('line', {

				parent: this.g,

				x1: stop.position,
				x2: stop.position,

				y1: -4,
				y2: 4,

			})

		})

		return this

	}



}

