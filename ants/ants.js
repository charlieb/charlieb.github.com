

var Colour = function() {
  this.r = 0x00;
  this.g = 0xFF;
  this.b = 0x00;
  this.a = 0xFF;
}
Colour.prototype.toString = function() {
  return 'rgba('+ Math.floor(this.r) +','+ Math.floor(this.g) +','+ Math.floor(this.b) +','+ this.a/255 +')';
}

var Food = function(x,y) {
  this.pos = new Vector(x,y);
}
Food.prototype.draw = function(ctx) {
  ctx.fillStyle = '#0FF';
  ctx.beginPath();
  ctx.arc(this.pos.x, this.pos.y, 3, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
}

var Spoor = function(x,y) {
  this.pos = new Vector(x,y);
  this.age = 0;
  this.colour = new Colour();
  this.seen = false;
}
Spoor.prototype.draw = function(ctx) {

  this.colour.r = this.seen ? 0xFF : 0x00;
  this.colour.g = this.seen ? 0x00 : 0xFF;
  ctx.fillStyle = this.colour.toString();
  ctx.beginPath();
  ctx.arc(this.pos.x, this.pos.y, 5, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
}
Spoor.prototype.iterate = function() {
  this.age++;
  this.colour.a--;
}


var Ant = function(x, y) {
  this.pos = new Vector(x, y);
  this.v = new Polar(1, Math.PI * 2 * Math.random());
  this.turn = 0;
  this.turns_left = 0;
  this.exc = 5;

  this.vision = {min:10, range:30, angle:Math.PI / 3};
}
Ant.prototype.toString = function() {
  return this.pos.toString() + ' -> ' + this.v.toString();
}
Ant.prototype.applyExclusion = function(ants, self_idx, limit) {
  for(i = 0; i < ants.length; ++i) {
    if(i == self_idx) continue;
    if(!this.pos.inCircle(ants[i], this.exc + ants[i].exc)) continue;

    diff = this.pos.sub(ants[i].pos);
    dir = diff.norm();
    mag = diff.mag();

    if(mag < this.exc + ants[i].exc) {
      if(mag == 0)
        this.pos.iadd((new Vector(1 - 2 * Math.random(), 1 - 2 * Math.random()))
      .norm().mul(this.exc));
    else 
      this.pos.iadd(dir.mul(this.exc + ants[i].exc - mag));
    }
  }

  // Another bounding box check for speed
  // If we're in an inscribed square no need to do the circle check
  if((this.pos.x > limit.x - limit.inner_size && this.pos.x < limit.x + limit.inner_size) &&
    (this.pos.y > limit.y - limit.inner_size && this.pos.y < limit.y + limit.inner_size))
  return;
  diff = this.pos.sub(limit);
  dir = diff.norm();
  mag = diff.mag();
  if(mag > limit.r) {
    //this.pos = new Vector(limit.x, limit.y);
    this.pos = new Polar(limit.r, diff.toPolar().dir).toVector().add(limit);
  }

}
Ant.prototype.iterate = function(ants, self_idx, spoor, food, limit) {
  var seen_food = false;
  // Look for food first
  if(this.food) {
    this.food.pos.x = this.pos.x;
    this.food.pos.y = this.pos.y;
  } else {
    for(var i = 0; i < food.length; i++) {
      if(!food[i].carried && this.pos.inCircle(food[i].pos, this.vision.range)) {
        // is it in front?
        var dir = food[i].pos.sub(this.pos).toPolar().dir;
        if(this.v.dir - this.vision.angle / 2 < dir && dir < this.v.dir + this.vision.angle / 2) {
          // close enough to grab?
          if(this.pos.inCircle(food[i].pos, this.vision.min)) {
            this.food = food[i];
            food[i].carried = true;
          } else { // too far so walk towards it
            seen_food = food[i];
          }
          break; // We've either seen or grabbed food so stop looking
        }
      }
    }
  }
      
  if(!seen_food) {
    // Find the spoors that are in range and can be seen
    var spoor_pos = new Vector(0,0);
    var nspoor = 0;
    for(var i = 0; i < spoor.length; i++) {
      if(!this.pos.inCircle(spoor[i].pos, this.vision.range) || 
      this.pos.inCircle(spoor[i].pos, this.vision.min)) continue;
      var dir = spoor[i].pos.sub(this.pos).toPolar().dir;
      if(this.v.dir - this.vision.angle / 2 < dir && dir < this.v.dir + this.vision.angle / 2) {
        spoor_pos.iadd(spoor[i].pos);
        nspoor++;
        spoor[i].seen = true;
      }
    }
  }

  var new_dir = null;
  if(seen_food) {
    new_dir = seen_food.pos.sub(this.pos).toPolar().dir;
    this.turns_left = 5;
  } else if(nspoor > 0) {
    spoor_pos.idiv(nspoor);
    new_dir = spoor_pos.sub(this.pos).toPolar().dir;
    this.turns_left = 5;
  } else if(this.turns_left === 0) {
    new_dir = Math.random() * Math.PI * 2;
    //this.v.dir = new_dir;
    this.turns_left = 20;
  }

  if(new_dir !== null) {
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

  if(Math.random() < 0.0125) spoor.push(new Spoor(this.pos.x, this.pos.y));
}

Ant.prototype.draw = function(ctx) {
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

  ctx.strokeStyle = '#444444';
  ctx.beginPath();
  ctx.moveTo(this.pos.x, this.pos.y);
  var p = new Polar(1, this.v.dir);
  p.dir -= this.vision.angle / 2;
  v = p.toVector();
  ctx.lineTo(this.pos.x + v.mul(this.vision.range).x, this.pos.y + v.mul(this.vision.range).y);
  ctx.arc(this.pos.x, this.pos.y, this.vision.range, p.dir, p.dir + this.vision.angle, false);
  ctx.closePath();
  ctx.stroke();
}
var test = function(ctx) {
  var limit = {x:320, y:240, r:200, inner_size:0};
  limit.inner_size = limit.r * Math.sin(Math.PI / 4);

  var ants = new Array();
  for(var i = 0; i < 20; ++i) 
    ants.push(new Ant(limit.x, limit.y));

  var spoor = new Array();
  var food = new Array();
  for(var i = 0; i < 40; i++)
    food.push(new Food(limit.x - limit.r + Math.random() * limit.r * 2,
                      limit.y - limit.r + Math.random() * limit.r * 2));

  var its = 0;
  setInterval(function() { 

  for(var i = 0; i < spoor.length; ++i) spoor[i].seen = false;
  for(var i = 0; i < spoor.length; ++i) spoor[i].iterate();
  for(var i = 0; i < spoor.length; ++i) 
    if(spoor[i].age > 255) { 
      spoor.splice(i,1);
      i--;
    }

  for(var i = 0; i < ants.length; ++i) 
    ants[i].iterate(ants, i, spoor, food, limit);

  for(var j = 0; j < 20; j++)
    for(var i = 0; i < ants.length; ++i) 
      ants[i].applyExclusion(ants, i, limit);

  ctx.clearRect(0, 0, 640, 480);
  for(var i = 0; i < spoor.length; ++i) spoor[i].draw(ctx);
  for(var i = 0; i < food.length; ++i) food[i].draw(ctx);
  for(var i = 0; i < ants.length; ++i) ants[i].draw(ctx);


  var av = new Vector(0,0);
  av = new Vector(0,0);
  for(var i = 0; i < ants.length; ++i) av.iadd(ants[i].pos);
  its++;
  av.idiv(ants.length);
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
