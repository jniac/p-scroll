import { Scroll, ScrollHandler, ScrollSVG } from '../src/p-scroll.js'
// import { Scroll, ScrollHandler, ScrollSVG } from '../build/p-scroll.module.js'






// creating the scroll

export let scrollA = new Scroll()

for (let element of document.querySelectorAll('.wrapper-a .block')) {

	let stop = scrollA.stop('+=' + element.offsetHeight)

	element.innerHTML = stop.position

}

scrollA.on('update', event => {

	document.querySelector('.wrapper-a .blocks')
		.style.setProperty('transform', `translateY(${(-scrollA.position).toFixed(2)}px)`)

})







// display an SVG for debug

let scrollASVG = new ScrollSVG({ scroll: scrollA, scale: .5 })
document.body.appendChild(scrollASVG.svg)








// use an handler to detect some fundamental events (wheel max speed)

export let scrollAHandler = new ScrollHandler('.wrapper-a')

scrollAHandler.on('wheel-increase-speed-y', event => {

	scrollA.velocity = event.speed * 20

})

scrollAHandler.on('wheel-max-speed-y wheel-stop', event => {

	scrollA.shoot()

})


