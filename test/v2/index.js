// import { Scroll } from '../../src/p-scroll.js'
import { Double, Scroll } from './src/p-scroll.js'
export { Double, Scroll } 

export let scroll = new Scroll(800)

console.log('' + scroll.rootInterval.position)

export let I1 = scroll.interval({ width: '100%' })
I1.on('enter-head1', event => console.log(event))
console.log('' + I1.position)

export let I2 = scroll.interval({ width: '100%' })
console.log('' + I2.position)
