function Cube(image){
	
	this.numVertices = 36;
	this.vpoints = [];
	this.tpoints = [];

	this.vertices = [
		vec4(-0.5, -0.5,  0.5, 1.0),
		vec4(-0.5,  0.5,  0.5, 1.0),
		vec4( 0.5,  0.5,  0.5, 1.0),
		vec4( 0.5, -0.5,  0.5, 1.0),
		vec4(-0.5, -0.5, -0.5, 1.0),
		vec4(-0.5,  0.5, -0.5, 1.0),
		vec4( 0.5,  0.5, -0.5, 1.0),
		vec4( 0.5, -0.5, -0.5, 1.0)
	];

	this.texCoords = [
		vec2(0.0, 0.0), 
		vec2(0.0, 1.0), 
		vec2(1.0, 1.0), 
		vec2(1.0, 0.0)
	];

	this.setpos(0,0,0);
	this.image = image;

	this.init();
};


Cube.prototype.init = function(){
	this.quad(1, 0, 3, 2);
	this.quad(2, 3, 7, 6);
	this.quad(3, 0, 4, 7);
	this.quad(6, 5, 1, 2);
	this.quad(4, 5, 6, 7);
	this.quad(5, 4, 0, 1);

	this.vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vpoints), gl.STATIC_DRAW);
	
	this.tBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(this.tpoints), gl.STATIC_DRAW);
};

Cube.prototype.quad = function(a,b,c,d){
	var indices = [ a, b, c, a, c, d];
	var texind = [ 1, 0, 3, 1, 3, 2];
	
	for(var i in indices){
		this.vpoints.push(this.vertices[indices[i]]);
		this.tpoints.push(this.texCoords[texind[i]]);
	}
};

Cube.prototype.setpos = function(x,y,z){
	this.xpos = x;
	this.ypos = y;
	this.zpos = z;
};

Cube.prototype.getpos = function(){
	return [this.xpos, this.ypos, this.zpos];
};

Cube.prototype.render = function(gfx){
	gfx.stack.push(gfx.ctm);
	gfx.ctm = mult(gfx.ctm, translate(this.xpos, this.ypos, this.zpos));
	gl.uniformMatrix4fv(mvLoc, false, flatten(gfx.ctm));

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
	gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
	configureTexture(this.image);
	gl.drawArrays(gl.TRIANGLES, 0, this.vpoints.length);
	
	gfx.ctm = gfx.stack.pop();
};

Cube.prototype.delete = function(){
	console.log("deleted");
};

function configureTexture(image){
	texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	
	gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}