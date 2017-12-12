import { Scroll, ScrollHandler, ScrollSVG } from '../src/p-scroll.js'


const coef = (n, min, max, clamp = true) => (clamp && n < min) ? 0 : (clamp && n > max) ? 1 : (n - min) / (max - min)

const mix = (a, b, ratio) => a + (b - a) * ratio



let years = `

1815 – William Prout hypothesizes that all matter is built up from hydrogen, adumbrating the proton;
1838 – Richard Laming hypothesized a subatomic particle carrying electric charge;
1858 – Julius Plücker produced cathode rays;
1874 – George Johnstone Stoney hypothesizes a minimum unit of electric charge. In 1891, he coins the word electron for it;
1886 – Eugene Goldstein produced anode rays;
1897 – J. J. Thomson discovered the electron;
1899 – Ernest Rutherford discovered the alpha and beta particles emitted by uranium;
1900 – Paul Villard discovered the gamma ray in uranium decay.

`.trim().split('\n').map(str => {

	let [year, comment] = str.split(' – ')

	year = parseFloat(year)

	stop = year - 1815

	return { year, comment, stop }

})









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

export function setDate(year) {

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









//

export let scroll = new Scroll()

years.forEach((date, i) => {

	scroll.stop(date.stop)
		.toInterval({ offset: 1 })
			.on('enter', event => {

				let comment = document.querySelector('.comment')

				comment.innerHTML = date.comment

			})
			.on('exit', event => {

				console.log(event.target)

			})

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

	scroll.shoot() // scroll will automatically scroll to the most suitable stop (depending on velocity & available stops)

})

// debug

let scrollSVG = new ScrollSVG({ scroll: scroll, scale: 10 })
document.body.appendChild(scrollSVG.svg)







	