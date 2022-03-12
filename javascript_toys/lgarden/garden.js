function Production(n_rules, rule_len)
{
	this.n_rules = n_rules;
	this.rule_len = rule_len;
	this.iterations = 0;
	this.expansion = "0";
	this.rules = new Array(this.n_rules);
	for(var i = 0; i < this.n_rules; ++i)
		this.rules[i] = "";
}

function Production_reset()
{
	this.iterations = 0;
	this.expansion = "0";
	this.rules = new Array(this.n_rules);
	for(var i = 0; i < this.n_rules; ++i)
		this.rules[i] = "";
}
Production.prototype.reset = Production_reset;

function Production_set_rules(rules)
{
	for(var i = 0; i < this.n_rules; ++i)
		this.rules[i] = rules.substr(this.rule_len * i, this.rule_len);
}
Production.prototype.set_rules = Production_set_rules;

function Production_set_rule(rule_no, new_rule)
{
	this.rules[rule_no] = new_rule;
}
Production.prototype.set_rule = Production_set_rule;

function Production_print_rules()
{
	for(var rule in this.rules) {
		document.write("<br>");
		document.write(rule + ": " + this.rules[rule]);
	}
}
Production.prototype.print_rules = Production_print_rules;

function Production_rules_string()
{
	var rules_str = "";
	for(var rule in this.rules)
		rules_str += this.rules[rule];
	return rules_str;
}
Production.prototype.rules_string = Production_rules_string;

function Production_iterate()
{
	var new_exp = "";
	for(var i = 0; i < this.expansion.length; ++i) {
		var rule_no = parseInt(this.expansion[i]);
		if(isNaN(rule_no))
			new_exp += this.expansion[i];
		else if(rule_no < this.rules.length)
		new_exp += this.rules[rule_no];
		else
			alert("Production.Iterate: Bad rule index " + rule_no);
	}
	this.expansion = new_exp;
	this.iterations++;
}
Production.prototype.iterate = Production_iterate;

function Production_uniterate()
{
	var its =	this.iterations - 1;
	this.iterations = 0;
	this.expansion = "0";
	for(var i = 0; i < its; ++i)
		this.iterate();
}
Production.prototype.uniterate = Production_uniterate;

function Production_randomize_rules()
{
	var rule_chars = "!+-[]";
	var i, r;

	for(i = 0; i < this.n_rules; ++i)
		rule_chars += i;

	for(r = 0; r < this.n_rules; ++r) {
		this.rules[r] = "";
		for(i = 0; i < this.rule_len; ++i)
			this.rules[r] += rule_chars[Math.floor(rule_chars.length * Math.random())];
	}
}
Production.prototype.randomize_rules = Production_randomize_rules;

/***********************/

function Point(x, y)
{
	this.x = x;
	this.y = y;
}

function Point_print()
{
	document.write("(" + this.x + "," + this.y + ")");
}
Point.prototype.print = Point_print;

function Line(x1, y1, x2, y2)
{
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
}

function Line_print()
{
	document.write("("+this.x1+","+this.y1+")-("+this.x2+","+this.y2+")");
}
Line.prototype.print = Line_print;

function Rect(x1, y1, x2, y2)
{
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
}

function Rect_size()
{
	return new Point(Math.abs(this.x1 - this.x2), Math.abs(this.y1 - this.y2));
}
Rect.prototype.size = Rect_size;

function Rect_toString()
{
	return "("+this.x1+","+this.y1+")-("+this.x2+","+this.y2+")";
}
Rect.prototype.toString = Rect_toString;

/*********************/

function Turtle()
{
	this.walk_len = 5;
	this.angle_inc = 5;

	this.reset();
}

function Turtle_reset()
{
	this.pos_stack = new Array();
	this.pos = new Point(0, 0);

	this.angle_stack = new Array();
	this.angle = -90;

	this.branches = new Array();
	this.leaves = new Array();
}
Turtle.prototype.reset = Turtle_reset;

function Turtle_isLeaf(instructs, ch)
{
	var depth = 0;
	for(var i = ch + 1; i < instructs.length; ++i)
		switch(instructs[i]) {
		case "!":
			return false;
		case "[":
			depth++;
			break;
		case "]":
			if(0 == depth)
				return true;
			depth--;
			break;
		default:
			break;
		}
	/* we got to the end */
	return true;
}
Turtle.prototype.isLeaf = Turtle_isLeaf;

function Turtle_walk()
{
	//document.write("Walk: (" + this.pos.x + "," + this.pos.y + ") -> ");
	this.pos.x += this.walk_len * Math.cos(Math.PI * this.angle / 180);
	this.pos.y += this.walk_len * Math.sin(Math.PI * this.angle / 180);
	//document.write("(" + this.pos.x + "," + this.pos.y + ")<br>");
}
Turtle.prototype.walk = Turtle_walk;

function Turtle_push()
{
	this.pos_stack.push(new Point(this.pos.x, this.pos.y));
	this.angle_stack.push(this.angle);
	//document.write("Push<br>");
}
Turtle.prototype.push = Turtle_push;

function Turtle_pop()
{
	/* if there is nothing on the stack ignore it */
	if(0 == this.pos_stack.length)
		return;

	this.pos = this.pos_stack.pop();
	this.angle = this.angle_stack.pop();
	//document.write("Pop (" + this.pos.x + "," + this.pos.y + ")<br>");
}
Turtle.prototype.pop = Turtle_pop;

function Turtle_generate_tree(instructs)
{
	this.reset();

	for(var i = 0; i < instructs.length; ++i)
		if(isNaN(parseInt(instructs[i])))
			switch(instructs[i]) {
			case "!":
				var p = new Point(this.pos.x, this.pos.y);
				this.walk();
				if(this.isLeaf(instructs, i))
					this.leaves.push(new Line(p.x, p.y, this.pos.x, this.pos.y));
				else
					this.branches.push(new Line(p.x, p.y, this.pos.x, this.pos.y));
				break;
			case "+":
				this.angle += this.angle_inc;
				break;
			case "-":
				this.angle -= this.angle_inc;
				break;
			case "[":
				this.push();
				break;
			case "]":
				this.pop();
				break;
			default:
				alert("Turtle.draw: Bad instruction " + inst);
				break;
			}
}
Turtle.prototype.generate_tree = Turtle_generate_tree;

function Turtle_draw(x, y, canvas)
{
	var context = canvas.getContext("2d");
	var drawn = 0;

	context.beginPath();
	context.strokeStyle = "rgba(100,100,0,1)";
	for(var b in this.branches) {
		context.moveTo(x + this.branches[b].x1, y + this.branches[b].y1);
		context.lineTo(x + this.branches[b].x2, y + this.branches[b].y2);
	}
	context.stroke();

	context.beginPath();
	context.strokeStyle = "rgba(0,255,0,1)";
	for(var leaf in this.leaves) {
		context.moveTo(x + this.leaves[leaf].x1, y + this.leaves[leaf].y1);
		context.lineTo(x + this.leaves[leaf].x2, y + this.leaves[leaf].y2);
	}
	context.stroke();
}
Turtle.prototype.draw = Turtle_draw;

function Turtle_tree_extents()
{
	var xmin = 0, ymin = 0, xmax = 0, ymax = 0, i;
	for(i in this.branches) {
		if(xmin > this.branches[i].x1)
			xmin = this.branches[i].x1;
		if(ymin > this.branches[i].y1)
			ymin = this.branches[i].y1;
		if(xmin > this.branches[i].x2)
			xmin = this.branches[i].x2;
		if(ymin > this.branches[i].y2)
			ymin = this.branches[i].y2;

		if(xmax < this.branches[i].x1)
			xmax = this.branches[i].x1;
		if(ymax < this.branches[i].y1)
			ymax = this.branches[i].y1;
		if(xmax < this.branches[i].x2)
			xmax = this.branches[i].x2;
		if(ymax < this.branches[i].y2)
			ymax = this.branches[i].y2;
	}

	for(i in this.leaves) {
		if(xmin > this.leaves[i].x1)
			xmin = this.leaves[i].x1;
		if(ymin > this.leaves[i].y1)
			ymin = this.leaves[i].y1;
		if(xmin > this.leaves[i].x2)
			xmin = this.leaves[i].x2;
		if(ymin > this.leaves[i].y2)
			ymin = this.leaves[i].y2;

		if(xmax < this.leaves[i].x1)
			xmax = this.leaves[i].x1;
		if(ymax < this.leaves[i].y1)
			ymax = this.leaves[i].y1;
		if(xmax < this.leaves[i].x2)
			xmax = this.leaves[i].x2;
		if(ymax < this.leaves[i].y2)
			ymax = this.leaves[i].y2;
	}
	return new Rect(xmin, ymin, xmax, ymax);
}
Turtle.prototype.tree_extents = Turtle_tree_extents;

/**********************/

function TreeCanvas(canvas)
{
	this.canvas = canvas;
	var c = this;
	this.canvas.addEventListener("click", function(e) { c.onClick(e); }, false);
	this.canvas.addEventListener("mousemove", function(e) { c.onMouseMove(e); }, false);
	this.canvas.addEventListener("mouseout", function(e) { c.onMouseOut(e); }, false);

	this.trees_x = 10;
	this.trees_y = 10;
	this.x_offset = this.canvas.width / this.trees_x;
	this.y_offset = this.canvas.height / this.trees_y;

	this.up_out_down = new Image();
	this.up_out_down.src = 'up_out_down.jpg';

	this.last_mouse_x = -1;
	this.last_mouse_y = -1;

	this.productions = new Array();
	this.turtles = new Array();
	for(var i = 0; i < this.trees_x * this.trees_y; ++i) {
		this.productions.push(new Production(5,7));
		this.productions[i].randomize_rules();
		this.productions[i].iterate();
		this.productions[i].iterate();
		this.productions[i].iterate();
		this.turtles[i] = new Turtle();
	}
	this.drawTrees();
}


function TreeCanvas_clear()
{
	var context = this.canvas.getContext("2d");
	context.FillStyle = "rgba(0,0,0,1)";
	context.fillRect(0, 0, this.canvas.width, this.canvas.height);
}
TreeCanvas.prototype.clear = TreeCanvas_clear;

function TreeCanvas_treePos(x, y)
{
	var tx = 0, ty = 0;
	while(++tx * this.x_offset < x);
	tx--;
	while(++ty * this.y_offset < y);
	ty--;
	return new Point(tx, ty);
}
TreeCanvas.prototype.treePos = TreeCanvas_treePos;

function TreeCanvas_findTreeIdx(x, y)
{
	var pt = this.treePos(x, y);
	return pt.x + pt.y * this.trees_x;
}
TreeCanvas.prototype.findTreeIdx = TreeCanvas_findTreeIdx;

function TreeCanvas_controlBoxRect(tx, ty)
{
	var left = tx * this.x_offset + this.x_offset / 2 - 20;
	var top = (ty+1) * this.y_offset - 30;

	return new Rect(left, top, left + 10, top + 30);
}
TreeCanvas.prototype.controlBoxRect = TreeCanvas_controlBoxRect;

function TreeCanvas_controlBoxClick(x, y, tree_idx)
{

	if(y < 10)
		this.productions[tree_idx].iterate();
	else if(y < 20)
		this.productions[tree_idx].reset();
	else if(y < 30)
		this.productions[tree_idx].uniterate();
	this.drawTrees();

}
TreeCanvas.prototype.controlBoxClick = TreeCanvas_controlBoxClick;

function TreeCanvas_onClick(e)
{
	/* e will give us absolute x, y so we need to
	 *  calculate relative to canvas position */
	var x = e.clientX - e.target.offsetLeft;
	var y = e.clientY - e.target.offsetTop;
	var pt = this.treePos(x, y);
	var rect = this.controlBoxRect(pt.x, pt.y);
	/*
	alert("Canvas.onClick: (" + x + ", " + y + ")" +
			 "box: (" + rect.x1 + ", " + rect.y1 + ")->(" +
				rect.x2 + ", " + rect.y2 + ")");
	 */

	/* is the click within the control box */
	if(x > rect.x1 && x < rect.x2 && y > rect.y1 && y < rect.y2)
		this.controlBoxClick(x - rect.x1, y - rect.y1, this.findTreeIdx(x, y));
	else
		this.popTree(this.findTreeIdx(x, y));

  return false;
}
TreeCanvas.prototype.onClick =  TreeCanvas_onClick;

function TreeCanvas_onMouseMove(e)
{
	/* e will give us absolute x, y so we need to
	 *  calculate relative to canvas position */
	var x = e.clientX - e.target.offsetLeft;
	var y = e.clientY - e.target.offsetTop;

	var pt = this.treePos(x, y);

	if(this.last_x != pt.x || this.last_y != pt.y) {
		this.drawTrees();
		var ctx = this.canvas.getContext("2d");
		var rect = this.controlBoxRect(pt.x, pt.y);
		ctx.drawImage(this.up_out_down,
									rect.x1, rect.y1,
									rect.x2 - rect.x1, rect.y2 - rect.y1);
		this.last_x = tx;
		this.last_y = ty;
	}

	return false;
}
TreeCanvas.prototype.onMouseMove = TreeCanvas_onMouseMove;

function TreeCanvas_onMouseOut(e)
{
	this.drawTrees();
}
TreeCanvas.prototype.onMouseOut = TreeCanvas_onMouseOut;

function TreeCanvas_popTree(tree_idx)
{
	var turtle = new Turtle();
	var prod = this.productions[tree_idx];

	turtle.walk_len = 15;
	turtle.generate_tree(prod.expansion);
	var extent = turtle.tree_extents();
	var size = extent.size();
	var context = this.canvas.getContext("2d");
	context.FillStyle = "rgba(0,0,0,1)";
	context.fillRect(this.canvas.width / 2 - size.x,
									 this.canvas.height / 2 - size.y,
									 size.x * 2, size.y * 2);
	context.beginPath();
	context.strokeStyle = "rgba(100,100,100,1)";
	context.rect(this.canvas.width / 2 - size.x,
							 this.canvas.height / 2 - size.y,
							 size.x * 2, size.y * 2);
	context.stroke();
	turtle.draw(this.canvas.width / 2 - size.x / 2 - extent.x1,
							this.canvas.height / 2 - size.y / 2 - extent.y1, this.canvas);
}
TreeCanvas.prototype.popTree = TreeCanvas_popTree;

function TreeCanvas_drawTrees()
{
	var prod, turtle;
	var context = this.canvas.getContext("2d");

	this.clear();

	for(var x = 0; x < this.trees_x; ++x)
		for(var y = 0; y < this.trees_y; ++y) {
			turtle = this.turtles[x + y * this.trees_x];
			prod = this.productions[x + y * this.trees_x];
			turtle.generate_tree(prod.expansion);
			turtle.draw(x * this.x_offset + this.x_offset / 2,
									y * this.y_offset + this.y_offset * 0.75, this.canvas);
		}
}
TreeCanvas.prototype.drawTrees = TreeCanvas_drawTrees;

function TreeCanvas_iterate_all()
{
	for(var p = 0; p < this.productions.length; ++p)
		if(this.productions[p].iterations > 0)
			this.productions[p].iterate();
	this.drawTrees();
}
TreeCanvas.prototype.iterate_all = TreeCanvas_iterate_all;

function TreeCanvas_uniterate_all()
{
	for(var p = 0; p < this.productions.length; ++p)
		if(this.productions[p].iterations > 0)
			this.productions[p].uniterate();
	this.drawTrees();
}
TreeCanvas.prototype.uniterate_all = TreeCanvas_uniterate_all;

function TreeCanvas_breed()
{
	function total_scores(prods)
	{
		var total = 0;
		for(var p = 0; p < prods.length; ++p)
			total += prods[p].iterations;
		return total;
	};

	function roulette(prods, total)
	{
		var target = Math.random() * total;
		var prod = -1, runner = 0;
		while(runner < target)
			runner += prods[++prod].iterations;
		return prod;
	};

	function breed(p1, p2)
	{
		var r1 = p1.rules_string();
		var r2 = p2.rules_string();
		var cross_point = r1.length * Math.random();
		var child_rules = r1.substring(0, cross_point - 1) + r2.substring(cross_point);
		return child_rules;
	};

	var total = total_scores(this.productions);
	var children = new Array();
	for(var i = 0; i < this.productions.length; ++i) {
		children.push(new Production(this.productions[0].n_rules,
																 this.productions[0].rule_len));
		children[i].set_rules(breed(this.productions[roulette(this.productions, total)],
																this.productions[roulette(this.productions, total)]));
		children[i].iterate();
		children[i].iterate();
		children[i].iterate();
	}

	this.productions = children;
	this.drawTrees();
}
TreeCanvas.prototype.breed = TreeCanvas_breed;

/**********************/
var tree_canvas = new TreeCanvas(document.getElementById("turtleCanvas"));
