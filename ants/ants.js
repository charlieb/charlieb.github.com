

var Colour = function() {
  this.r = 0x00;
  this.g = 0xFF;
  this.b = 0x00;
  this.a = 0xFF;
}
Colour.prototype.toString = function() {
  return 'rgba('+ Math.floor(this.r) +','+ Math.floor(this.g) +','+ Math.floor(this.b) +','+ this.a/255 +')';
}

var Rock = function(x,y,r) {
  this.pos = new Vector(x,y);
  this.r = r;
}
Rock.prototype.draw = function(ctx) {
  ctx.fillStyle = '#888';
  ctx.beginPath();
  ctx.arc(this.pos.x, this.pos.y, this.r, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
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
  this.fade_rate = 2;
}
Spoor.prototype.draw = function(ctx) {

  this.colour.r = this.seen ? 0xFF : 0x00;
  this.colour.g = this.seen ? 0x00 : 0xFF;
  ctx.fillStyle = this.colour.toString();
  ctx.beginPath();
  ctx.arc(this.pos.x, this.pos.y, 2, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
}
Spoor.prototype.iterate = function() {
  this.age += this.fade_rate;
  this.colour.a -= this.fade_rate;
}


var Ant = function(x, y) {
  this.pos = new Vector(x, y);
  this.v = new Polar(2, Math.PI * 2 * Math.random());
  this.turn = 0;
  this.turns_left = 0;
  this.exc = 2;
  this.max_energy = 1000;
  this.energy = this.max_energy;

  this.vision = {min:5, range:30, angle:Math.PI / 3};

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
var min_turn = function(dir1, dir2) {
  // d1 is the distance through zero
  var d1 = dir1 - dir2;
  if(d1 < 0) d1 += Math.PI*2;
  // d2 is the distance not through zero
  var d2 = dir2 - dir1;
  if(d2 < 0) d2 += Math.PI*2;

  if(d1 < d2) 
    return -d1;
  else
    return d2;
}
Ant.prototype.iterate = function(ants, self_idx, spoor, food, nest, limit) {
  // We need to go back to the nest to get more energy.
  // If not, we die and are re-incarnated in the nest
  this.energy--;
  if(this.energy <= 0) {
    this.pos.x = nest.pos.x + 0.5 - Math.random();
    this.pos.y = nest.pos.y + 0.5 - Math.random();
  }

  var seen_food = false;
  // Look for food first
  if(this.food) {
    var v = this.v.toVector().mul(1.5);;
    this.food.pos.x = this.pos.x + v.x;
    this.food.pos.y = this.pos.y + v.y;
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
  // get a vector to the nest
  var to_nest = nest.pos.sub(this.pos).toPolar();
  // if we're at the nest, replenish energy
  if(to_nest.mag < nest.size) this.energy = this.max_energy;

  if(seen_food) { // go right for the food
    new_dir = seen_food.pos.sub(this.pos).toPolar().dir;
    this.turns_left = 1;
  } else if(nspoor > 0) { // follow the trail
    spoor_pos.idiv(nspoor);
    new_dir = spoor_pos.sub(this.pos).toPolar().dir;
    // Don't carry food away from the nest
    if(this.food && Math.abs(min_turn(new_dir, to_nest.dir)) > 7 * Math.PI / 16)
        new_dir = to_nest.dir - Math.PI / 4 + Math.random() * Math.PI / 2;
    this.turns_left = 1;
  } else if(this.turns_left === 0) {
    if(this.food) // go back to the nest with food
      new_dir = to_nest.dir - Math.PI / 4 + Math.random() * Math.PI / 2;
    else // without food do a random walk
      new_dir = Math.random() * Math.PI * 2;
    //this.v.dir = new_dir;
    //new_dir %= Math.PI * 2
    this.turns_left = 20;
  }

  if(this.food) { 
    // if we're at the nest drop the food
    if(to_nest.mag < nest.size) {
      food.splice(food.indexOf(this.food), 1);
      this.food = false;
      return; // rest for a turn :)
    }
  }

  if(new_dir !== null) {
    this.turn = min_turn(this.v.dir, new_dir) / this.turns_left;
    //this.turn = 0;
    //this.v.dir = new_dir;
  }

  this.v.dir += this.turn; 
  if(this.v.dir > Math.PI * 2) this.v.dir -= Math.PI * 2;
  if(this.v.dir < 0) this.v.dir += Math.PI * 2;
  this.turns_left--;

  this.pos.iadd(this.v.toVector());

  if(this.food && Math.random() < 0.15) spoor.push(new Spoor(this.pos.x, this.pos.y));
}

Ant.prototype.draw = function(ctx) {
  var v = this.v.toVector();
/*
  ctx.strokeStyle = '#FF0000';
  ctx.beginPath();
  ctx.moveTo(this.pos.x, this.pos.y);
  ctx.lineTo(this.pos.x + v.mul(10).x, this.pos.y + v.mul(10).y);
  ctx.closePath();
  ctx.stroke();
*/
  //ctx.strokeStyle = '#000000';
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(this.pos.x, this.pos.y, this.exc - 0.5, 0, Math.PI * 2, false);
  ctx.arc(this.pos.x - v.mul(this.exc - 0.5).x, this.pos.y - v.mul(this.exc - 0.5).y, 
          this.exc, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
  //ctx.stroke();
  
  /*
  ctx.strokeStyle = '#888888';
  ctx.beginPath();
  ctx.moveTo(this.pos.x, this.pos.y);
  var p = new Polar(1, this.v.dir);
  p.dir -= this.vision.angle / 2;
  v = p.toVector();
  ctx.lineTo(this.pos.x + v.mul(this.vision.range).x, this.pos.y + v.mul(this.vision.range).y);
  ctx.arc(this.pos.x, this.pos.y, this.vision.range, p.dir, p.dir + this.vision.angle, false);
  ctx.closePath();
  ctx.stroke();
  */
}
var random_point_in_circle = function(limit) {
  var pos = new Vector(0,0);
  while(!pos.inCircle(limit, limit.r - 10))
    pos = new Vector(limit.x - limit.r + Math.random() * limit.r * 2,
                    limit.y - limit.r + Math.random() * limit.y * 2);
  return pos;
}
var exclude = function(pos, from) {
  for(var i = 0; i < from.length; i++) {
    if(!pos.inCircle(from[i], from.r)) continue;

    diff = pos.sub(from[i].pos);
    dir = diff.norm();
    mag = diff.mag();

    if(mag < from[i].r + 1) {
      if(mag == 0)
        pos.iadd((new Vector(1 - 2 * Math.random(), 1 - 2 * Math.random())).norm().mul(from[i].r + 1));
      else 
        pos.iadd(dir.mul(from[i].r - mag + 1));
    }
  }
}
var include = function(pos, limit) {
  diff = pos.sub(limit);
  dir = diff.norm();
  mag = diff.mag();
  if(mag > limit.r) {
    var new_pos = new Polar(limit.r, diff.toPolar().dir).toVector().add(limit);
    pos.x = new_pos.x;
    pos.y = new_pos.y;
  }
}

var test = function(ctx) {
  var limit = {x:300, y:300, r:300, inner_size:0};
  limit.inner_size = limit.r * Math.sin(Math.PI / 4);

  var nest = {pos: new Vector(limit.x, limit.y), size:20};

  var ants = new Array();
  for(var i = 0; i < 100; ++i) 
    ants.push(new Ant(nest.pos.x + 0.5 - Math.random(), nest.pos.y + 0.5 - Math.random()));

  var spoor = new Array();


  var rocks = new Array();
  for(var i = 0; i < 30; i++) {
    var pos = random_point_in_circle(limit);
    rocks.push(new Rock(pos.x, pos.y, 40 * Math.random()));
  }

  var food = new Array();
  var refresh_food = function() {
    while(food.length < 200) {
      var pos = random_point_in_circle(limit);
      exclude(pos, rocks);
      var nfoods = 10 + 30 * Math.random();
      for(var i = 0; i < nfoods; i++) {
        pos.x += -5 + Math.random() * 10;
        pos.y += -5 + 10 * Math.random();
        for(var j = 0; j < 10; j++) {
          exclude(pos, rocks);
          include(pos, limit);
        }
        food.push(new Food(pos.x, pos.y));
      }
    }
  }

  refresh_food();
  setInterval(refresh_food, 1000);
  
  setInterval(function() { 

  for(var i = 0; i < spoor.length; ++i) spoor[i].seen = false;
  for(var i = 0; i < spoor.length; ++i) spoor[i].iterate();
  for(var i = 0; i < spoor.length; ++i) 
    if(spoor[i].age > 255) { 
      spoor.splice(i,1);
      i--;
    }

  for(var i = 0; i < ants.length; ++i) 
    ants[i].iterate(ants, i, spoor, food, nest, limit);

  for(var j = 0; j < 1; j++)
    for(var i = 0; i < ants.length; ++i) {
      ants[i].applyExclusion(ants, i, limit);
      exclude(ants[i].pos, rocks);
    }

  ctx.clearRect(0, 0, limit.x + limit.r + 10, limit.y + limit.r + 10);
  for(var i = 0; i < rocks.length; ++i) rocks[i].draw(ctx);
  for(var i = 0; i < spoor.length; ++i) spoor[i].draw(ctx);
  for(var i = 0; i < food.length; ++i) food[i].draw(ctx);
  for(var i = 0; i < ants.length; ++i) ants[i].draw(ctx);

/*
  var av = new Vector(0,0);
  av = new Vector(0,0);
  for(var i = 0; i < ants.length; ++i) av.iadd(ants[i].pos);

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
*/
  ctx.fillStyle = "#F80";
  ctx.beginPath();
  ctx.arc(nest.pos.x, nest.pos.y, 20, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#000"
  ctx.beginPath()
  ctx.arc(limit.x, limit.y, limit.r, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.stroke();
  }, 50);
}
