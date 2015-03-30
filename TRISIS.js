//TODO:
/*
* Snyrta aðeins til kóða
* Breyta myndunum? Þ.e. fyrir betri contrast á kubb og bakgrunni.
* Testing væri sniðugt, kanna villur og bæta uppsetninguna.
* Eyða út hlutum sem ekki þjóna neinum tilgangi 
  og breyta þeim sem gætu crashað leiknum eða valdið villu.
* Laga game over lógík.
* Eftir að allt er tilbúið kannski bæta við menu-divs, svo þetta virki meira eins og leikur.
* Áttaviti svo maður viti eitthvað hvernig kassinn snýr m.v. stillingar á tökkum?
* Skuggi á neðsta plani sem sýnir hvar kubbur mun lenda?
* Game juice additions?
*/

/*GLOBALS*/
var canvas,
	gl,
	program,

	spinX = 0,
	spinY = 0,
	origX,
	origY,

	vPosition,
	vTexCoord,
	hasLost = false,

	zDist = 10.0,
	trio,
	board,
	container,
	gfx = { stack: [] },

	proLoc,
	mvLoc,

	boardSize = 6,
	boardHeight = 20,

	FAST = 15;
	SLOW = 1500;
	DELTA_TIME = SLOW,
	lastTime = new Date().getTime(),
	score = 0;

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
	var proj = perspective(100, 1.0, 0.2, 100.0);
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
	gfx.ctm = mult(gfx.ctm, translate(-boardSize/2+0.5, -boardHeight/2+0.5, -boardSize/2+0.5));
	trio.render(gfx);
	gfx.ctm = gfx.stack.pop();

	gfx.stack.push(gfx.ctm);
	gfx.ctm = mult(gfx.ctm, scale4(boardSize,boardHeight,boardSize));
	board.render(gfx);
	gfx.ctm = gfx.stack.pop();

	gfx.stack.push(gfx.ctm);
	gfx.ctm = mult(gfx.ctm, translate(-boardSize/2+0.5, -boardHeight/2+0.5, -boardSize/2+0.5));
	container.render(gfx);
	gfx.ctm = gfx.stack.pop();
	
	requestAnimFrame(render);
}



/*ADDITIONAL*/
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
	if(!shouldStop()){
		trio.move(0,-1,0);
	}
	else{
		trio.getAllpos().forEach(function(cubepos){
			if(cubepos[1] > boardHeight-1){
				hasLost = true;
				console.log("GAME OVER");
				return;
			};

			container.setCube(cubepos[0],cubepos[1],cubepos[2]);
			if(isPlaneFull(cubepos[1]))
				deletePlane(cubepos[1]);
		});
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
	return container.planecount[y] >= boardSize*boardSize;
}

function deletePlane(y){
	updateScore();
	container.height.splice(y,1);
	container.height.push(new Array(boardSize));

	for(var x = 0; x < boardSize; x++){
		container.height[boardHeight-1][x] = new Array(boardSize);
		for(var z = 0; z < boardSize; z++)
			container.deleteCube(x,y,z);
	}
	container.planecount[y] = 0;

	for(var i in container.occupiedCoord){
		cubeheight = container.occupiedCoord[i][1];
		if(cubeheight > y){
			container.planecount[cubeheight]--;
			container.planecount[container.occupiedCoord[i][1]-1]++;
			container.occupiedCoord[i] = subtract(container.occupiedCoord[i], [0,1,0]);
		}
	}
}

function shouldUpdate(){
	var currTime = new Date().getTime();
	if(currTime - lastTime > DELTA_TIME){
		lastTime = currTime;
		return true;
	}
	return false;
}

function isLegal(){
	return !(trio.getAllpos().some(isOutsideBorders) || trio.getAllpos().some(isCubeThere));
}

function shouldStop(){
	return trio.getAllpos().some(isCubeBelow);
}

function isOutsideBorders(cubepos){
	var x = cubepos[0];
	var y = cubepos[1];
	var z = cubepos[2];
	return (x >= boardSize || x < 0 || y < 0 || z >= boardSize || z < 0);
}

function isCubeThere(cubepos){
	var x = cubepos[0];
	var y = cubepos[1];
	var z = cubepos[2];
	return container.hasCube(x,y,z);
}

function isCubeBelow(cubepos){
	return (container.hasCube(cubepos[0], cubepos[1]-1, cubepos[2]) || cubepos[1] === 0);
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