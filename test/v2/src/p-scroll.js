import * as eventjs from './event.js'
import query from './query.js'



// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

const readonlyProperties = (target, properties, options = {}) => {

	for (let [key, value] of Object.entries(properties))
		Object.defineProperty(target, key, { value, ...options })

}

const parseUnit = value => {

	if (typeof value === 'string') {

		return parseFloat(value) * (percent.test(value) ? .01 : 1)

	}

	return value

}














// > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > //
//                                                                                         //
//                                                                                         //
//                                       Primitives                                        //
//                                                                                         //
//                                                                                         //
// < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < //

/*

Double:
	
	Double is to handle "double valued properties" (absolute / relative)
	Double can be expressed in two ways, D

	Question?
	Should Double be renamed 'Triple'? 
	And add to it a third part 'floating', which could represents a kind of relative value bounded 
	between min and max of the referent Position (which could be also renamed Space).
	Min and max must be retrieve from resolveR()

Position:

	Position represents a position in 1D space,
	and also Position reprents a space (via a scale factor),
	it can hold other positions, so a Position instance is a tree node (everything begins with a root position)
	The global position depends from its 'localValue' property which is expressed via 
	a mix of absolute and relative coordinates (CSS way of life, where values could be 100 (Number) or '100%' (String)).
	Global position also depends from parent global position (when a parent moves every child moves also).
	To allow relative value, parents must have a 'width' value, so there are!

	So let's resume, Position are 2 values object [Value, Width], where each value is in two dimentions (absolute / relative).

	Warning!
	Neighboring elements are not affected between them!
	Position's children are not differentiated between 'absolute' and 'relative' (as seems 
	to do the classical DOM architecture). So it follows that visually stacked positions (regular layout where each
	child size shift the next one position) are not 'linearized' children (having all the same parent)
	but are nested children (each position inside the previous one), where each child has the position set to 100%.
	This paradigm offers deeper tree graphs (child of child of child...), deeper but simpler!

	Question?
	Should Position be renamed 'Space'?

*/

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

const percent = /%/

const spaces = /\s/

export class Double {

	static isDouble(value) {

		return value.hasOwnProperty('absolute') && value.hasOwnProperty('relative')

	}

	static parsePercent(value) {

		return parseFloat(value) * (percent.test(value) ? .01 : 1)

	}

	/**
	 * 
	 * x 			> new Double(x, 1)
	 * '100' 		> new Double(100, 0)
	 * '100%' 		> new Double(0, 1)
	 * '50 50%' 	> new Double(50, .5)
	 * '50% 50%' 	> new Double(.5, .5)
	 * [x, y] 		> new Double(x, y)
	 * 
	 */
	static parse(value, relativeValue = null) {

		if (Double.isDouble(value))
			return value

		if (relativeValue)
			return new Double(Double.parsePercent(value), Double.parsePercent(relativeValue))

		if (value instanceof Array)
			return new Double(Double.parsePercent(value[0]), Double.parsePercent(value[1]))

		switch(typeof value) {

			case 'number':

				return new Double(value, 0)

			case 'string':
				
				if (spaces.test(value))
					return Double.parse(value.split(spaces))

				return percent.test(value)
					? new Double(0, parseFloat(value) / 100)
					: new Double(parseFloat(value), 0)

			default:

				return new Double(0, 0)

		}

		if (spaces.test(value))
			return value.split(spaces).map()

		return percent.test(value)

	}

	constructor(absolute = 0, relative = 0) {

		this.absolute = absolute
		this.relative = relative

	}

	set(...args) {

		if (args.length === 0) {

			this.absolute = 0
			this.relative = 0

			return this

		}

		if (args.length >= 2) {

			this.absolute = parseUnit(args[0])
			this.relative = parseUnit(args[1])

			return this

		}

		let arg = args[0]

		if (typeof arg === 'number') {

			this.absolute = arg
			this.relative = 0

			return this

		}

		if (typeof arg === 'string') {

			if (spaces.test(arg))
				return this.set(...arg.split(spaces))

			if (percent.test(arg)) {

				this.absolute = 0
				this.relative = parseUnit(arg)

			} else {

				this.absolute = parseUnit(arg)
				this.relative = 0

			}

			return this

		}

		console.warn('Double.set: Unhandled arguments!')
		console.warn(args)

		return this

	}

	toString() {

		return this.absolute === 0 && this.relative === 0
			? '0'
			: this.relative === 0
			? this.absolute.toFixed(1)
			: this.absolute === 0
			? (this.relative * 100).toFixed(1) + '%'
			: this.absolute.toFixed(1) + ' ' + (this.relative * 100).toFixed(1) + '%'

	}

}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //


class Position {

	constructor(parent = null) {

		readonlyProperties(this, {

			localValue: new Double(0, 0),
			localWidth: new Double(0, 1),

		})

		Object.assign(this, {

			parent,
			
			globalValue: 0,
			globalWidth: 1,

			globalValueMin: 0,
			globalValueMax: 0,
			
			children: null,

		})

	}

	get depth() { return this.parent ? this.parent.depth + 1 : 0 }

	addChild(child) {

		if (!this.children)
			this.children = []

		child.parent = this
		this.children.push(child)

		return this

	}

	removeChild(child) {

		if (child.parent !== this)
			throw 'child argument is not a child of this'

		child.parent = null
		this.children.splice(this.children.indexOf(child), 1)

		return this

	}

	resolve(value) { return this.globalValue + this.globalWidth * value.relative + value.absolute }

	resolveValue(absoluteValue, relativeValue = 0) { return this.globalValue + this.globalWidth * relativeValue + absoluteValue }

	// R stands for recursive
	resolveR() {

		let { parent, localValue, localWidth, children } = this

		let globalValue = !parent
			? localValue.relative + localValue.absolute
			: parent.globalValue + parent.globalWidth * localValue.relative + localValue.absolute

		let globalWidth = !parent
			? localWidth.relative + localWidth.absolute
			: parent.globalWidth * localWidth.relative + localWidth.absolute

		Object.assign(this, {

			globalValue,
			globalWidth,

		})

		this.globalValueMin = this.globalValue
		this.globalValueMax = this.globalValue + this.globalWidth

		if (children)
			
			for (let position of children) {
				
				position.resolveR()

				this.globalValueMin = Math.min(this.globalValueMin, position.globalValueMin)
				this.globalValueMax = Math.max(this.globalValueMax, position.globalValueMax)

			}

		return this

	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

	contains(value) {

		return value >= this.globalValue && value <= this.globalValue + this.globalWidth

	}

	getPositions(value) {

	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

	toString() {

		return `Position[d:${this.depth}, p:${this.globalValue.toFixed(1)} (${this.localValue.toString()}), w:${this.globalWidth.toFixed(1)} (${this.localWidth.toString()})]`

	}

}


















// > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > //
//                                                                                         //
//                                                                                         //
//                                       High-Level                                        //
//                                                                                         //
//                                                                                         //
// < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < < //

/*

Section:
	
	Section is built on top of Position


*/

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

let sectionMap = new WeakMap()
let sectionUID = 0

class Section extends eventjs.EventDispatcher {

	constructor(parent) {

		super()

		readonlyProperties(this, {

			uid: sectionUID++,
			position: new Position(),
			tags: { },

		})

		readonlyProperties(this.tags, { uid: this.uid }, { enumerable: true })

		sectionMap.set(this.position, this)

		if (parent)
			parent.position.addChild(this.position)

	}

	query(selector) {

		return query(this, selector)

	}

	queryFirst(selector) {

		return query(this, selector)[0] || null
	}

	// traps:
	get parent() { return this.position.parent && sectionMap.get(this.position.parent) }
	get children() { return this.position.children && this.position.children.map(v => sectionMap.get(v)) }

}

class Head {

	update() {

	}

}








let scrolls = []
let scrollUID = 0

export class Scroll {

	constructor(rootWidth = 1) {

		readonlyProperties(this, {

			uid: scrollUID++,
			rootSection: this.createSection(0, rootWidth),

		})

		Object.assign(this, {

			enabled: true,

		})

		scrolls.push(this)

	}

	update() {

		this.rootSection.position.resolveR()

	}

	createSection(position, width, parent = this.rootSection) {

		let section = new Section(parent)
		section.position.localValue.set(position)
		section.position.localWidth.set(width)
		section.position.resolveR()

		this.currentSection = section

		return section

	}

	appendSection(width) {

		let position = this.currentSection === this.rootSection
			? 0
			: '100%'

		let section = this.createSection(position, width, this.currentSection)

		return section

	}

	// shorthands (returning previous methods result)

	section({ min, max, width }) {

		if (min === undefined && width)
			return this.appendSection(width)

		return null

	}

}

function udpateScrolls() {

	if (typeof requestAnimationFrame === 'undefined')
		throw 'requestAnimationFrame is not available, cannot run'

	requestAnimationFrame(udpateScrolls)

	for (let scroll of scrolls)
		if (scroll.enabled)
			scroll.update()

}

udpateScrolls()



