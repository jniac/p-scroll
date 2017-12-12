import * as PScroll from '../src/p-scroll.js'
export { PScroll }




// creating the scroll

export let scroll = new PScroll.Scroll()

for (let element of document.querySelectorAll('.wrapper-a .block')) {

	let stop = scroll.stop('+=' + element.offsetHeight)

	element.innerHTML = stop.position

}

scroll.on('update', event => {

	document.querySelector('.wrapper-a .blocks')
		.style.setProperty('transform', `translateY(-${scroll.position}px)`)

})





// display an SVG for debug

let scrollSVG = new PScroll.ScrollSVG({ scroll, scale: .5 })
document.body.appendChild(scrollSVG.svg)






// use an handler to detect some fundamental events (wheel max speed)

export let scrollHandler = new PScroll.ScrollHandler('.wrapper-a')

scrollHandler.on('wheel-increase-speed-y', event => {

	scroll.velocity = event.speed * 20

})

scrollHandler.on('wheel-max-speed-y', event => {

	scroll.shoot()

})


