import { Scroll, ScrollHandler, ScrollSVG } from '../src/p-scroll.js'
// import { Scroll, ScrollHandler, ScrollSVG } from '../build/p-scroll.module.js'







// creating the scroll

export let scrollB = new Scroll()

scrollB.friction = .000001

let sum = 0

Array.prototype.forEach.call(document.querySelectorAll('.wrapper-b .block'), element => {

	let height = element.offsetHeight

	let stop = scrollB.stop(sum + height / 2)



	stop.toInterval({ offset: 50 })
		.on('enter', event => {

			element.classList.add('enter')

		})
		.on('exit', event => {

			element.classList.remove('enter')

		})

	element.innerHTML = `<span>${stop.position}</span>`

	sum += height

})

scrollB.on('update', event => {

	document.querySelector('.wrapper-b .blocks')
		.style.setProperty('transform', `translateY(${(-scrollB.position).toFixed(2)}px)`)

})

scrollB.stop(0).set({

	type: 'trigger',

})
scrollB.shoot()






// display an SVG for debug

let scrollBSVG = new ScrollSVG({ scroll: scrollB, scale: .5 })
scrollBSVG.svg.style.setProperty('top', '20px')
document.body.appendChild(scrollBSVG.svg)








// use an handler to detect some fundamental events (wheel max speed)

export let scrollBHandler = new ScrollHandler('.wrapper-b')

scrollBHandler.on('wheel-increase-speed-y', event => {

	scrollB.velocity = event.speed * 20

})

scrollBHandler.on('wheel-max-speed-y wheel-stop', event => {

	scrollB.shoot()

})


