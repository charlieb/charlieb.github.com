

var Vector = function(x, y) {
  this.x = x;
  this.y = y;
}
Vector.prototype = {
  add: function(v) {
    return new Vector(this.x + v.x, this.y + v.y);
  },
  iadd: function(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  },
  mul: function(m) {
    return new Vector(this.x * m, this.y * m);
  },
  imul: function(m) {
    this.x *= m;
    this.y *= m;
    return this;
  },
  sub: function(v) {
    return new Vector(this.x - v.x, this.y - v.y);
  },
  isub: function(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  },
  div: function(m) {
    return new Vector(this.x / m, this.y / m);
  },
  idiv: function(m) {
    this.x /= m;
    this.y /= m;
    return this;
  },
  neg: function() {
    return new Vector(-this.x, -this.y);
  },
  ineg: function(v) {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  },

  mag: function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  },
  norm: function() {
    var m = this.mag();
    return this.div(m);
  },
  inorm: function() {
    var m = this.mag();
    this.x /= m;
    this.y /= m;
    return this;
  },
  dot: function(v) {
    return this.x * v.x + this.y * v.y;
  },
  angle_between: function(v) {
    return Math.acos(this.norm().dot(v.norm()));
  },
  to: function(v) {
    return v.sub(this);
  },
  toString: function() {
    return "v(" + this.x + ", " + this.y + ")";
  },
  toPolar: function() {
    var angle;

    if(this.x < 0 && this.y < 0)
      angle = Math.PI + Math.atan(this.x / -this.y) + Math.PI / 2;
    else if( this.x < 0 && this.y == 0)
      angle = Math.PI / 2  + Math.PI / 2;
    else if(this.x < 0 && this.y > 0)
      angle = Math.PI / 2 + Math.atan(this.y / this.x)  + Math.PI / 2;

    else if(this.x == 0 && this.y < 0)
      angle = Math.PI + Math.PI / 2;
    //Don't change anything in this case    
    // else if this.x == 0 && this.y == 0:
  else if(this.x == 0 && this.y > 0)
    angle = 0 + Math.PI / 2;

  else if(this.x > 0 && this.y > 0)
    angle = Math.atan(this.x / -this.y)  + Math.PI / 2;
  else if(this.x > 0 && this.y == 0)
    angle = 3 * Math.PI / 2 + Math.PI / 2;
  else if(this.x > 0 && this.y < 0)
    angle = 3 * Math.PI / 2 + Math.atan(this.y / this.x) + Math.PI / 2;

  return new Polar(this.mag(), angle);
  },
  inTriangle: function(p1, p2, p3) {
    var 
    v0 = p2.sub(p1),
    v1 = p3.sub(p1),
    v2 = this.sub(p1),

    dot00 = v0.dot(v0),
    dot01 = v0.dot(v1),
    dot02 = v0.dot(v2),
    dot11 = v1.dot(v1),
    dot12 = v1.dot(v2),

    // Compute barycentric coordinates
    invDenom = 1 / (dot00 * dot11 - dot01 * dot01),
    u = (dot11 * dot02 - dot01 * dot12) * invDenom,
    v = (dot00 * dot12 - dot01 * dot02) * invDenom;

    // Check if point is in triangle
    return (u > 0) && (v > 0) && (u + v < 1)
  },
  inRectangle: function(vmin, vmax) {
    return this.x >= vmin.x && this.x <= vmax.x &&
    this.y >= vmin.y && this.y <= vmax.y;
  }
}

var Polar = function(mag, dir) {
  this.mag = mag;
  this.dir = dir;
}
Polar.prototype = {
  toVector: function() {
    return new Vector(this.mag * Math.cos(this.dir),
    this.mag * Math.sin(this.dir));
  },
  toString: function() {
    return "p(" + this.mag + ", " + this.dir + ")";	
  }
}

var vectorTest = function(element) {
  element.innerHTML += '<h3>vectorTest</h3>';

  element.innerHTML += '<br>V1: ';
  var v1 = new Vector(1, 2);
  element.innerHTML += v1.toString();

  element.innerHTML += '<br>V2: ';
  var v2 = new Vector(1, 2);
  element.innerHTML += v2.toString();

  element.innerHTML += '<br>Add: ' + v1.toString() + ' + ' + v2.toString() + " -> ";
  element.innerHTML += v1.add(v2).toString();

  element.innerHTML += '<br>IAdd: ' + v1.toString() + " += " + v2.toString() + " -> ";
  v1.iadd(v2);
  element.innerHTML += v1.toString();

  v1 = new Vector(2,2);
  element.innerHTML += '<br>Mul: ' + v1.toString() + " * 2" + " -> ";
  element.innerHTML += v1.mul(2).toString();

  element.innerHTML += '<br>IMul: ' + v1.toString() + " *= 2" + " -> ";
  v1.imul(2)
  element.innerHTML += v1.toString();

  element.innerHTML += '<br>Sub: ' + v1.toString() + " - " + v2.toString() + " -> ";
  element.innerHTML += v1.sub(v2).toString();

  element.innerHTML += '<br>ISub: ' + v1.toString() + " -= " + v2.toString() + " -> ";
  v1.isub(v2);
  element.innerHTML += v1.toString();

  v1 = new Vector(4,6);
  element.innerHTML += '<br>Div: ' + v1.toString() + " / 2" + " -> ";
  element.innerHTML += v1.div(2).toString();

  element.innerHTML += '<br>IDiv: ' + v1.toString() + " /= 2" + " -> ";
  v1.idiv(2)
  element.innerHTML += v1.toString();

  v1 = new Vector(4,6);
  element.innerHTML += '<br>Neg: -' + v1.toString() + " -> ";
  element.innerHTML += v1.neg().toString();

  element.innerHTML += '<br>INeg: -' + v1.toString() + " -> ";
  v1.ineg()
  element.innerHTML += v1.toString();

  v1 = new Vector(1,1);
  element.innerHTML += '<br>Mag: ' + v1.toString() + " -> ";
  element.innerHTML += v1.mag();

  v1 = new Vector(1,1);
  element.innerHTML += '<br>Norm: ' + v1.toString() + " -> ";
  element.innerHTML += v1.norm().toString();

  element.innerHTML += '<br>INorm: ' + v1.toString() + " -> ";
  v1.inorm()
  element.innerHTML += v1.toString();


  element.innerHTML += '<br>'
}

var iterator = 0;
var drawTest = function(ctx) {
  var v, c, p = new Polar(50, iterator / 10);
  iterator += 1;

  c = new Vector(50, 50);
  ctx.strokeStyle = '#0000FF';
  ctx.beginPath();
  v = p.toVector();
  ctx.moveTo(c.x, c.y);
  ctx.lineTo(c.x + v.x, c.y + v.y);
  ctx.closePath();
  ctx.stroke();   

  c = new Vector(100, 100);
  if(iterator < 50)
    v = new Vector(-25, iterator - 25);
  else if(iterator < 100)
    v = new Vector(iterator - 75, 25);
  else if(iterator < 150)
    v = new Vector(25, 125 - iterator);
  else if(iterator < 200)
    v = new Vector(175 - iterator, -25);

  ctx.strokeStyle = '#FF0000';
  ctx.beginPath();
  ctx.moveTo(c.x, c.y);
  ctx.lineTo(c.x + v.x, c.y + v.y);
  ctx.closePath();
  ctx.stroke();   

  c = new Vector(150, 150);
  p = v.toPolar();
  p.mag = 25;
  v = p.toVector();
  ctx.strokeStyle = '#00FF00';
  ctx.beginPath();
  ctx.moveTo(c.x, c.y);
  ctx.lineTo(c.x + v.x, c.y + v.y);
  ctx.closePath();
  ctx.stroke();
}

var test = function(ctx) {
  setInterval(function() { drawTest(ctx); }, 50 );
}
