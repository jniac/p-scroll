import * as scrolljs from '../src/fg-scroll.js'
export { scrolljs }




// creating the scroll

export let scroll = new scrolljs.Scroll()

for (let element of document.querySelectorAll('.wrapper-a .block')) {

	let stop = scroll.stop('+=' + element.offsetHeight)

	element.innerHTML = stop.position

}

scroll.on('update', event => {

	document.querySelector('.wrapper-a .blocks')
		.style.setProperty('transform', `translateY(-${scroll.position}px)`)

})





// display an SVG for debug

let scrollSVG = new scrolljs.ScrollSVG({ scroll, scale: .5 })
document.body.appendChild(scrollSVG.svg)






// use an handler to detect some fundamental events (wheel max speed)

export let scrollHandler = new scrolljs.ScrollHandler('.wrapper-a')

scrollHandler.on('wheel-increase-speed-y', event => {

	scroll.velocity = event.speed * 20

})

scrollHandler.on('wheel-max-speed-y', event => {

	scroll.shoot()

})


