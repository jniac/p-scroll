#!/bin/bash

rollup src/p-scroll.js --output.format iife --name PScroll | babel --es2015 -o build/p-scroll.js

rollup src/p-scroll.js --output.format iife --name PScroll | babel --es2015 | babili -o build/p-scroll.min.js
