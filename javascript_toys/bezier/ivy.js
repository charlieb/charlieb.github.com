
var Segment = function(x,y,r,w,len) {
  this.pos = new Vector(x,y);
  this.r = r; //rotation
  this.w = w; // width
  this.len = len;
}

Segment.prototype.draw = function(ctx) {
  var hi_offset = new Polar(this.w, this.r - Math.PI / 2).toVector();
  var lo_offset = new Polar(this.w, this.r + Math.PI / 2).toVector();
  var front_offset = new Polar(this.len, this.r).toVector();
  ctx.beginPath();
  ctx.moveTo(this.pos.x + lo_offset.x, this.pos.y + lo_offset.y);
  ctx.lineTo(this.pos.x + lo_offset.x + front_offset.x, this.pos.y + lo_offset.y + front_offset.y);
  ctx.lineTo(this.pos.x + hi_offset.x + front_offset.x, this.pos.y + hi_offset.y + front_offset.y);
  ctx.lineTo(this.pos.x + hi_offset.x, this.pos.y + hi_offset.y);
  ctx.lineTo(this.pos.x + lo_offset.x, this.pos.y + lo_offset.y);
  ctx.closePath();
  ctx.stroke();
}
Segment.prototype.getEndOffset = function() { return new Polar(this.len, this.r).toVector(); }

var Curve = function(x,y) {
  this.x = x;
  this.y = y;
  this.r = 0;
  this.r_target = 0;
  this.dr = 0;
}
Curve.prototype.iterate = function(ctx) {
  if(this.r_target - this.r <= 0) {
    this.r_target = Math.PI * 4 - Math.random() * Math.PI * 8;
    this.dr = (this.r_target - this.r) / (Math.random() * 50);
  }
  this.r += this.dr + Math.random() / 10;
  var seg = new Segment(this.x, this.y, this.r, 10, 10);
  seg.draw(ctx);
  var end = seg.getEndOffset();
  this.x += end.x;
  this.y += end.y;
}
var BezierCurve = function(x,y) {
  this.p1 = new Vector(x,y);
  this.p2 = new Vector(320 + Math.random() * 320, 240 + Math.random() * 240);
  this.p3 = new Vector(320 + Math.random() * 320, 240 + Math.random() * 240);
  this.p4 = new Vector(320 + Math.random() * 320, 240 + Math.random() * 240);
  this.t = 0;
}
BezierCurve.prototype.iterate = function(ctx) {
  var dt = 0.05;
  if(this.t > 1) {
    this.p1 = this.p4;
    // p2 has to become the opposite of p3
    // reflected across p4
    this.p2 = this.p1.sub(this.p3.sub(this.p4));
    var pass = false;
    var turn_limit = 5 * Math.PI / 8;
    while(!pass) {
      this.p4 = new Polar(200 - Math.random() * 400, this.p2.toPolar().dir - turn_limit + Math.random() * turn_limit * 2).toVector().add(this.p1);
      this.p3 = new Polar(50 + Math.random() * 100, this.p4.sub(this.p1).toPolar().dir - turn_limit + Math.random() * turn_limit * 2).toVector().add(this.p4);
      if(this.p4.x > 0 &&this.p4.x < 800 && this.p4.y > 0 && this.p4.y < 600) pass = true;
    }
    this.t = 0;
    console.log([this.p1.x, this.p1.y], [this.p2.x, this.p2.y], [this.p3.x, this.p3.y], [this.p4.x, this.p4.y]);
  }
  var p1 = bezier(this.t, this.p1, this.p2, this.p3, this.p4);
  this.t += dt;
  var p2 = bezier(this.t, this.p1, this.p2, this.p3, this.p4);
  var d = p2.sub(p1).toPolar();
  var seg = new Segment(p1.x, p1.y, d.dir, 10, d.mag);
  seg.draw(ctx);
}
BezierCurve.prototype.draw = function(ctx) {
  var dt = 0.05;
  var p1, p2, d, seg;
  for(var t = 0; t <= 1; t += dt) {
    p1 = bezier(t, this.p1, this.p2, this.p3, this.p4);
    p2 = bezier(t+dt, this.p1, this.p2, this.p3, this.p4);
    d = p2.sub(p1).toPolar();
    //seg = new Segment(p1.x, p1.y, d.dir, 15 - 15 * t, d.mag);
    seg = new Segment(p1.x, p1.y, d.dir, 10, d.mag);
    seg.draw(ctx);
  }
}

var BezierPoints = function(points) { 
    this.points = points;
}
BezierPoints.prototype.draw = function(ctx){
    var cycles = 0, i = 0;
    var c = new BezierCurve(0,0);
    while(i < this.points.length) {
        c.p1 = this.points[i%this.points.length];
        i++;
        c.p2 = this.points[i%this.points.length];
        i++;
        c.p3 = this.points[i%this.points.length];
        i++;
        c.p4 = this.points[i%this.points.length];
        i++;
        c.p3 = c.p4.add(c.p4.sub(c.p3));
        c.draw(ctx);
    }
}

var bezier = function(t, p1,p2,p3,p4) {
  return new Vector(
    // X
    Math.pow(1-t,3) * p1.x + 
      3 * Math.pow(1 - t, 2) * t * p2.x + 
      3 * (1 - t) * Math.pow(t,2) * p3.x +
      Math.pow(t,3) * p4.x,
    // Y
    Math.pow(1-t,3) * p1.y + 
      3 * Math.pow(1 - t, 2) * t * p2.y + 
      3 * (1 - t) * Math.pow(t,2) * p3.y +
      Math.pow(t,3) * p4.y);
}
var interleave = function() {
    var res = new Array();
    var narys = arguments.length;
    var min_length = arguments[0].length;
    for(var i = 0; i < narys; i++)
        if(arguments[i].length < min_length)
            min_length = arguments[i].length;
    for(var i = 0; i < min_length; i++)
        for(var j = 0; j < narys; j++)
            res.push(arguments[j][i]);
    return res;
}

var circle_point = function(center, radius, angle, point_angle) {
    return new Vector(radius * Math.cos(angle + point_angle),
                    radius * Math.sin(angle + point_angle)).add(center);
}
var circle = function(center, radius, angle, npoints) {
    var da = Math.PI * 2 / npoints;
    var points = new Array();
    for(var i = 0; i < npoints; i++)
        points.push(circle_point(center, radius, angle, i * da));
    return points;
}
var ellipse_point = function(center, minor, major, angle, point_angle) {
    return new Vector(major * Math.cos(point_angle) * Math.cos(angle) - minor * Math.sin(point_angle) * Math.sin(angle),
                      major * Math.cos(point_angle) * Math.sin(angle) + minor * Math.sin(point_angle) * Math.cos(angle)) .add(center);
}

var ellipse = function(center, minor, major, offset, angle, npoints) {
    var da = Math.PI * 2 / npoints;
    var points = new Array();
    for(var i = 0; i < npoints; i++)
        points.push(ellipse_point(center, minor, major, angle, i * da + offset));
    return points;
}

var test = function(ctx) {
  var c = new Curve(320, 240);
  var b = new BezierCurve(320, 240);
  var bp = new BezierPoints([]);
  var i = 0;
  setInterval(function() {
    ctx.clearRect(0, 0, 1280, 1024);
    //c.iterate(ctx);
    //b.iterate(ctx);
    i++;
    var sine_wave = Math.sin(i * Math.PI * 2 / 100);
    var r1 = 100 + 75 * sine_wave;
    var r2 = 100 - 75 * sine_wave;
    var da = Math.PI * 2 / 250;
    var a = i * da;
    var segs = 9;
    var seg_da = Math.PI * 2 / segs;
    var c1a1 = circle(new Vector(350,300), r1, a, segs);
    var c1a2 = circle(new Vector(350,300), r1, a+seg_da, segs);
    var c2a1 = circle(new Vector(350,300), r2, a, segs);
    var c1a3 = circle(new Vector(350,300), r1, a+2*seg_da, segs);

    var c1a1 = ellipse(new Vector(350,300), r2, r1, a, a, segs);
    var c1a2 = ellipse(new Vector(350,300), r2, r1, a+seg_da, a, segs);
    var c1a3 = ellipse(new Vector(350,300), r2, r1, a+seg_da+seg_da, a, segs);
    var c2a1 = ellipse(new Vector(350,300), r1, r2, a, a, segs);
    bp.points = interleave(c1a1, c1a2, c1a1, c2a1,  c2a1, c1a1, c1a3, c1a2);
    bp.draw(ctx);
  }, 30);
}
