CENTER = new Vector(400, 400);

var Boid = function(x, y, speed) {
    this.pos = new Vector(x, y);
    this.fixed = false;
    this.size = 1;
    this.speed = speed;
    this.v = new Vector(0,0);
}
Boid.prototype.toString = function() {
    return this.pos.toString();
}
Boid.prototype.iterate = function(boids, self_idx, limit) {
    this.size += 0.05

    if(this.fixed) return;

    var i, diff, mag, dir;
    var rep = new Vector(0,0);

    for(i = 0; i < boids.length; ++i) {
        if(i == self_idx) continue;
        diff = this.pos.sub(boids[i].pos);
        dir = diff.norm();
        mag = diff.mag();

        // Magnitude of repulsion falls off with an inverse square
        rep.iadd(diff.div(mag * mag));
    }

    this.v = rep.norm();
    this.pos.iadd(rep.norm().mul(this.speed));
    //this.speed *= 0.95;
    if(this.speed < 0.1) this.fixed = true;

    diff = this.pos.sub(limit);
    mag = diff.mag();
    dir = diff.norm();
    if(mag > limit.r) {
	    this.pos.isub(dir.mul(mag - limit.r))
      this.fixed = true;
    }
}

Boid.prototype.draw = function(ctx, center_offset) {
    var style = ctx.createRadialGradient(this.pos.x, this.pos.y, 0, 
            this.pos.x, this.pos.y, this.size * 2);
    style.addColorStop(1, "#00F");
    style.addColorStop(0, "#000");
    ctx.fillStyle = style;
    this.v = this.pos.sub(CENTER.add(center_offset)).norm();
    var vp = this.v.toPolar();
    ctx.beginPath();
    ctx.moveTo(this.pos.x + this.v.x * this.size * 2,
               this.pos.y + this.v.y * this.size * 2);
    ctx.lineTo(this.pos.x + this.size * Math.cos(vp.dir + Math.PI / 2),
               this.pos.y + this.size * Math.sin(vp.dir + Math.PI / 2));
    ctx.arc(this.pos.x, this.pos.y, 
	    this.size, vp.dir + Math.PI / 2, vp.dir - Math.PI / 2, false);
    ctx.closePath();
    ctx.fill();
}

var intervals = new Array();

var test = function(ctx) {
    var boids = new Array();
    var limit =  {x: CENTER.x, y:CENTER.y, r:200}

    for(var i =0; i < intervals.length; i++) clearInterval(intervals[i]);
    intervals = new Array();
    
    boids.push(new Boid(CENTER.x + 0.5 - Math.random(), CENTER.y + 0.5 - Math.random(), 5));
    boids.push(new Boid(CENTER.x + 0.5 - Math.random(), CENTER.y + 0.5 - Math.random(), 5));

    var a = 0;
    var da = Math.PI / (200 + Math.random() * 400);
    var center_offset_size = 300 * Math.random();
    intervals.push(
      setInterval(function() { 
        if(limit.r > 0)
          for(var i = 0; i < boids.length; i++) boids[i].iterate(boids, i, limit);
        ctx.fillStyle = "#000"
        ctx.fillRect(0, 0, 1280, 1024);
        for(var i = 0; i < boids.length; i++) boids[i].draw(ctx, new Vector(center_offset_size * Math.cos(a), center_offset_size * Math.sin(a))); 
        a += da;
      }, 20));

    var dlimit = Math.random();
    var speed =  1 + 10 * Math.random();
    intervals.push(
      setInterval(function() { 
        if(limit.r > 0) {
          boids.push(new Boid(CENTER.x, CENTER.y, speed));
          limit.r -= dlimit;
        }
      },
      30 + 30 * Math.random()));
}
