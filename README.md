# p-scroll

Physical Scroll

a low-level Scroll based on a physic model (velocity, friction)

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

## ScrollSVG example:

<svg width="300" height="300" style="width: 100%; z-index: 100;"><g fill="none" stroke="red" transform="translate(20, 20)"><line x1="0" x2="630" y1="0" y2="0"></line><line x1="149.99984627076122" x2="149.99984627076122" y1="-5" y2="5" stroke-width="3"></line><line x1="0" x2="0" y1="-1.5" y2="1.5"></line><line x1="40" x2="40" y1="-1.5" y2="1.5"></line><line x1="50" x2="50" y1="-5" y2="5"></line><line x1="60" x2="60" y1="-1.5" y2="1.5"></line><line x1="100" x2="100" y1="-1.5" y2="1.5"></line><line x1="140" x2="140" y1="-1.5" y2="1.5"></line><line x1="150" x2="150" y1="-5" y2="5"></line><line x1="160" x2="160" y1="-1.5" y2="1.5"></line><line x1="195" x2="195" y1="-1.5" y2="1.5"></line><line x1="200" x2="200" y1="-1.5" y2="1.5"></line><line x1="205" x2="205" y1="-5" y2="5"></line><line x1="215" x2="215" y1="-1.5" y2="1.5"></line><line x1="225" x2="225" y1="-1.5" y2="1.5"></line><line x1="235" x2="235" y1="-5" y2="5"></line><line x1="245" x2="245" y1="-1.5" y2="1.5"></line><line x1="325" x2="325" y1="-1.5" y2="1.5"></line><line x1="335" x2="335" y1="-5" y2="5"></line><line x1="345" x2="345" y1="-1.5" y2="1.5"></line><line x1="450" x2="450" y1="-1.5" y2="1.5"></line><line x1="460" x2="460" y1="-5" y2="5"></line><line x1="470" x2="470" y1="-1.5" y2="1.5"></line><line x1="505" x2="505" y1="-1.5" y2="1.5"></line><line x1="515" x2="515" y1="-5" y2="5"></line><line x1="525" x2="525" y1="-1.5" y2="1.5"></line><line x1="535" x2="535" y1="-1.5" y2="1.5"></line><line x1="545" x2="545" y1="-5" y2="5"></line><line x1="555" x2="555" y1="-1.5" y2="1.5"></line><line x1="610" x2="610" y1="-1.5" y2="1.5"></line><line x1="620" x2="620" y1="-5" y2="5"></line><line x1="630" x2="630" y1="-1.5" y2="1.5"></line><g stroke="red" data-interval="80,120"><line x1="40" x2="60" y1="20" y2="20"></line><line x1="60.00" x2="60.00" y1="15" y2="25"></line></g><g stroke="red" data-interval="280,320" stroke-width="3"><line x1="140" x2="160" y1="20" y2="20"></line><line x1="150.00" x2="150.00" y1="15" y2="25"></line></g><g stroke="red" data-interval="390,430"><line x1="195" x2="215" y1="20" y2="20"></line><line x1="195.00" x2="195.00" y1="15" y2="25"></line></g><g stroke="red" data-interval="450,490"><line x1="225" x2="245" y1="20" y2="20"></line><line x1="225.00" x2="225.00" y1="15" y2="25"></line></g><g stroke="red" data-interval="650,690"><line x1="325" x2="345" y1="20" y2="20"></line><line x1="325.00" x2="325.00" y1="15" y2="25"></line></g><g stroke="red" data-interval="900,940"><line x1="450" x2="470" y1="20" y2="20"></line><line x1="450.00" x2="450.00" y1="15" y2="25"></line></g><g stroke="red" data-interval="1010,1050"><line x1="505" x2="525" y1="20" y2="20"></line><line x1="505.00" x2="505.00" y1="15" y2="25"></line></g><g stroke="red" data-interval="1070,1110"><line x1="535" x2="555" y1="20" y2="20"></line><line x1="535.00" x2="535.00" y1="15" y2="25"></line></g><g stroke="red" data-interval="1220,1260"><line x1="610" x2="630" y1="20" y2="20"></line><line x1="610.00" x2="610.00" y1="15" y2="25"></line></g><g stroke="blue" data-interval="200,400" stroke-width="3"><line x1="100" x2="200" y1="32" y2="32"></line><line x1="150.00" x2="150.00" y1="27" y2="37"></line></g></g></svg>

## build

to run ./build.sh **rollup** and **babel** must have been installed globally

Demo:
[test-es5.html (es5 minified)](http://htmlpreview.github.io/?https://github.com/jniac/p-scroll/blob/master/test/test-es5.html) 

