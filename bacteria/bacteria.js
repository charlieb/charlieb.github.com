
var Spoor = function(x, y) {
    this.pos = new Vector(x, y);
    this.life = 100;
}
Spoor.prototype.iterate = function() { this.life--; }
Spoor.prototype.draw = function(ctx) {
    var style = ctx.createRadialGradient(this.pos.x, this.pos.y, 0, 
            this.pos.x, this.pos.y, 3);
    style.addColorStop(1, "#FFF");
    style.addColorStop(0, "#840");
    ctx.fillStyle = style;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, 
	    3, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

/*********************************/
var Boid = function(x, y) {
    this.pos = new Vector(x, y);
    this.v = new Vector(0,0);
    this.speed = 1;
    this.att = 155;
    this.rep = 15;
    this.exc = 5;

    this.life = 50 + 50 * Math.random();
}
Boid.prototype.toString = function() {
    return this.pos.toString() + ' -> ' + this.v.toString();
}
Boid.prototype.applyExclusion = function(boids, self_idx) {
    for(i = 0; i < boids.length; ++i) {
        if(i == self_idx) continue;
        diff = this.pos.sub(boids[i].pos);
        dir = diff.norm();
        mag = diff.mag();

        if(mag < this.exc + boids[i].exc) {
            if(mag == 0)
                this.pos.iadd((new Vector(1 - 2 * Math.random(), 
                                1 - 2 * Math.random()))
                        .norm().mul(this.exc));
            else 
                this.pos.iadd(dir.mul(this.exc + boids[i].exc - mag));
        }
    }
}
Boid.prototype.iterate = function(boids, self_idx, spoor) {
    var i, diff, mag, dir;
    var att = new Vector(0,0), natt = 0;
    var rep = new Vector(0,0), nrep = 0;
    var nboids = boids.length;

    this.v = new Vector(0,0);
    for(i = 0; i < nboids; ++i) {
        if(i == self_idx) continue;
        diff = this.pos.sub(boids[i].pos);
        dir = diff.norm();
        mag = diff.mag();

        if(mag < this.rep) {
            rep.iadd(boids[i].pos);
            nrep++;
        }
        else if(mag < this.att) {
            att.iadd(boids[i].pos);
            natt++;
        }
    }

    if(nrep) this.v.iadd(rep.div(nrep).sub(this.pos).norm().neg());
    else if(natt) this.v.iadd(att.div(natt).sub(this.pos).norm());

    if(this.pos.x > 640) this.v.x = -1;
    if(this.pos.x < 0) this.v.x = 1;
    if(this.pos.y > 480) this.v.y = -1;
    if(this.pos.y < 0) this.v.y = 1;

    this.pos.iadd(this.v);



    for(i = 0; i < spoor.length; ++i) {
        diff = this.pos.sub(spoor[i].pos);
        mag = diff.mag();
        if(mag < this.exc)
            this.life -= 0.14;
    }
    //this.life -= boids.length / 100;
    this.exc += 0.05;
    this.rep = this.exc * 2;

    // Chance to split
    if(this.exc > 10) {
        boids.push(new Boid(this.pos.x + Math.random() - 0.5, this.pos.y + Math.random() - 0.5));
        this.exc -= 7;
    }
}

Boid.prototype.draw = function(ctx) {
    var style = ctx.createRadialGradient(this.pos.x, this.pos.y, 0, 
            this.pos.x, this.pos.y, this.exc);
    style.addColorStop(1, "#FFF");
    if(this.life < 10) 
        style.addColorStop(0, "#F00");
    else
        style.addColorStop(0, "#000");
    ctx.fillStyle = style;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, 
	    this.exc, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

var test = function(ctx) {
    var boids = new Array();
    var spoor = new Array();
    
    setInterval(function() { 
	    for(var e = 0; e < 50; e++) for(var i = 0; i < boids.length; i++) boids[i].applyExclusion(boids, i);

	    for(var i = 0; i < spoor.length; i++) spoor[i].iterate(); 
	    for(var i = 0; i < boids.length; i++) boids[i].iterate(boids, i, spoor);

	    for(var i = 0; i < boids.length; i++) if(Math.random() < 0.05) spoor.push(new Spoor(boids[i].pos.x, boids[i].pos.y)); 

      ctx.clearRect(0, 0, 800. 800);

	    for(var i = 0; i < spoor.length; i++) spoor[i].draw(ctx); 
	    for(var i = 0; i < boids.length; i++) boids[i].draw(ctx); 

	    for(var i = 0; i < spoor.length; i++) if(spoor[i].life <= 0) spoor.splice(i, 1);
	    for(var i = 0; i < boids.length; i++) if(boids[i].life <= 0) boids.splice(i, 1);

	}, 20);
    boids.push(new Boid(320 + 0.5 - Math.random(), 200 + 0.5 - Math.random()));
}
