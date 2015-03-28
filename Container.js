function Container(){

	// first method
	this.height = new Array(boardHeight);
	this.planecount = new Array(boardHeight);

	for(var y = 0; y < boardHeight; y++){
		this.height[y] = new Array(boardSize);
		this.planecount[y] = 0;
		for(var x = 0; x < boardSize; x++){
			this.height[y][x] = new Array(boardSize);
		}
	}

	// second method
	this.occupiedCoord = [];

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
	if(this.height[y]){
		if(this.height[y][x]){
			if(this.height[y][x][z]){
				return true;
			}
		}
	}
	return false;
}

Container.prototype.setCube = function(x, y, z){
	this.height[y][x][z] = true;
	this.planecount[y]++;
	this.occupy([x,y,z]);
}

Container.prototype.deleteCube = function(x, y, z){
	this.unoccupy([x,y,z]);
}

Container.prototype.render = function(gfx){
	gfx.stack.push(gfx.ctm);

	var cube = new Cube(document.getElementById("texImage"));
	for(var i in this.occupiedCoord){
		gfx.stack.push(gfx.ctm);
		gfx.ctm = mult(gfx.ctm, translate( this.occupiedCoord[i][0], this.occupiedCoord[i][1], this.occupiedCoord[i][2]));
		cube.render(gfx);
		gfx.ctm = gfx.stack.pop();
	}

	gfx.ctm = gfx.stack.pop();
}
