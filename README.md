# p-scroll

Physical Scroll

a scroll based on a physic model (velocity, friction)

basic usage:

```javascript
import { Scroll, ScrollHandler, ScrollSVG } from './build/p-scroll.module.js'

let scroll = new Scroll()
scrollB.friction = .0001 // .001

// use a debug svg (to render the scroll timeline)
let scrollSVG = new ScrollSVG({ scroll: scrollB, scale: .5 })
scrollSVG.svg.style['z-index'] = 1000
document.body.appendChild(scrollSVG.svg)

let handler = new ScrollHandler('.a div.selector')
handler.on('wheel-increase-speed-y', event => {

	scrollB.velocity = event.speed * 20

})

handler.on('wheel-max-speed-y wheel-stop', event => {

	scrollB.shoot()

})


```




## build

to run ./build.sh **rollup** and **babel** must have been installed globally

Demo:
[test-es5.html (es5 minified)](http://htmlpreview.github.io/?https://github.com/jniac/p-scroll/blob/master/test/test-es5.html) 

