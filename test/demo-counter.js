import { Scroll, ScrollHandler, ScrollSVG } from '../src/p-scroll.js'



const coef = (n, min, max, clamp = true) => (clamp && n < min) ? 0 : (clamp && n > max) ? 1 : (n - min) / (max - min)

const mix = (a, b, ratio) => a + (b - a) * ratio



let years = `

1781 : Joseph Priestley creates water by igniting hydrogen and oxygen.
1800 : William Nicholson and Anthony Carlisle use electrolysis to separate water into hydrogen and oxygen.
1815 : William Prout hypothesizes that all matter is built up from hydrogen, adumbrating the proton.
1838 : Richard Laming hypothesized a subatomic particle carrying electric charge.
1858 : Julius Plücker produced cathode rays.
1874 : George Johnstone Stoney hypothesizes a minimum unit of electric charge. In 1891, he coins the word electron for it.
1886 : Eugene Goldstein produced anode rays.
1897 : J. J. Thomson discovered the electron.
1899 : Ernest Rutherford discovered the alpha and beta particles emitted by uranium.
1900 : Paul Villard discovered the gamma ray in uranium decay.

`.trim().split('\n').map((str, index) => {

	let [year, comment] = str.split(' : ')

	year = parseFloat(year)

	stop = year - 1781 + index * 4

	return { year, comment, stop, index }

})

/* years[n] looks like: 

{
	year: Number,
	stop: Number,
	comment:
}

*/









// init digits

for (let [index, element] of document.querySelectorAll('.counter .digit').entries()) {

	let wrapper = document.createElement('div')
	wrapper.classList.add('wrapper')
	element.appendChild(wrapper)

	for (let i = 0; i < 11; i++) {

		let div = document.createElement('div')
		div.innerHTML = i % 10
		wrapper.appendChild(div)

	}

}










// displaying the suitable digits

function setDate(year) {

	let d0 = year % 10
	let d1 = Math.floor(year / 10) % 10 + coef(year % 10, 10 - 1, 10)
	let d2 = Math.floor(year / 100) % 10 + coef(year % 100, 100 - 1, 100)
	let d3 = Math.floor(year / 1000) % 10 + coef(year % 1000, 1000 - 1, 1000)

	let digits = document.querySelectorAll('.counter .digit .wrapper')

	let a = [d3, d2, d1, d0]

	a.forEach((d, i) => {

		digits[i].style.transform = `translateY(${-d}em)`

	})

}









// set the scroll

let scroll = new Scroll()

years.forEach((date, i) => {

	// change body color and update comment
	scroll.stop(date.stop)
		.toInterval({ offset: 3, tags: 'year' })
			.on('enter', event => {

				document.body.style['background-color'] = `hsl(${(360 * Math.random()).toFixed(0)},50%,80%)`

				let comment = document.querySelector('.comment')

				comment.classList.add('hidden')

				setTimeout(() => {

					comment.innerHTML = date.comment
					comment.classList.remove('hidden')

				}, 200)

			})
			// .on(/./, event => {

			// 	if (event.type === 'update')
			// 		console.log(`${date.index}`, event.type)
			// 	else
			// 		console.log(`${date.index} - ${scroll.frame}`, event.type)

			// })

	// interpolate years
	if (i) {

		let prev = years[i - 1]

		scroll.interval({ min: prev.stop, max: date.stop })
			.on('update', event => {

				let year = mix(prev.year, date.year, event.target.local)

				setDate(year)

			})

	}

})







// create an handler to detect fundamental events (mouse wheel increase phase, break)

let handler = new ScrollHandler('body')
handler.on('wheel-increase-speed-y', event => {

	scroll.velocity = event.speed

})

handler.on('wheel-max-speed-y wheel-stop', event => {

	// scroll will automatically scroll to the most suitable stop 
	// (depending on velocity & available stops)
	scroll.shoot()

})

// debug

let scrollSVG = new ScrollSVG({ scroll: scroll, scale: 7, color: '#333' })
document.body.appendChild(scrollSVG.svg)









// expose variables globally
Object.assign(window, {

	scroll,

})



	