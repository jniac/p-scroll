#!/bin/bash

rollup src/p-scroll.js --output.format es -o build/p-scroll.module.js

rollup build/p-scroll.module.js --output.format iife --name PScroll | babel --es2015 -o build/p-scroll.js

rollup build/p-scroll.module.js --output.format iife --name PScroll | babel --es2015 | babili -o build/p-scroll.min.js



# test

rollup test/test.js --output.format iife | babel --es2015 -o test/test-es5.js
rollup test/demo-counter.js --output.format iife | babel --es2015 -o test/demo-counter-es5.js
