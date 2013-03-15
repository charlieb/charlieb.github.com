
var Boid = function(x, y) {
  this.pos = new Vector(x, y);
  this.v = new Polar(1, Math.PI * 2 * Math.random());
  this.turn = 0;
  this.turns_left = 0;
  this.exc = 5;
}
Boid.prototype.toString = function() {
  return this.pos.toString() + ' -> ' + this.v.toString();
}
Boid.prototype.applyExclusion = function(boids, self_idx, limit) {
  for(i = 0; i < boids.length; ++i) {
    if(i == self_idx) continue;
    diff = this.pos.sub(boids[i].pos);
    dir = diff.norm();
    mag = diff.mag();

    if(mag < this.exc + boids[i].exc) {
      if(mag == 0)
        this.pos.iadd((new Vector(1 - 2 * Math.random(), 1 - 2 * Math.random()))
      .norm().mul(this.exc));
    else 
      this.pos.iadd(dir.mul(this.exc + boids[i].exc - mag));
    }
  }
  diff = this.pos.sub(limit);
  dir = diff.norm();
  mag = diff.mag();
  if(mag > limit.r) {
    //this.pos = new Vector(limit.x, limit.y);
    this.pos = new Polar(limit.r, diff.toPolar().dir).toVector().add(limit);
  }

}
Boid.prototype.iterate = function(boids, self_idx, limit) {
  if(this.turns_left === 0) {
    var new_dir = Math.random() * Math.PI * 2;
    //this.v.dir = new_dir;
    this.turns_left = 20;
    // d1 is the distance through zero
    var d1 = this.v.dir - new_dir;
    if(d1 < 0) d1 += Math.PI*2;
    // d2 is the distance not through zero
    var d2 = new_dir - this.v.dir;
    if(d2 < 0) d2 += Math.PI*2;

    if(d1 < d2) 
        this.turn = -d1 / this.turns_left;
     else
        this.turn = d2 / this.turns_left;
    //this.turn = 0;
    //this.v.dir = new_dir;
  }

  this.v.dir += this.turn; 
  if(this.v.dir > Math.PI * 2) this.v.dir -= Math.PI * 2;
  if(this.v.dir < 0) this.v.dir += Math.PI * 2;
  this.turns_left--;

  this.pos.iadd(this.v.toVector());
}

Boid.prototype.draw = function(ctx) {
  var v = this.v.toVector();

  ctx.strokeStyle = '#FF0000';
  ctx.beginPath();
  ctx.moveTo(this.pos.x, this.pos.y);
  ctx.lineTo(this.pos.x + v.mul(10).x, this.pos.y + v.mul(10).y);
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.arc(this.pos.x, this.pos.y, this.exc, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.stroke();
}
var test = function(ctx) {
  var boids = new Array();
  var limit = {x:320, y:240, r:200};
  for(var i = 0; i < 200; ++i) 
    boids.push(new Boid(limit.x - limit.r + Math.random() * limit.r * 2, limit.y - limit.r + Math.random() * limit.r * 2));

  var its = 0;
  setInterval(function() { 
  for(var i = 0; i < boids.length; ++i) 
    boids[i].iterate(boids, i,limit);
  for(var j = 0; j < 20; j++)
    for(var i = 0; i < boids.length; ++i) 
      boids[i].applyExclusion(boids, i, limit);
  ctx.clearRect(0, 0, 640, 480);
  for(var i = 0; i < boids.length; ++i) boids[i].draw(ctx);

  var av = new Vector(0,0);
  av = new Vector(0,0);
  for(var i = 0; i < boids.length; ++i) av.iadd(boids[i].pos);
  its++;
  av.idiv(boids.length);
  ctx.fillStyle = "#F00"
  ctx.beginPath()
  ctx.arc(av.x, av.y, 3, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = "#0F0"
  ctx.beginPath()
  ctx.arc(limit.x, limit.y, 3, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
  }, 50);
}
