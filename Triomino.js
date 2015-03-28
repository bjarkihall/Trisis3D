function Triomino(type) {
	this.setpos(boardSize/2-1,boardHeight,boardSize/2-1);
	this.xdeg = 0;
	this.ydeg = 0;
	this.zdeg = 0;
	this.makeTriomino();
};

Triomino.prototype.makeTriomino = function(){
	var type = Math.random();
	if(type < 0.5){
		this.I_Triomino();
	}else{
		this.L_Triomino();
	}
};

Triomino.prototype.render = function(gfx){
	gfx.stack.push(gfx.ctm);
	gfx.ctm = mult(gfx.ctm, translate(this.xpos, this.ypos, this.zpos));

	gfx.ctm = mult(gfx.ctm, rotate(this.xdeg, [1,0,0]));
	gfx.ctm = mult(gfx.ctm, rotate(this.ydeg, [0,1,0]));
	gfx.ctm = mult(gfx.ctm, rotate(this.zdeg, [0,0,1]));

	for(var cube in this.cubestack){
		this.cubestack[cube].render(gfx);
	}

	gfx.ctm = gfx.stack.pop();
};

Triomino.prototype.rotate = function(x,y,z){
	this.xdeg = (this.xdeg + x) % 360;
	this.ydeg = (this.ydeg + y) % 360;
	this.zdeg = (this.zdeg + z) % 360;
};

Triomino.prototype.move = function(x,y,z){
	this.xpos += x;
	this.ypos += y;
	this.zpos += z;
};

Triomino.prototype.deleteCube = function(cube){
	this.cubestack.splice(cube, 1); //Laga?
	if(this.cubestack.length === 0){
		console.log("EMPTY");
	} 
	// delete this.cubestack[cube]
};

// TODO: fetch by id? fetch by abs pos?
Triomino.prototype.getCubeRel = function(pos){
	for(var cube in this.cubestack){
		if(equal(this.cubestack[cube].getpos(),pos)){
			return cube;
		}
	}
	return false;
};

Triomino.prototype.getCubeAbs = function(pos){
	var cubepos = this.getAllpos();
	for(var cube in cubepos){
		if(equal(cubepos[cube], pos)){
			return cube;
		}
	}
	return false;
}

Triomino.prototype.setpos = function(x,y,z){
	this.xpos = x;
	this.ypos = y;
	this.zpos = z;
};

Triomino.prototype.getpos = function(){
	return [this.xpos, this.ypos, this.zpos];
};

Triomino.prototype.setdeg = function(x,y,z){
	this.xdeg = x;
	this.ydeg = y;
	this.zdeg = z;
};

Triomino.prototype.getdeg = function(){
	return [this.xdeg, this.ydeg, this.zdeg];
};

Triomino.prototype.getAllpos = function(){
	var res = [];

	for(var cube in this.cubestack){
		var reletivepos = mat4();
		reletivepos = mult(reletivepos, rotate(this.xdeg, [1,0,0]));
		reletivepos = mult(reletivepos, rotate(this.ydeg, [0,1,0]));
		reletivepos = mult(reletivepos, rotate(this.zdeg, [0,0,1]));
		reletivepos = mult(this.cubestack[cube].getpos().concat(0), reletivepos);
		reletivepos.splice(3,1);
		
		for(var i in reletivepos) {
			reletivepos[i] = Math.round(reletivepos[i]);
		}

		var absolutepos = add(reletivepos, this.getpos());
		res.push(absolutepos);
	}
	return res;
};

Triomino.prototype.I_Triomino = function(){
	this.cubestack = [new Cube(document.getElementById("texImage")), new Cube(document.getElementById("texImage1")), new Cube(document.getElementById("texImage2"))];
	this.cubestack[0].setpos(0, 0, 0);
	this.cubestack[1].setpos(0,-1, 0);
	this.cubestack[2].setpos(0, 1, 0);
};

Triomino.prototype.L_Triomino = function(){
	this.cubestack = [new Cube(document.getElementById("texImage")), new Cube(document.getElementById("texImage1")), new Cube(document.getElementById("texImage2"))];
	this.cubestack[0].setpos(0, 0, 0);
	this.cubestack[1].setpos(0, 1, 0);
	this.cubestack[2].setpos(1, 0, 0);
};