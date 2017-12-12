
class Value {

	constructor(value = 0) {

		this.value_old = value
		this.value = value

	}

	reset(value) {

		this.value_old = 
		this.value = value

	}

	newValue(value) {

		this.value_old = this.value
		this.value = value

	}

	newValueIncrement(value) {

		this.value_old = this.value
		this.value += value

	}

	/**
	 * Check if the variable's value move across a threshold
	 * Return a Number (that could be used as a Boolean):
	 *     -1 if the variable has dropped below the threshold
	 * 	   +1 if the variable passed above the threshold
	 *      0 if the variable remained below or above the threshold
	 */
	through(threshold) {

		let d = this.value - threshold
		let d_old = this.value_old - threshold

		return d >= 0 && d_old < 0 ? 1 : d <= 0 && d_old > 0 ? -1 : 0

	}

}

export class Variable extends Value {

	constructor(value = 0, nDerivative = 1, variableLength = 10) {

		super(value)

		this.variableLength = variableLength

		this.index = 0
		this.values = []

		this.sum = new Value()
		this.average = new Value()
		this.growth = new Value()

		this.reset(value)

		if (nDerivative)
			this.derivative = new Variable(0, nDerivative - 1, variableLength)

	}

	getValues() {

		return this.values.slice(this.index).concat(this.values.slice(0, this.index))

	}

	reset(value) {

		super.reset(value)

		this.index = 0

		this.sum.reset(value * this.variableLength)
		this.average.reset(value)
		this.growth.reset(1)

		for (let i = 0; i < this.variableLength; i++)
			this.values[i] = value

		return this

	}

	newValue(value) {

		super.newValue(value)

		this.sum.newValueIncrement(-this.values[this.index] + this.value)
		this.average.newValue(this.sum.value / this.variableLength)
		this.growth.newValue(this.value / this.value_old)

		this.values[this.index] = value
		this.index = (this.index + 1) % this.variableLength

		if (this.derivative)
			this.derivative.newValue(this.value - this.value_old)

		return this

	}

}
