/*INITIALIZE*/
window.onload = function init(){
	//Setting up the canvas
	canvas = document.getElementById('gl-canvas');
	gl = WebGLUtils.setupWebGL(canvas);
	if(!gl){ alert("WebGL isn't available"); }

	resizeCanvas();
	window.addEventListener('resize', resizeCanvas);
	function resizeCanvas() {
		if(canvas.width  != window.innerWidth)
			canvas.width  = window.innerWidth;
		if(canvas.height != window.innerHeight)
			canvas.height = window.innerHeight;
		if(canvas.width>canvas.height) 
			canvas.width = canvas.height;
		else 
			canvas.height = canvas.width;
		gl.viewport(0, 0, canvas.width, canvas.height);
	}

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	
	//Setting up the game
	trio = new Triomino();
	board = new Board();
	container = new Container();

	//Load shaders and initialize attribute buffers
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	vPosition = gl.getAttribLocation(program, "vPosition");
	gl.enableVertexAttribArray(vPosition);

	vTexCoord = gl.getAttribLocation(program, "vTexCoord");
	gl.enableVertexAttribArray(vTexCoord);

	proLoc = gl.getUniformLocation(program, "projection");
	mvLoc = gl.getUniformLocation(program, "modelview"); 
	var proj = perspective(120, 1.0, 0.2, 100.0);
	gl.uniformMatrix4fv(proLoc, false, flatten(proj)); 

	render();
}

function render(){
	if(shouldUpdate() && !hasLost) game();
	if(hasLost) newGame();

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gfx.ctm = lookAt(vec3(0.0, 0.0, zDist), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
	gfx.ctm = mult(gfx.ctm, rotate(parseFloat(spinX), [1, 0, 0]));
	gfx.ctm = mult(gfx.ctm, rotate(parseFloat(spinY), [0, 1, 0]));
	
	gfx.stack.push(gfx.ctm);
	gfx.ctm = mult(gfx.ctm, translate(-boardSize/2, -boardHeight/2, -boardSize/2));
	trio.render(gfx);
	gfx.ctm = gfx.stack.pop();

	gfx.stack.push(gfx.ctm);
	gfx.ctm = mult(gfx.ctm, scale4(boardSize,boardHeight,boardSize));
	board.render(gfx);
	gfx.ctm = gfx.stack.pop();

	gfx.stack.push(gfx.ctm);
	gfx.ctm = mult(gfx.ctm, translate(-boardSize/2, -boardHeight/2, -boardSize/2));
	container.render(gfx);
	gfx.ctm = gfx.stack.pop();
	
	requestAnimFrame(render);
}

/*ADDITIONAL UTILS*/
function scale4(x, y, z){
	if(Array.isArray(x) && x.length == 3){
		z = x[2];
		y = x[1];
		x = x[0];
	}

	var result = mat4();
	result[0][0] = x;
	result[1][1] = y;
	result[2][2] = z;

	return result;
}

/*GAME LOGIC*/
function game(){
	if(!shouldStop()) 
		trio.move(0,-1,0);
	else{
		var planesToDelete = [];
		trio.getAllpos().forEach(function(cubePos){
			if(cubePos[1] > boardHeight - 1){
				hasLost = true;
				console.log("GAME OVER");
				return;
			};

			container.setCube(cubePos[0], cubePos[1], cubePos[2]);
			if(isPlaneFull(cubePos[1]))
				planesToDelete.push(cubePos[1]);
		});

		planesToDelete.sort().reverse();
		planesToDelete.forEach(function(plane){
			container.deletePlane(plane);
		});
		if(planesToDelete.length>0)
			updateScore();
		trio = new Triomino();
	}
}

function newGame(){
	trio = new Triomino();
	container = new Container();
	hasLost = false;
	resetScore();
	game();
}

/*CUBE DETECTION AND HANDLING*/
function isPlaneFull(y){
	return (container.planecount[y] >= boardSize*boardSize);
}

function shouldUpdate(){
	var currTime = new Date().getTime();
	if(currTime - lastTime > DELTA_TIME){
		lastTime = currTime;
		return true;
	}
	return false;
}

function shouldStop(){
	return trio.getAllpos().some(isCubeBelow);
}

function isLegal(){
	return !(trio.getAllpos().some(isOutsideBorders) || trio.getAllpos().some(isCubeThere));
}

function isOutsideBorders(cubePos){
	var x = cubePos[0],
		y = cubePos[1],
		z = cubePos[2];
	return (x >= boardSize || x < 0 || y < 0 || z >= boardSize || z < 0);
}

function isCubeThere(cubePos){
	var x = cubePos[0],
		y = cubePos[1],
		z = cubePos[2];
	return container.hasCube(x,y,z);
}

function isCubeBelow(cubePos){
	return (container.hasCube(cubePos[0], cubePos[1] - 1, cubePos[2]) || cubePos[1] === 0);
}

/*SCORING*/
function updateScore(){
	score += 1;
	postScore();
}

function resetScore(){
	score = 0;
	postScore();
}

function postScore(){
	document.getElementById("score").innerHTML = "Stig: " + score;
}