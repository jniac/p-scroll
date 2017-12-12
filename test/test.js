import * as PScroll from '../src/p-scroll.js'
import * as testA from './test-a.js'
import * as testB from './test-b.js'



// exposing the local variables globally

Object.assign(window, testA, testB, PScroll)
