
var debug = false;

var Triangle = function(p1, p2, p3) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.colour = '#AAAAAA';
    this.effect = function(b) {};
}
Triangle.prototype.draw = function(ctx) {
    ctx.fillStyle = this.colour;
    ctx.beginPath();
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.lineTo(this.p3.x, this.p3.y);
    ctx.closePath();
    ctx.fill();
}
Triangle.prototype.pointIn = function(p) {
    return p.inTriangle(this.p1, this.p2, this.p3);
}

var Rectangle = function(p1, p2) {
    this.min = new Vector(Math.min(p1.x, p2.x),
			  Math.min(p1.y, p2.y));
    this.max = new Vector(Math.max(p1.x, p2.x),
			  Math.max(p1.y, p2.y));
    this.effect = function(b) {};
    this.colour = '#AAAAAA';
}
Rectangle.prototype.draw = function(ctx) {
    ctx.fillStyle = this.colour;
    ctx.beginPath();
    ctx.moveTo(this.min.x, this.min.y);
    ctx.lineTo(this.min.x, this.max.y);
    ctx.lineTo(this.max.x, this.max.y);
    ctx.lineTo(this.max.x, this.min.y);
    ctx.closePath();
    ctx.fill();
}
Rectangle.prototype.pointIn = function(p) {
    return p.inRectangle(this.min, this.max);
}

var Boid = function(x, y) {
    this.pos = new Vector(x, y);
    this.v = new Vector(1 - 2 * Math.random(), 
			1 - 2 * Math.random());
    this.v.norm();
    this.speed = 1;
    this.turn = 0.0625;
    this.att = 55;
    this.ali = 45;
    this.rep = 25;
    this.exc = 5;
    this.view = 3 * Math.PI / 4;

    this.done = false;
    this.alive = true;
}
Boid.prototype.toString = function() {
    return this.pos.toString() + ' -> ' + this.v.toString();
}
Boid.prototype.iterate = function(boids, self_idx, shapes) {
    var i, diff, mag, dir, 
    att = new Vector(0,0), natt = 0;
    ali = new Vector(0,0), nali = 0;
    rep = new Vector(0,0), nrep = 0;
    ctrl = new Vector(0,0), ctrled = false,
    total = new Vector(0,0);
    nboids = boids.length,
    cont = false;;

    if(!this.alive) return;

    for(i in shapes)
	if(shapes[i].pointIn(this.pos))
	    shapes[i].effect(this);

    for(i = 0; i < nboids; ++i) {
    	if(i == self_idx || !boids[i].alive) continue;
    	diff = this.pos.sub(boids[i].pos)
	dir = diff.norm();
	mag = diff.mag()

	if(boids[i] instanceof ControlBoid) {
	    if(mag < boids[i].radius) {
		ctrl = dir.mul(boids[i].radius / mag);
		ctrled = true;
	    }
	    cont = true;
	}

	if(mag < this.exc + boids[i].exc) {
	    if(mag == 0)
		this.pos.iadd((new Vector(1 - 2 * Math.random(), 
					  1 - 2 * Math.random()))
			      .norm().mul(this.exc));
	    else 
    		this.pos.iadd(dir.mul(this.exc + boids[i].exc - mag));
	    cont = true;
	}

	if(cont) { cont = false; continue; }

	if(Math.abs(this.v.angle_between(diff)) < this.view) {
	    if(mag < this.rep) {
		rep.iadd(boids[i].pos);
		nrep++;
	    }
	    else if(mag < this.ali) {
		ali.iadd(boids[i].v);
		nali++;
	    }
	    else if(mag < this.att) {
		att.iadd(boids[i].pos);
		natt++;
	    }
	}
    }

    if(nrep) rep = rep.div(nrep).sub(this.pos).norm().neg();
    if(nali) ali = ali.norm();
    if(natt) att = att.div(natt).sub(this.pos).norm();

    if(isNaN(rep.x)) alert('Rep: ' + this.toString() + rep.toString());
    if(isNaN(ali.x)) alert('Ali: ' + this.toString() + ali.toString());
    if(isNaN(att.x)) alert('Att: ' + this.toString() + att.toString());
    if(isNaN(ctrl.x)) alert('Ctrl: ' + this.toString() + ctrl.toString());

    if(nali || natt || nrep || ctrled) {
	total.iadd(rep);
	total.iadd(ali);
	total.iadd(att);
	total.iadd(ctrl);
	var tot_bup = new Vector(total.x, total.y);
	total.inorm();
	total.imul(this.turn);
	if(isNaN(total.x)) 
	    alert('Total: ' + this.toString() +  ' : ' +
		  tot_bup.toString() + 
		  nrep + ', ' + nali + ',' + natt + ',' + ctrled + 
		  rep + ', ' + ali + ',' + att + ',' + ctrl);
	this.v.iadd(total);
	if(isNaN(this.v.x)) alert('V: ' + this.toString());
	this.speed = Math.max(1, ctrl.mag()) / 
	    Math.min(3, Math.max(1, nali + natt + nrep));
    }
    else {
    	this.v.iadd((new Vector(1 - 2 * Math.random(), 
    				1 - 2 * Math.random()))
    		    .norm().mul(this.turn));
	this.speed = 1;
    }

    this.v.inorm();

    if(this.pos.x > 640) this.v.x = -1;
    if(this.pos.x < 0) this.v.x = 1;
    if(this.pos.y > 480) this.v.y = -1;
    if(this.pos.y < 0) this.v.y = 1;

    this.v.inorm();

    this.pos.iadd(this.v.mul(this.speed));
}

Boid.prototype.draw = function(ctx) {
    var pol = this.v.toPolar(), dir;

    ctx.strokeStyle = this.done ? '#00FF00' : '#FF0000';
    ctx.beginPath();
    ctx.moveTo(this.pos.x, this.pos.y);
    ctx.lineTo(this.pos.x + this.v.mul(10).x,
     	       this.pos.y + this.v.mul(10).y);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = '#CCCCCC';
    ctx.beginPath();
    pol.dir += this.view;
    dir = pol.toVector();
    ctx.moveTo(this.pos.x, this.pos.y);
    ctx.lineTo(this.pos.x + dir.mul(10).x,
	       this.pos.y + dir.mul(10).y);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = '#CCCCCC';
    ctx.beginPath();
    pol = this.v.toPolar()
    pol.dir -= this.view;
    dir = pol.toVector();
    ctx.moveTo(this.pos.x, this.pos.y);
    ctx.lineTo(this.pos.x + dir.mul(10).x,
     	       this.pos.y + dir.mul(10).y);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = this.alive ? '#000000' : '#FFFFFF';
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, 
	    this.exc, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();
}

var ControlBoid = function(x,y) {
    this.pos = new Vector(x, y);
    this.v = new Polar(0,0)
    this.dv = new Polar(0, 0);
    this.max_speed = 2.0;
    this.radius = 50;
    this.exc = 5;
    this.alive = true;
}
ControlBoid.prototype.iterate = function() {
    this.v.dir += this.dv.dir;
    this.v.mag += this.dv.mag;
    this.v.mag = Math.max(0, Math.min(this.v.mag, this.max_speed));
    if(this.v.mag > 0)
	this.pos.iadd(this.v.toVector());
}
ControlBoid.prototype.draw = function(ctx) {
    var v;

    if(this.v.mag > 0) {
	v = this.v.toVector().mul(10);
	ctx.strokeStyle = '#0000FF';
	ctx.beginPath();
	ctx.moveTo(this.pos.x, this.pos.y);
	ctx.lineTo(this.pos.x + v.x,
     		   this.pos.y + v.y);
	ctx.closePath();
	ctx.stroke();
    }

    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, 
	    this.exc, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = '#AA0000';
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, 
	    this.radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();
}

var keyHandler = function(key, up, ctrl_boid) {
    var p; 

    switch (key) {
    case 38:  /* Up arrow */
	ctrl_boid.dv.mag = up ? 0.0 : 0.01;
	break;
    case 40:  /* Down arrow */
	ctrl_boid.dv.mag = up ? 0.0 : -0.01;
	break;
    case 37:  /* Left arrow */
	ctrl_boid.dv.dir = up ? 0.0 : -0.02;
	break;
    case 39:  /* Right arrow */
	ctrl_boid.dv.dir = up ? 0.0 : 0.02;
	break;
    }
}

var Level = function() {
    this.shapes = new Array();
    this.nboids = 0;
    this.nboids_to_win = 0;
    this.boids = new Array();
    this.done = false;
}

Level.prototype.isDone = function() {
    this.done = true;
    for(var b in this.boids)
	if(!(this.boids[b] instanceof ControlBoid) && 
	   (!this.boids[b].done && this.boids[b].alive)) {
	    this.done = false;
	    break;
	}
    return this.done;
}

Level.prototype.score = function() {
    var alive = 0, score = 0;
    
    for(var b in this.boids)
	if(!(this.boids[b] instanceof ControlBoid)) {
	    if(this.boids[b].alive) {
		alive++;
		if(this.boids[b].done)
		    score++;
	    }
	}
    return {"alive": alive, "score": score};
}

Level.prototype.stats = function() {
    var score = this.score();
    return 'Alive: ' + score.alive + ' / ' + this.nboids + 
	'<br> Score: ' + score.score  + ' / ' + this.nboids + 
	'<br>Need: ' + this.nboids_to_win + ' / ' + this.nboids;
}


Level.prototype.iterate = function() {
    for(var b in this.boids) 
	this.boids[b].iterate(this.boids, b, this.shapes);
    return this.isDone();
}

Level.prototype.draw = function(ctx) {
   var score;
    if(this.done) {
	score = this.score();
	ctx.clearRect(0, 0, 1000, 1000);
	ctx.fillStyle = score.score >= this.nboids_to_win ? '#00FF00' : '#FF0000',
	ctx.fillText(score.score >= this.nboids_to_win ? "YOU WIN" : "YOU SUCK",
		     100, 150);
    }
    else {
	ctx.clearRect(0, 0, 1000, 1000);
	for(var s in this.shapes) this.shapes[s].draw(ctx);
	for(var b in this.boids) this.boids[b].draw(ctx);
    }
}

var test = function(canvas) {
    var ctx = canvas.getContext('2d'), 
    ctrl_boid = new ControlBoid(500, 250),
    anim, i, r,
    level = new Level();

    ctx.font = '20px sans-serif';

    document.addEventListener('keydown', function (e) { 
	keyHandler(e.which, false, ctrl_boid);}, false);
    document.addEventListener('keyup', function (e) { 
	keyHandler(e.which, true, ctrl_boid);}, false);

    level.nboids = 60, 
    level.nboids_to_win = 30;
    for(i = 0; i < level.nboids; ++i) 
	level.boids.push(new Boid(Math.random() * 320, 
				  Math.random() * 480));
    level.boids.push(ctrl_boid);
    
    r = new Rectangle(new Vector(600, 0), new Vector(640, 480));
    r.effect = function(b) { b.alive = false; };
    level.shapes.push(r);

    r = new Triangle(new Vector(600, 200), 
		     new Vector(500, 250),
		     new Vector(600, 300));
    r.effect = function(b) { b.alive = false; };
    level.shapes.push(r);

    r = new Rectangle(new Vector(200, 190), new Vector(220, 290));
    r.effect = function(b) { b.done = true; };
    r.colour = '#00AA11';
    level.shapes.push(r);
    
    anim = function() { 
	if(!level.done) {
	    level.iterate();
	    level.draw(ctx); 
	    if(debug) debug.innerHTML = level.stats();
	}};
    setInterval(anim, 10);
}