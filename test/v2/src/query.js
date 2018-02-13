/*

query(object, 'page enabled')
query(object, 'page enabled > stop')
query(object, 'page enabled pagination.number>0 > stop')
query(object, 'page enabled pagination[number>0] > stop')
query(object, 'stop name=bob')

*/

const SelectorOp = {

	'=': 	(lhs, rhs) => String(lhs) === String(rhs),
	'!=': 	(lhs, rhs) => String(lhs) !== String(rhs),
	'>': 	(lhs, rhs) => parseFloat(lhs) > parseFloat(rhs),
	'>=': 	(lhs, rhs) => parseFloat(lhs) >= parseFloat(rhs),
	'<': 	(lhs, rhs) => parseFloat(lhs) < parseFloat(rhs),
	'<=': 	(lhs, rhs) => parseFloat(lhs) <= parseFloat(rhs),

}

function makeTest(str) {

	let [, key, op, rhs] = str.match(/([\w-]+|\*)(=|!=|>|>=|<|<=)?([\w-]+)?/)

	if (key === '*')
		return object => true

	return op
		? object => SelectorOp[op](object[key], rhs)
		: object => object.hasOwnProperty(key)

}

function getChildren(object, childrenDelegate, includeSelf) {

	let array = includeSelf ? [object] : []

	let children = childrenDelegate(object)

	if (children)
		for (let child of children)
			array.push(...getChildren(child, childrenDelegate, true))

	return array

}

export default function query(object, selector, { tagsDelegate = 'tags', childrenDelegate = 'children' } = {}) {

	if (typeof tagsDelegate === 'string') {

		let key = tagsDelegate
		tagsDelegate = object => object[key]
		
	}

	if (typeof childrenDelegate === 'string') {

		let key = childrenDelegate
		childrenDelegate = object => object[key]

	}

	let includeSelf = true

	if (/^\s*>\s+/.test(selector)) {

		selector = selector.replace(/^\s*>\s+/, '')
		includeSelf = false

	}

	let stages = selector
		.split(/\s+>\s+/)
		.map(str => str
			.split(/\s+/)
			.map(str => makeTest(str)))

	let array, candidates = getChildren(object, childrenDelegate, includeSelf)

	for (let [index, stage] of stages.entries()) {

		array = []

		for (let candidate of candidates) {

			let tags = tagsDelegate(candidate)

			if (stage.every(test => test(tags)))
				array.push(candidate)

		}

		candidates = [].concat(...array.map(candidate => childrenDelegate(candidate) || []))

	}

	return array

}
