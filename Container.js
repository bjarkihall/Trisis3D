function Container(){
	this.plane = new Array(boardHeight);
	this.planecount = new Array(boardHeight);
	for(var y = 0; y < boardHeight; y++){
		this.plane[y] = new Array(boardSize);
		this.planecount[y] = 0;
		for(var x = 0; x < boardSize; x++)
			this.plane[y][x] = new Array(boardSize);
	}
	this.occupiedCoord = [];
	this.cubestack = [
		new Cube(document.getElementById("sand")), 
		new Cube(document.getElementById("dirt")), 
		new Cube(document.getElementById("coal")), 
		new Cube(document.getElementById("iron")), 
		new Cube(document.getElementById("gold")), 
		new Cube(document.getElementById("emerald")), 
		new Cube(document.getElementById("diamond"))
	];
}

Container.prototype.occupy = function(coords){
	this.occupiedCoord.push(coords);
}

Container.prototype.unoccupy = function(coords){
	for(var i in this.occupiedCoord){
		if(equal(this.occupiedCoord[i],coords)){
			this.occupiedCoord.splice(i,1);
			return true;
		}
	}
	return false;
}

Container.prototype.hasCube = function(x, y, z){
	return (this.plane[y] && this.plane[y][x] && this.plane[y][x][z]);
}

Container.prototype.setCube = function(x, y, z){
	this.plane[y][x][z] = true;
	this.planecount[y]++;
	this.occupy([x,y,z]);
}

Container.prototype.deleteCube = function(x, y, z){
	this.unoccupy([x,y,z]);
}

Container.prototype.deletePlane = function(y){
	this.plane.splice(y, 1);
	this.plane.push(new Array(boardSize));
	for(var x = 0; x < boardSize; x++ ){
		this.plane[boardHeight-1][x] = new Array(boardSize);
		for(var z = 0; z < boardSize; z++)
			this.deleteCube(x,y,z);
	}
	this.planecount[y] = 0;
	this.lowerPlanes(y);
}

Container.prototype.lowerPlanes = function (y){
	for(var i in this.occupiedCoord){
		var cubeplane = this.occupiedCoord[i][1];
		if(cubeplane > y){
			this.planecount[cubeplane]--;
			this.planecount[this.occupiedCoord[i][1] - 1]++;
			this.occupiedCoord[i] = subtract(this.occupiedCoord[i], [0,1,0]);
		}
	}
}

Container.prototype.render = function(gfx){
	gfx.stack.push(gfx.ctm);
	//var cube = new Cube(document.getElementById("texImage"));
	for(var i in this.occupiedCoord){
		gfx.stack.push(gfx.ctm);
		gfx.ctm = mult(
			gfx.ctm, 
			translate(
				this.occupiedCoord[i][0]+0.5, 
				this.occupiedCoord[i][1]+0.5, 
				this.occupiedCoord[i][2]+0.5
			)
		);
		this.cubestack[this.occupiedCoord[i][1]%this.cubestack.length].render(gfx);
		gfx.ctm = gfx.stack.pop();
	}
	gfx.ctm = gfx.stack.pop();
}
