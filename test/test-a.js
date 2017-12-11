import * as scrolljs from '../src/fg-scroll.js'
export { scrolljs }

export let scroll = new scrolljs.Scroll()

scroll.stop(0)
scroll.stop(100)
scroll.stop(140)
scroll.stop(-10)
scroll.trigger(110)

console.log(scroll.stops.map(v => v.position))


export let scrollSVG = new scrolljs.ScrollSVG().feed(scroll)
document.body.appendChild(scrollSVG.svg)

