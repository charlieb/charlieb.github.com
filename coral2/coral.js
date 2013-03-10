
var Particle = function(x, y) {
  this.pos = new Vector(x,y);
  this.v = null;
  this.size = 2;
  this.fixed = false;
  this.colour = "#FFFFFF"
}
Particle.prototype.toString = function() {
    return this.pos.toString();
}
Particle.prototype.iterate = function(motes) {
    var i, diff, mag;

    for(i = 0; i < motes.length; ++i) {
      // Bounding box check first for speed
      if(motes[i].pos.x + motes[i].size < this.pos.x - this.size ||
         motes[i].pos.x - motes[i].size > this.pos.x + this.size ||
         motes[i].pos.y + motes[i].size < this.pos.y - this.size ||
         motes[i].pos.y - motes[i].size > this.pos.y + this.size)
         continue;
      
      if(this.pos.sub(motes[i].pos).mag() < this.size + motes[i].size) {
        this.fixed = true;
        return;
      }
    }
    this.pos.x += this.v.x * this.size;
    this.pos.y += this.v.y * this.size;
}
Particle.prototype.draw = function(ctx) {
  ctx.fillStyle = this.colour;
  ctx.beginPath();
  ctx.arc(this.pos.x, this.pos.y, this.size - 0.5 , 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
}

var Colour = function() {
  this.r = Math.floor(Math.random() * 0xFF);
  this.g = Math.floor(Math.random() * 0xFF);
  this.b = Math.floor(Math.random() * 0xFF);
}
Colour.prototype.toString = function() {
  return 'rgb('+ Math.floor(this.r) +','+ Math.floor(this.g) +','+ Math.floor(this.b) +')';
}
Colour.prototype.diff = function(c, steps) {
  var d = new Colour();
  d.r = (c.r - this.r) / steps;
  d.g = (c.g - this.g) / steps;
  d.b = (c.b - this.b) / steps;
  return d;
}
Colour.prototype.iadd = function(c) {
  this.r += c.r;
  this.g += c.g;
  this.b += c.b;
}


var Circle = function() {
  this.pos = new Vector(300, 300);
  this.r = 1;
  this.motes = new Array();
  this.motes_per_iteration = 10;
  this.colour = new Colour();
  this.steps = 100;
  this.remaining_steps = 00;
  this.colour_diff = this.colour.diff(new Colour(), this.steps);
  
  this.live_mote = new Particle(this.pos.x, this.pos.y);
  this.live_mote.fixed = true;
  this.live_mote.colour = this.colour.toString();
}
Circle.prototype.iterate = function() {
  if(this.r > 300) return;
  for(var i = 0; i < this.motes_per_iteration; i++) {
    // Keep the live one moving until it gets fixed
    while(!this.live_mote.fixed) {
      this.live_mote.iterate(this.motes);
      // If it gets too far away, re-randomize it
      if(this.live_mote.pos.x > 700 || this.live_mote.pos.x < 0 || this.live_mote.pos.y > 700 || this.live_mote.pos.y < 0) {
        this.live_mote.pos = new Polar(this.r, Math.random() * Math.PI * 2).toVector().add(this.pos); 
        this.live_mote.v = new Vector(0.5 - Math.random(), 0.5 - Math.random()).norm();
        this.live_mote.colour = this.colour.toString();
      }
    }

    // The starting radius must always be further out than the outermost mote
    this.r = Math.max(this.r, this.live_mote.pos.sub(this.pos).mag() + this.live_mote.size * 10);
    // The live mote is now fixed so create a new one
    this.motes.push(this.live_mote);
    this.live_mote = new Particle(0,0);
    this.live_mote.pos = new Polar(this.r, Math.random() * Math.PI * 2).toVector().add(this.pos); 
    this.live_mote.v = new Vector(0.5 - Math.random(), 0.5 - Math.random()).norm();
    this.live_mote.colour = this.colour.toString();

    // Advance the colours
    this.colour.iadd(this.colour_diff);
    this.remaining_steps--;
    // Pick a new colour to move towards
    if(this.remaining_steps <= 0) {
      this.steps = Math.round(this.r * 2);
      console.log(this.steps);
      this.remaining_steps = this.steps;
      this.colour_diff = this.colour.diff(new Colour(), this.steps);
    }
  }
}
Circle.prototype.draw = function(ctx) {
  for(var i = 0; i < this.motes.length; i++)
    this.motes[i].draw(ctx);
}

var intervals = new Array();

var test = function(ctx) {
    for(var i =0; i < intervals.length; i++) clearInterval(intervals[i]);
    intervals = new Array();

    var c = new Circle();

    intervals.push(
      setInterval(function() { 
        c.iterate();
        ctx.fillStyle = "#000"
        ctx.fillRect(0, 0, 700, 700);
        c.draw(ctx);
      }, 20));
}
