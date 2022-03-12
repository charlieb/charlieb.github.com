
var debug = false;
var distance_scale_factor = 1000; // pixels per meter
// 1000 = 10 pixels per centimeter

var Magnet = function(pos, attract) {
  this.pos = pos;
  this.attract = attract;
}
Magnet.prototype.draw = function(offset, ctx) {
  ctx.strokeStyle = this.attract ? '#00FF00' : '#FF0000';
  ctx.beginPath();
  ctx.arc(this.pos.x + offset.x, this.pos.y + offset.y, 5, 0, Math.PI * 2, false)
  ctx.closePath();
  ctx.stroke();
}
Magnet.prototype.force = function(pos) {
  /*
  * F = u*qm1*qm2 / 4*pi*r**2
  * u = permiability of medium (1.0 for our purposes)
  * qm1 and qm2 = strength of the magnets (1.0 for our purposes)
  * r = seperation
  */
  diff = this.pos.sub(pos);
  r = diff.mag() / distance_scale_factor;
  f = 0.01 / (4 * Math.PI * r*r);

  return (this.attract ? diff.norm().mul(f) : diff.norm().neg().mul(f));
}

var Pendulum = function() {
  this.pos = new Vector(100,100);
  this.prev_pos = new Vector(this.pos.x, this.pos.y);;
  this.vel = new Vector(0,0);
  this.length = 10;
}
Pendulum.prototype.draw = function(offset, ctx) {
  ctx.strokeStyle = '#222222';
  ctx.beginPath();
  ctx.moveTo(this.prev_pos.x + offset.x, this.prev_pos.y + offset.y);
  ctx.lineTo(this.pos.x + offset.x, this.pos.y + offset.y);
  //ctx.arc(this.pos.x + offset.x, this.pos.y + offset.y, 2, 0, Math.PI * 2, false)
  ctx.closePath();
  ctx.stroke();
}
Pendulum.prototype.iterate = function(magnets, dt) {
  /*
   * the force towards the center is the moment of
   * gravity in the direction perpendicular to the 
   * pendulum.
   * Which we calculate from the distance from the 
   * origin.
   */
  var d = this.pos.mag();
  var th = Math.atan(d/this.length);
  var f = d * Math.tan(th/2) * Math.cos(th);

  var force = this.pos.norm().neg().mul(f);
  var len = magnets.length;
  for(var i = 0; i < len; i++) {
    force.iadd(magnets[i].force(this.pos))
  }

  /* mass = 1 therefore force = acceleration */
  this.prev_pos.x = this.pos.x;
  this.prev_pos.y = this.pos.y;
  this.vel.iadd(force.mul(dt));
  this.pos.iadd(this.vel.mul(dt));
}
Pendulum.prototype.toString = function() {
  return this.pos.toString() + ' -> ' + this.vel.toString();
}

/******************************************/
var test = function(canvas) {
  var ctx = canvas.getContext('2d');

  ctx.font = '20px sans-serif';

  document.addEventListener('keydown', 
    function (e) { keyHandler(e.which, false, ctrl_boid);},
    false);
  document.addEventListener('keyup',
    function (e) { keyHandler(e.which, true, ctrl_boid);},
    false);

  nmagnets = 10;
  magnets = new Array();
  for(i = 0; i < nmagnets; ++i) 
    magnets.push(
      new Magnet(
        new Vector(200 - Math.random() * 400,
                   200 - Math.random() * 400),
        (Math.random() > 0.5)));
  offset = new Vector(250, 250);

  pendulum = new Pendulum();
  anim = function() { 
      pendulum.iterate(magnets, 0.2);
      for(i = 0; i < nmagnets; ++i) 
        magnets[i].draw(offset, ctx);
      pendulum.draw(offset, ctx); 
	    if(debug) debug.innerHTML += '<br>' + pendulum.toString();
    };
    setInterval(anim, 10);
}
