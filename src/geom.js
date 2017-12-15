
export function moveTowards(x, y, targetX, targetY, distance) {

		let a = Math.atan2(targetY - y, targetX - x)

		return [x + distance * Math.cos(a), y + distance * Math.sin(a)]

}

export function pointMoveTowards(point, target, distance) {

		let a = Math.atan2(target.y - point.y, target.x - point.x)

		return new Point(point.x + distance * Math.cos(a), point.y + distance * Math.sin(a))

}

export function triangeIsDirect(ax, ay, bx, by, cx, cy) {

	return (bx - ax) * (cy - ay) - (by - ay) * (cy - ay) >= 0

}

/**
 * A point is inside a triangle if he is always on the same side (left or right) of each triangle's side (AB, BC, CA)
 * if det > 0: ABC is direct (counterclockwise) 
 * else: ABC is indirect (clockwise)

 * op - : 20
 * op * : 11
 */
export function triangleContains(ax, ay, bx, by, cx, cy, x, y) {

	let det = (bx - ax) * (cy - ay) - (by - ay) * (cy - ay)

	return  det * ((bx - ax) * (y - ay) - (by - ay) * (x - ax)) > 0 &&
			det * ((cx - bx) * (y - by) - (cy - by) * (x - bx)) > 0 &&
			det * ((ax - cx) * (y - cy) - (ay - cy) * (x - cx)) > 0	

}

export function quadContains(ax, ay, bx, by, cx, cy, dx, dy, x, y) {

	let det = (bx - ax) * (cy - ay) - (by - ay) * (cy - ay)

	return  det * ((bx - ax) * (y - ay) - (by - ay) * (x - ax)) > 0 &&
			det * ((cx - bx) * (y - by) - (cy - by) * (x - bx)) > 0 &&
			det * ((dx - cx) * (y - cy) - (dy - cy) * (x - cx)) > 0	&&
			det * ((ax - dx) * (y - dy) - (ay - dy) * (x - dx)) > 0

}

/**
 * op - : 18
 * op * : 10
 */
export function triangleContains2() {

	let abx = bx - ax
	let aby = by - ay

	let acx = cx - ax
	let acy = cy - ay

	let apx = x - ax
	let apy = y - ay

	let bpx = x - bx
	let bpy = y - by

	// det AP.AB * det AP.AC > 0 AND
	// det BP.BC * det BP.BA > 0
	return  (apx * aby - apy * abx) * (apx * acy - apy * acx) < 0 &&
			(bpx * (cy - by) - bpy * (cx - bx)) * (((x - bx) * -aby - (y - by) * -abx)) < 0

}

export function sectorContains(cx, cy, radius, angleStart, angleEnd, x, y) {

	let dx = cx - x
	let dy = cy - y

	if (dx * dx + dy * dy > radius * radius)
		return false

	let detStart = dx * Math.sin(angleStart * Math.PI / 180) - dy * Math.cos(angleStart * Math.PI / 180)
	let detEnd = dx * Math.sin(angleEnd * Math.PI / 180) - dy * Math.cos(angleEnd * Math.PI / 180)

	return angleEnd - angleStart < 180 ?
		detStart > 0 && detEnd < 0 : 
		detStart > 0 || detEnd < 0

}

/**
 * A line is defined by two pairs of coordinates (P, V), 
 * P is the origin of the line,
 * V is the direction of the line.
 * 
 * k1 = det(v2, p2p1) / det(v1,v2)
 * k2 = det(v1, p1p2) / det(v2,v1)
 */
export function intersectionLineLine(px1, py1, vx1, vy1, px2, py2, vx2, vy2) {

	// vector director determinant (v1, v2)
	let det = vx1 * vy2 - vy1 * vx2

	if (det === 0)
		return null

	let px = px2 - px1
	let py = py2 - py1

	let k1 = -(vx2 * py - vy2 * px) / det
	let k2 = (vx1 * py - vy1 * px) / -det

	return { k1, k2, point: new Point(px1 + vx1 * k1, py1 + vy1 * k1) }

}

export function intersectionLineCircle(px, py, vx, vy, cx, cy, r) {

	let a = vx * vx + vy * vy
	let b = 2 * px * vx - 2 * vx * cx + 2 * py * vy - 2 * vy * cy
	let c = px * px + py * py + cx * cx + cy * cy - 2 * px * cx - 2 * py * cy - r * r

	let d = Math.sqrt(b * b - 4 * a * c)

	if (isNaN(d))
		return null

	let k1 = (-b - d) / (2 * a)
	let k2 = (-b + d) / (2 * a)

	let P1 = new Point(px + vx * k1, py + vy * k1)
	let P2 = new Point(px + vx * k2, py + vy * k2)

	let N1 = P1.clone().offset(-cx, -cy).normalize()
	let N2 = P2.clone().offset(-cx, -cy).normalize()

	return { k1, k2, points:[P1, P2], normals:[N1, N2] }

}

export function decomposeUV(src, dest) {

	dest = dest.clone().normalize()

	let dot = src.x * dest.x + src.y * dest.y
	let det = src.x * dest.y - src.y * dest.x

	return {

		u: new Point(dest.x * dot, dest.y * dot),
		v: new Point(dest.y * det, -dest.x * det),

	}

}




























export class Point {

	static ensure(value) {

		if (value instanceof Point)
			return value

		return new Point().set(value)

	}

	constructor(x = 0, y = 0) {

		this.x = x
		this.y = y

	}

	setXY(x, y) {

		this.x = x
		this.y = y

		return this

	}

	getLength() {

		return Math.sqrt(this.x * this.x + this.y * this.y)

	}

	get length() { return this.getLength() }

	offset(x, y) {

		this.x += x
		this.y += y

		return this

	}

	normalize() {

		let length = this.getLength()

		this.x /= length
		this.y /= length

		return this

	}

	clone() {

		return new Point(this.x, this.y)

	}

	set(...args) {

		if (args.length === 1) {

			if (args[0] instanceof Array && args[0].length == 2) {

				[this.x, this.y] = args[0]

			}
			
			if (args[0].hasOwnProperty('x') && args[0].hasOwnProperty('y')) {

				this.x = args[0].x
				this.y = args[0].y

			}

			if (args[0].hasOwnProperty('length') && args[0].hasOwnProperty('angle')) {

				let { length, angle } = args[0]

				angle *= Math.PI / 180

				this.x = length * Math.cos(angle)
				this.y = length * Math.sin(angle)

			}

		}

		if (args.length === 2) {

			[this.x, this.y] = args

		}

		return this

	}

	add(other, scalar = 1) {

		this.x += other.x * scalar
		this.y += other.y * scalar

		return this

	}

	draw(ctx, { color = 'black', shape = 'cross', crossSize = 4, dotSize = 6 } = {}) {

		ctx.closePath()

		if (shape === 'cross') {

			ctx.moveTo(this.x - crossSize, this.y)
			ctx.lineTo(this.x + crossSize, this.y)
			ctx.moveTo(this.x, this.y - crossSize)
			ctx.lineTo(this.x, this.y + crossSize)

			ctx.strokeStyle = color
			ctx.stroke()

		} else if (shape === 'dot') {

			ctx.ellipse(this.x, this.y, dotSize / 2, dotSize / 2, 0, 0, 2 * Math.PI)
			ctx.fillStyle = color
			ctx.fill()

		}

		ctx.beginPath()

		return this

	}

	toCircle(radius) {

		return new Circle(this.x, this.y, radius)

	}

}



export const LineType = {

	LINE: 0,
	RAY: 1,
	SEGMENT: 2,

}

export class Line {

	constructor(px = 0, py = 0, vx = 1, vy = 0, type = LineType.LINE) {

		this.px = px
		this.py = py
		this.vx = vx
		this.vy = vy
		this.type = type

	}

	intersection(other) {

		let I = intersectionLineLine(this.px, this.py, this.vx, this.vy, other.px, other.py, other.vx, other.vy)

		if (!I)
			return null

		if (this.type === LineType.RAY && I.k1 < 0 || this.type === LineType.SEGMENT && (I.k1 < 0 || I.k1 > 1))
			return null

		if (other.type === LineType.RAY && I.k2 < 0 || other.type === LineType.SEGMENT && (I.k2 < 0 || I.k2 > 1))
			return null

		return I

	}

	reflection(other) {

		let I = this.intersection(other)

		if (!I)
			return null

		let uv = decomposeUV(this.V, other.V)

		return new Line(I.point.x, I.point.y, uv.u.x - uv.v.x, uv.u.y - uv.v.y)

	}

	intersectionWithAABB(aabb) {

		let I, a = []
		
		I = intersectionLineLine(this.px, this.py, this.vx, this.vy, aabb.ax, aabb.ay, aabb.bx - aabb.ax, 0)

		if (I.k2 >= 0 && I.k2 <= 1)
			a.push(I)

		I = intersectionLineLine(this.px, this.py, this.vx, this.vy, aabb.ax, aabb.ay, 0, aabb.by - aabb.ay)

		if (I.k2 >= 0 && I.k2 <= 1)
			a.push(I)

		I = intersectionLineLine(this.px, this.py, this.vx, this.vy, aabb.bx, aabb.by, aabb.ax - aabb.bx, 0)

		if (I.k2 >= 0 && I.k2 <= 1)
			a.push(I)

		I = intersectionLineLine(this.px, this.py, this.vx, this.vy, aabb.bx, aabb.by, 0, aabb.ay - aabb.by)

		if (I.k2 >= 0 && I.k2 <= 1)
			a.push(I)

		return a.sort((A, B) => A.k1 - B.k1).filter(I => this.type === LineType.LINE ? true : this.type === LineType.RAY ? I.k1 >= 0 : (I.k1 >= 0 && I.k1 <= 1))

	}

	get P() { return new Point(this.px, this.py) }
	set P(value) { value = Point.ensure(value); this.px = value.x; this.py = value.y }

	get V() { return new Point(this.vx, this.vy) }
	set V(value) { value = Point.ensure(value); this.vx = value.x; this.vy = value.y }

	get P2() { return new Point(this.px + this.vx, this.py + this.vy) }
	set P2(value) { value = Point.ensure(value); this.vx = value.x - this.px; this.vy = value.y - this.py }

	draw(ctx, { color = '#000', size = 6, aabb = null } = {}) {

		ctx.beginPath()

		if (aabb) {

			let [I1, I2] = this.intersectionWithAABB(aabb)

			ctx.moveTo(I1.point.x, I1.point.y)
			ctx.lineTo(I2.point.x, I2.point.y)

		} else {

			ctx.moveTo(this.px, this.py)
			ctx.lineTo(this.px + this.vx, this.py + this.vy)

		}

		let v = this.V.normalize()
		ctx.moveTo(this.px + v.y * size, this.py - v.x * size)
		ctx.lineTo(this.px - v.y * size, this.py + v.x * size)
		ctx.moveTo(this.px + this.vx + v.y * size - v.x * size, this.py + this.vy - v.x * size - v.y * size)
		ctx.lineTo(this.px + this.vx, this.py + this.vy)
		ctx.lineTo(this.px + this.vx - v.y * size - v.x * size, this.py + this.vy + v.x * size - v.y * size)

		ctx.strokeStyle = color
		ctx.stroke()

		ctx.beginPath()

		return this
		
	}

}


















export class Shape {

	containsXY() { return false }

	contains(p) { return this.containsXY(p.x, p.y) }

	draw(ctx, stroke = 'black', fill = null) {

		ctx.closePath()

		if (fill) {

			ctx.fillStyle = fill
			ctx.fill()

		}

		if (stroke) {

			ctx.strokeStyle = stroke
			ctx.stroke()

		}

		ctx.beginPath()

		return this

	}

}



/**
 * 
 * AABB: Axis-Aligned minimum Bounding Box.
 * 
 * see: https://en.wikipedia.org/wiki/Minimum_bounding_box#Axis-aligned_minimum_bounding_box
 *
 */
export class AABB extends Shape {
	
	constructor(ax = 0, ay = 0, bx = 1, by = 1) {

		super()

		this.ax = ax
		this.ay = ay
		this.bx = bx
		this.by = by

	}

	set(ax, ay, bx, by) {

		this.ax = ax
		this.ay = ay
		this.bx = bx
		this.by = by

		return this

	}

	inflate(delta) {

		this.ax -= delta
		this.ay -= delta
		this.bx += delta
		this.by += delta

		return this

	}

	containsXY(x, y) {

		return x >= this.ax && x <= this.bx && y >= this.ay && y <= this.by

	}

	draw(ctx, stroke = 'black', fill = null) {

		ctx.beginPath()
		ctx.rect(this.ax, this.ay, this.bx - this.ax, this.by - this.ay)

		super.draw(ctx, stroke, fill)

		return this

	}

}





export class Circle extends Shape {

	constructor(x, y, radius) {

		super()

		this.x = x
		this.y = y
		this.radius = radius

	}

	containsXY(x, y) {

		return (x += -this.x) * x + (y += -this.y) * y <= this.radius * this.radius

	}

	draw(ctx, stroke = 'black', fill = null) {

		ctx.beginPath()
		ctx.ellipse(this.x, this.y, this.radius, this.radius, 0, 0, 2 * Math.PI)

		super.draw(ctx, stroke, fill)

		return this

	}

}





export class Triangle extends Shape {

	constructor(ax = 0, ay = 0, bx = 0, by = 0, cx = 0, cy = 0) {

		super()

		this.ax = ax
		this.ay = ay
		this.bx = bx
		this.by = by
		this.cx = cx
		this.cy = cy

	}

	get direct() { return triangeIsDirect(this.ax, this.ay, this.bx, this.by, this.cx, this.cy) }

	offset(x, y) {

		this.ax += x
		this.ay += y
		this.bx += x
		this.by += y
		this.cx += x
		this.cy += y

		return this

	}

	// https://en.wikipedia.org/wiki/Centroid#Of_triangle_and_tetrahedron

	getCentroid() {

		let x = (this.ax + this.bx + this.cx) / 3
		let y = (this.ay + this.by + this.cy) / 3

		return new Point(x, y)

	}

	setCentroidXY(x, y) {

		let c = this.getCentroid()

		this.offset(x - c.x, y - c.y)

		return this

	}

	containsXY(x, y) {

		return triangleContains(this.ax, this.ay, this.bx, this.by, this.cx, this.cy, x, y)

	}

	get A() { return new Point(this.ax, this.ay) }
	set A(value) { value = Point.ensure(value); this.ax = value.x; this.ay = value.y }

	get B() { return new Point(this.bx, this.by) }
	set B(value) { value = Point.ensure(value); this.bx = value.x; this.by = value.y }

	get C() { return new Point(this.cx, this.cy) }
	set C(value) { value = Point.ensure(value); this.cx = value.x; this.cy = value.y }

	inflate(q) {

		let centroid = this.getCentroid()

		this.A = pointMoveTowards(this.A, centroid, -q)
		this.B = pointMoveTowards(this.B, centroid, -q)
		this.C = pointMoveTowards(this.C, centroid, -q)

		return this

	}

	draw(ctx, stroke = 'black', fill = null) {

		ctx.beginPath()
		ctx.moveTo(this.ax, this.ay)
		ctx.lineTo(this.bx, this.by)
		ctx.lineTo(this.cx, this.cy)

		super.draw(ctx, stroke, fill)

		return this

	}

}





export class Quad extends Shape {

	constructor(ax = 0, ay = 0, bx = 0, by = 0, cx = 0, cy = 0, dx = 0, dy = 0) {

		super()

		this.ax = ax
		this.ay = ay
		this.bx = bx
		this.by = by
		this.cx = cx
		this.cy = cy
		this.dx = dx
		this.dy = dy

	}

	containsXY(x, y) {

		return quadContains(this.ax, this.ay, this.bx, this.by, this.cx, this.cy, this.dx, this.dy, x, y)

	}

	offset(x, y) {

		this.ax += x
		this.ay += y
		this.bx += x
		this.by += y
		this.cx += x
		this.cy += y
		this.dx += x
		this.dy += y

		return this

	}

	getCentroid() {

		let x = (this.ax + this.bx + this.cx + this.dx) / 4
		let y = (this.ay + this.by + this.cy + this.dy) / 4

		return new Point(x, y)

	}

	setCentroidXY(x, y) {

		let c = this.getCentroid()

		this.offset(x - c.x, y - c.y)

		return this

	}

	get A() { return new Point(this.ax, this.ay) }
	set A(value) { value = Point.ensure(value); this.ax = value.x; this.ay = value.y }

	get B() { return new Point(this.bx, this.by) }
	set B(value) { value = Point.ensure(value); this.bx = value.x; this.by = value.y }

	get C() { return new Point(this.cx, this.cy) }
	set C(value) { value = Point.ensure(value); this.cx = value.x; this.cy = value.y }

	get D() { return new Point(this.dx, this.dy) }
	set D(value) { value = Point.ensure(value); this.dx = value.x; this.dy = value.y }

	inflate(q) {

		let centroid = this.getCentroid()

		this.A = pointMoveTowards(this.A, centroid, -q)
		this.B = pointMoveTowards(this.B, centroid, -q)
		this.C = pointMoveTowards(this.C, centroid, -q)
		this.D = pointMoveTowards(this.D, centroid, -q)

		return this

	}

	draw(ctx, stroke = 'black', fill = null) {

		ctx.beginPath()
		ctx.moveTo(this.ax, this.ay)
		ctx.lineTo(this.bx, this.by)
		ctx.lineTo(this.cx, this.cy)
		ctx.lineTo(this.dx, this.dy)

		super.draw(ctx, stroke, fill)

		ctx.beginPath()
		ctx.moveTo(this.bx, this.by)
		ctx.lineTo(this.dx, this.dy)

		super.draw(ctx, stroke)

		return this

	}

}





export class Sector extends Shape {

	constructor(x, y, radius, angleStart, angleEnd) {

		super()

		this.x = x
		this.y = y
		this.radius = radius
		this.angleStart = angleStart
		this.angleEnd = angleEnd

	}

	containsXY(x, y) {

		return sectorContains(this.x, this.y, this.radius, this.angleStart, this.angleEnd, x, y)

	}

	get opening() { return (this.angleEnd - this.angleStart) / 360 }
	set opening(value) {

		let angle = (this.angleEnd + this.angleStart) / 2

		this.angleStart = angle - value * 180
		this.angleEnd = angle + value * 180

		return this

	}

	draw(ctx, stroke = 'black', fill = null) {

		ctx.beginPath()
		ctx.ellipse(this.x, this.y, this.radius, this.radius, 0, this.angleStart * Math.PI / 180, this.angleEnd * Math.PI / 180)
		ctx.lineTo(this.x, this.y)

		super.draw(ctx, stroke, fill)

		return this

	}

}



















