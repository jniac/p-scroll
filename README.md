# p-scroll

Physical Scroll

a low-level Scroll based on a physic model (velocity, friction)

Demo: [test-es5.html (es5, minified)](http://htmlpreview.github.io/?https://github.com/jniac/p-scroll/blob/master/test/test-es5.html) 

basic usage:

```javascript
import { Scroll, ScrollHandler, ScrollSVG } from './build/p-scroll.module.js'




// the Scroll

let scroll = new Scroll()
scroll.friction = .0001 // 1e-3 by default (.001)
scroll.stop(1000) // add a stop @ position 1000
scroll.interval({ min: 0, max: 1000 })
	.on('update', event => {

		myElement.style.opacity = event.target.local

	})
	.on(/enter|exit/, event => {

		myElement.classList.toggle('myClass', event.target.state === 0)

	})





// use a debug svg (to render the scroll timeline)

let scrollSVG = new ScrollSVG({ scroll: scroll, scale: .5 })
scrollSVG.svg.style['z-index'] = 1000 // 100 by default
document.body.appendChild(scrollSVG.svg)





// create an handler to detect fundamental events (mouse wheel increase phase, break)

let handler = new ScrollHandler('.a div.selector')
handler.on('wheel-increase-speed-y', event => {

	scroll.velocity = event.speed * 20

})

handler.on('wheel-max-speed-y wheel-stop', event => {

	scroll.shoot() // scroll will automatically scroll to the most suitable stop (depending on velocity & available stops)

})





// once everything is done

scroll.clear() // remove all stops and intervals from scroll


```

## build

to run ./build.sh **rollup** and **babel** must have been installed globally
```
npm i -g rollup
npm i -g babel
```
