
var Particle = function(x, y) {
  this.pos = new Vector(x,y);
  this.v = new Vector(0.5 - Math.random(), 0.5 - Math.random()).norm();
  this.size = 3;
  this.fixed = false;
}
Particle.prototype.toString = function() {
    return this.pos.toString();
}
Particle.prototype.slow_iterate = function(motes, limit) {
    if(this.fixed) return;

    var i, diff, mag, dir;

    for(i = 0; i < motes.length; ++i) {
      if(!motes[i].fixed) continue;
      
      diff = this.pos.sub(motes[i].pos);
      mag = diff.mag();

      if(mag < this.size + motes[i].size) {
        this.fixed = true;
        return;
      }
    }
    this.pos.x += this.v.x * this.size;
    this.pos.y += this.v.y * this.size;

    diff = this.pos.sub(limit);
    mag = diff.mag();
    dir = diff.norm();
    if(mag > limit.r) {
	    this.pos.isub(dir.mul(mag - limit.r))
      this.v = new Vector(0.5 - Math.random(), 0.5 - Math.random()).norm();
    }
}
Particle.prototype.iterate = function(motes, limit) {
    if(this.fixed) return;

    var i, diff, mag, dir;

    for(i = 0; i < motes.length; ++i) {
      if(!motes[i].fixed) continue;
      // Bounding box check first for speed
      if(motes[i].pos.x + motes[i].size < this.pos.x - this.size ||
         motes[i].pos.x - motes[i].size > this.pos.x + this.size ||
         motes[i].pos.y + motes[i].size < this.pos.y - this.size ||
         motes[i].pos.y - motes[i].size > this.pos.y + this.size)
         continue;
      
      diff = this.pos.sub(motes[i].pos);
      mag = diff.mag();

      if(mag < this.size + motes[i].size) {
        this.fixed = true;
        return;
      }
    }
    this.pos.x += this.v.x * this.size;
    this.pos.y += this.v.y * this.size;

    // Another bounding box check for speed
    // If we're in an inscribed square no need to do the circle check
    if((this.pos.x > limit.x - limit.inner_size && this.pos.x < limit.x + limit.inner_size) &&
       (this.pos.y > limit.y - limit.inner_size && this.pos.y < limit.y + limit.inner_size))
       return;

    diff = this.pos.sub(limit);
    mag = diff.mag();
    dir = diff.norm();
    if(mag > limit.r) {
	    this.pos.isub(dir.mul(mag - limit.r))
      this.v = new Vector(0.5 - Math.random(), 0.5 - Math.random()).norm();
    }
}

Particle.prototype.draw_nice = function(ctx) {
    var style = ctx.createRadialGradient(this.pos.x, this.pos.y, 0, 
            this.pos.x, this.pos.y, this.size);
    if(this.fixed)
      style.addColorStop(0, "#FFF");
    else
      style.addColorStop(0, "#F00");
    style.addColorStop(1, "#000");
    ctx.fillStyle = style;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.size , 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}
Particle.prototype.draw_fast = function(ctx) {
    if(this.fixed)
      ctx.fillStyle = "#FFF";
    else
      ctx.fillStyle = "#F00";
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.size - 0.5 , 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

var intervals = new Array();

// draw_type 1: fast
// draw_type 2: nice
// draw_type 3: nice but with poorly performing motes
var test = function(ctx, draw_type) {
    var motes = new Array();
    var fixed = new Array();
    var limit =  {x: 300, y:300, r:200, inner_size:0}
    limit.inner_size = limit.size * Math.sin(Math.PI / 4);

    for(var i =0; i < intervals.length; i++) clearInterval(intervals[i]);
    intervals = new Array();
    
    for(var i = 0; i < 2000; i++) {
      // Create a uniform distribution by randomizing x and y
      // then exclude points that are outside the limit cicle
      // (if you just randomize a polar coordinate there's a giant
      // clump in the middle)
      var p = new Vector(limit.x - limit.r + Math.random() * limit.r * 2,
                          limit.y - limit.r + Math.random() * limit.r * 2);
      while(p.sub(limit).mag() > limit.r)
        p = new Vector(limit.x - limit.r + Math.random() * limit.r * 2,
                          limit.y - limit.r + Math.random() * limit.r * 2);
      motes.push(new Particle(p.x, p.y));
    }
    // Fix the seed
    fixed.push(new Particle(limit.x, limit.y));
    fixed[0].fixed = true;

    intervals.push(
      setInterval(function() { 
        if(draw_type === 3) {
          for(var i = 0; i < motes.length; i++) {
            motes[i].slow_iterate(fixed, limit);
            if(motes[i].fixed) {
              fixed.push(motes[i]);
              motes.splice(i,1);
            }
          }
        }
        else {
          for(var i = 0; i < motes.length; i++) {
            motes[i].iterate(fixed, limit);
            if(motes[i].fixed) {
              fixed.push(motes[i]);
              motes.splice(i,1);
            }
          }
        }
        ctx.fillStyle = "#000"
        ctx.fillRect(0, 0, 600, 600);
        if(draw_type === 1) {
          for(var i = 0; i < motes.length; i++) motes[i].draw_fast(ctx); 
          for(var i = 0; i < fixed.length; i++) fixed[i].draw_fast(ctx); 
        }
        else {
          for(var i = 0; i < motes.length; i++) motes[i].draw_nice(ctx); 
          for(var i = 0; i < fixed.length; i++) fixed[i].draw_nice(ctx); 
        }
      }, 20));
}
