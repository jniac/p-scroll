import * as PScroll from '../src/p-scroll.js'
export { PScroll }







// creating the scroll

export let scrollA = new PScroll.Scroll()

for (let element of document.querySelectorAll('.wrapper-a .block')) {

	let stop = scrollA.stop('+=' + element.offsetHeight)

	element.innerHTML = stop.position

}

scrollA.on('update', event => {

	document.querySelector('.wrapper-a .blocks')
		.style.setProperty('transform', `translateY(${(-scrollA.position).toFixed(2)}px)`)

})







// display an SVG for debug

let scrollASVG = new PScroll.ScrollSVG({ scroll: scrollA, scale: .5 })
document.body.appendChild(scrollASVG.svg)








// use an handler to detect some fundamental events (wheel max speed)

export let scrollAHandler = new PScroll.ScrollHandler('.wrapper-a')

scrollAHandler.on('wheel-increase-speed-y', event => {

	scrollA.velocity = event.speed * 20

})

scrollAHandler.on('wheel-max-speed-y wheel-stop', event => {

	scrollA.shoot()

})


