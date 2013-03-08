
var debug = false;

var Point = function(x, y) {
    Vector.call(this, x, y);
    this.last_pos = new Vector(x, y);
    this.acc = new Vector(0, 0);
}
Point.prototype = new Vector();
Point.prototype.constructor = Point;
Point.prototype.toString = function() {
    return "(" + this.x + ", " + this.y + ") <- " + this.last_pos.toString();
}
Point.prototype.move = function(vect) {
    this.iadd(vect);
}
Point.prototype.accelerate = function(vect) {
    this.acc.iadd(vect);
}
Point.prototype.apply = function(dt) {
  
    this.acc.imul(dt*dt);
            
    next_pos = this.mul(2).sub(this.last_pos).add(this.acc);
    this.last_pos = new Vector(this.x, this.y);

    this.x = next_pos.x;
    this.y = next_pos.y;
    this.acc = new Vector(0, 0)
}
Point.prototype.draw = function(ctx) {
    ctx.fillStyle = 'rgba(128, 128, 128, 1)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2.5, 0, Math.PI*2, false);
    ctx.fill();
}

var FixedPoint = function(x, y) {
    Point.call(this, x, y);
}
FixedPoint.prototype = new Point();
FixedPoint.prototype.constructor = FixedPoint;
FixedPoint.prototype.move = function(vect) { }
FixedPoint.prototype.accelerate = function(vect) { }
FixedPoint.prototype.apply = function(dt) { }


var Constraint = function(p1 ,p2) {
    this.p1 = p1;
    this.p2 = p2;
}
Constraint.prototype = {
    apply: function() {
    },
    draw: function(ctx) {
        ctx.strokeStyle = '#000000';

        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
	ctx.closePath();
        ctx.stroke();
    },
    toString: function() { 
	return this.p1.toString() + " -> " + this.p2.toString();
    }
}

var Distance = function(p1, p2, distance) {
    Constraint.call(this, p1, p2);
    this.dist = distance;
}
Distance.prototype = new Constraint();
Distance.prototype.constructor = Distance;
Distance.prototype.apply = function() {
    var diff = this.p2.sub(this.p1);
    var err = (diff.mag() - this.dist) / 2;
    var v = diff.norm().mul(err);

    this.p1.move(v);
    this.p2.move(v.neg());
}


var Boundry = function(points, axis, value, gt_or_lt) {
    Constraint.call(this, new Vector(0, 0), new Vector(0, 0));

    this.points = points;
    this.value = value;
    
    var xgt = function(p) { 
	if(p.x < this.value) 
	    p.move(new Vector(this.value - p.x, 0)); 
    }
    var xlt = function(p) { 
	if(p.x > this.value) 
	    p.move(new Vector(this.value - p.x, 0)); 
    }
    var ygt = function(p) { 
	if(p.y < this.value) 
	    p.move(new Vector(0, this.value - p.y)); 
    }
    var ylt = function(p) { 
	if(p.y > this.value) 
	    p.move(new Vector(0, this.value - p.y)); 
    }

    if(axis == 'x') {
	if(gt_or_lt == '>') 
	    this.correct = xgt;
	else if(gt_or_lt == '<') 
	    this.correct = xlt;
	this.p1 = new Vector(value, 0);
	this.p2 = new Vector(value, 1000);
    }
    else if(axis == 'y') {
	if(gt_or_lt == '>') 
	    this.correct = ygt;
	else if(gt_or_lt == '<') 
	    this.correct = ylt;
	this.p1 = new Vector(0, value);
	this.p2 = new Vector(1000, value);
    }
}
Boundry.prototype = new Constraint();
Boundry.prototype.constructor = Boundry;
Boundry.prototype.apply = function() {
    for(p in this.points)
	this.correct(this.points[p]);
}

var CircleBoundry = function(points, center, radius, gt_or_lt) {
    this.points = points;
    this.center = center;
    this.radius = radius;
    this.gt_or_lt = gt_or_lt;
}
CircleBoundry.prototype.apply = function() {
    for(p in this.points) {
	var diff = this.center.sub(this.points[p]);
	var mag = diff.mag();
	var dir = diff.norm();
	if((this.gt_or_lt == '>' && mag < this.radius) || 
	   (this.gt_or_lt == '<' && mag > this.radius))
	    this.points[p].move(dir.mul(mag - this.radius))
    }
}
CircleBoundry.prototype.draw = function(ctx) {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI*2, false);
    ctx.closePath();
    ctx.stroke();
}

var Force = function(points) {
    this.points = points
    this.acceleration = new Vector(0,0);
}
Force.prototype.apply = function() { 
    for(p in this.points)
	this.points[p].accelerate(this.acceleration);

}

var Gravity = function(points) {
    Force.call(this, points);
    this.acceleration = new Vector(0, 9.8 * 0.0005);
}
Gravity.prototype = new Force();
Gravity.prototype.constructor = Gravity;

var Simulation = function(points, constraints, forces) {
    this.points = points;
    this.constraints = constraints;
    this.forces = forces;
}
Simulation.prototype.iterate = function(dt) {
    for(var i = 0; i < 15; i++) {
	for(c in this.constraints)
	    this.constraints[c].apply();
    for(f in this.forces)
	this.forces[f].apply();
    for(p in this.points)
	this.points[p].apply(dt);
    }
}
Simulation.prototype.draw = function(ctx) {
    for(c in this.constraints)
	this.constraints[c].draw(ctx);
    for(p in this.points)
	this.points[p].draw(ctx);
}
/**********************************************/

var make_strut = function(sections, size, start) {
    var points = new Array();
	//[new FixedPoint(start.x, start.y),
	//new FixedPoint(start.x, start.y + size)];
    for(i = 0; i < sections; i++) {
	points.push(new Point(start.x + i * size, start.y));
	points.push(new Point(start.x + i * size, start.y + size));
    }

    var constraints = new Array();
    for(i = 0; i < sections - 1; i++) {
	var p = i * 2;
	constraints.push(new Distance(points[p + 0], points[p + 2], size))
        constraints.push(new Distance(points[p + 2], points[p + 3], size))
        constraints.push(new Distance(points[p + 1], points[p + 3], size))
        constraints.push(new Distance(points[p + 0], points[p + 3], 
                                  Math.sqrt(2*size*size)))
    }

    return new Simulation(points, constraints, [new Gravity(points)]);
}

var strutTest = function(ctx) {
    var sim = make_strut(30, 20, new Vector(20, 20));
    sim.constraints.push(new Boundry(sim.points, "y", 480, '<'));
    sim.constraints.push(new Boundry(sim.points, "x", 640, '<'));
    sim.constraints.push(new Boundry(sim.points, "y", 0, '>'));
    sim.constraints.push(new Boundry(sim.points, "x", 0, '>'));

    sim.constraints.push(
	new CircleBoundry(sim.points, new Vector(300, 200), 50.0, ">"));
    sim.constraints.push(
	new CircleBoundry(sim.points, new Vector(100, 200), 50.0, ">"));
    sim.constraints.push(
	new CircleBoundry(sim.points, new Vector(500, 200), 50.0, ">"));
    
    setInterval(function() {
	ctx.clearRect(0, 0, 1000, 1000);
	sim.iterate(1.0);
	sim.draw(ctx);
    }, 10);
}

var mechanicDraw = function(ctx) {
    var p1 = new Point(100, 100);
    var p2 = new Point(200, 200);
    var p3 = new Point(100, 200);
    
    var c1 = new Distance(p1, p2, 100);
    var c2 = new Distance(p2, p3, 100);
    var c3 = new Distance(p3, p1, 100);
    var c4 = new Boundry([p1, p2, p3], 'y', 150, ">");
    var c5 = new Boundry([p1, p2, p3], 'y', 200, "<");
    var c6 = new Boundry([p1, p2, p3], 'x', 150, ">");
    var c7 = new Boundry([p1, p2, p3], 'x', 200, "<");

    var cs = new Array();
    cs.push(c1);
    cs.push(c2);
    cs.push(c3);
    cs.push(c4);
    cs.push(c5);
    cs.push(c6);
    cs.push(c7);

    //interval = setInterval(function() {
    for(i = 0; i < 10; i++) {
	for(c in cs)
	    cs[c].draw(ctx);
	for(c in cs)
	    cs[c].apply();
    }
    //}, 40);
}

var mechanicTest = function(element) {
    element.innerHTML += '<h3>mechanicTest</h3>';

    var p1 = new Point(0, 0);
    var p2 = new Point(2, 0);

    var c = new Distance(p1, p2, 1);
    element.innerHTML += p1.toString();
    element.innerHTML += ' <-->';
    element.innerHTML += p2.toString();
    element.innerHTML += '<br>';

    c.apply();
    element.innerHTML += p1.toString();
    element.innerHTML += ' <--> ';
    element.innerHTML += p2.toString();
    element.innerHTML += '<br>';   
}