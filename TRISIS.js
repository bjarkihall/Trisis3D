//TODO:
/*
Ekki mikið eftir! 
* Snyrta aðeins til kóða
* Breyta myndunum (þurfti að nota þessar því ég var offline 
  og hafði ekki aðgang að öðrum textures).
* Testing væri sniðugt, kanna villur og læra á uppsetninguna.
* Eyða út hlutum sem ekki þjóna neinum tilgangi 
  og breyta þeim sem gætu crashað leiknum eða valdið villu.
* Laga game over lógík
* Eftir að allt er tilbúið kannski bæta við menu-divs, svo þetta virki meira eins og leikur.
*/

var canvas;
var gl;
var program;

var movement = false;   // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var vPosition;
var vTexCoord;
var lost = false;

var zDist = 10.0;
var trio;
var board;
var container;
var gfx = { stack: [] };

var proLoc;
var mvLoc;

var boardSize = 6;
var boardHeight = 12;

var dt = 1500;
var lastTime = new Date().getTime();

window.onload = function init(){
	canvas = document.getElementById("gl-canvas");
	
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl){ alert("WebGL isn't available"); }

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.9, 1.0, 1.0, 1.0);
	
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	
	trio = new Triomino();
	board = new Board();
	container = new Container();

	//
	//  Load shaders and initialize attribute buffers
	//
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	vPosition = gl.getAttribLocation(program, "vPosition");
	gl.enableVertexAttribArray(vPosition);

	vTexCoord = gl.getAttribLocation(program, "vTexCoord");
	gl.enableVertexAttribArray(vTexCoord);

	proLoc = gl.getUniformLocation(program, "projection");
	mvLoc = gl.getUniformLocation(program, "modelview"); 
	var proj = perspective(80, 1.0, 0.2, 100.0);
	gl.uniformMatrix4fv(proLoc, false, flatten(proj));

	//event listeners for mouse
	canvas.addEventListener("mousedown", function(e){
		movement = true;
		origX = e.offsetX;
		origY = e.offsetY;
		e.preventDefault();         // Disable drag and drop
	});

	canvas.addEventListener("mouseup", function(e){
		movement = false;
	});

	canvas.addEventListener("mousemove", function(e){
		if(movement){
			spinY = (spinY + (e.offsetX - origX)) % 360;
			spinX = (spinX + (origY - e.offsetY)) % 360;
			origX = e.offsetX;
			origY = e.offsetY;
		}
	});

	window.addEventListener("keyup", function(e){
		if(e.keyCode == 32){ dt = 1500; }
	});


	// Event listener for keyboard
	window.addEventListener("keydown", function(e){
		switch(e.keyCode){
			case 32:    // space bar
				e.preventDefault();
				//trio.move(0,-1,0);
				dt = 20;
				// if(!isLegal()){
				//     trio.move(0,1,0);
				// }
				break;
			case 38:	// upp arrow
				e.preventDefault();
				trio.move(0,0,-1);
				if(!isLegal()){
					trio.move(0,0,1);
				}
				break;
			case 40:	// nidur arrow
				e.preventDefault();
				trio.move(0,0,1);
				if(!isLegal()){
					trio.move(0,0,-1);
				}
				break;
			case 37:   // vinstri arrow
				trio.move(-1, 0, 0);
				if(!isLegal()){
					trio.move(1,0,0);
				}
				break;
			case 39:   // haegri arrow
				trio.move(1, 0, 0);
				if(!isLegal()){
					trio.move(-1,0,0);
				}
				break;
			case 65: // a key
				trio.rotate(90.0,0,0);
				if(!isLegal()){
					trio.rotate(-90.0,0,0);
				}
				break;
			case 90: // z key
				trio.rotate(-90.0,0,0);
				if(!isLegal()){
					trio.rotate(90.0,0,0);
				}
				break;
			case 83: // s key
				trio.rotate(0, 90.0, 0);
				if(!isLegal()){
					trio.rotate(0,-90.0,0);
				}
				break;
			case 88: // x key
				trio.rotate(0, -90.0, 0);
				if(!isLegal()){
					trio.rotate(0,90.0,0);
				}
				break;
			case 68: // d key
				trio.rotate(0, 0, 90.0);
				if(!isLegal()){
					trio.rotate(0,0,-90.0);
				}
				break;
			case 67: // c key
				trio.rotate(0, 0, -90.0);
				if(!isLegal()){
					trio.rotate(0,0,90.0);
				}
				break;	 
		}
	}); 


	// Event listener for mousewheel
	canvas.addEventListener("mousewheel", function(e){
		if(e.wheelDelta > 0.0){
			zDist += 0.1;
		} else {
			zDist -= 0.1;
		}
		e.preventDefault();
	}); 

	render();
}


function scale4(x, y, z){
	if (Array.isArray(x) && x.length == 3){
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

function render(){
	if(shouldUpdate() && !lost){
		game();
	}
	if(lost){ 
		newGame(); 
	}

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

function game(){
	if(!shouldStop()){
		trio.move(0,-1,0);
	}
	else{
		trio.getAllpos().forEach(function(cubepos){
			if(cubepos[1] > boardHeight-1){
				lost = true;
				console.log("GAME OVER");
				return;
			};

			container.setCube(cubepos[0],cubepos[1],cubepos[2]);
			if(isPlaneFull(cubepos[1])){
				deletePlane(cubepos[1]);
			}
		});
		trio = new Triomino();
	}
}

function newGame(){
	trio = new Triomino();
	container = new Container();
	lost = false;
	game();
}

function isPlaneFull(y){
	return container.planecount[y] >= boardSize*boardSize;
}

function deletePlane(y){
	container.height.splice(y,1);
	container.height.push(new Array(boardSize));

	for(var x = 0; x < boardSize; x++){
		container.height[boardHeight-1][x] = new Array(boardSize);
		for(var z = 0; z < boardSize; z++){
			container.deleteCube(x,y,z);
		}
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
	if(currTime - lastTime > dt){
		lastTime = currTime;
		return true;
	}
	return false;
}

function isLegal(){
	return !(trio.getAllpos().some(isOutsideBoarders) || trio.getAllpos().some(isCubeThere));
}

function shouldStop(){
	return trio.getAllpos().some(isCubeBelow);
}

function isOutsideBoarders(cubepos){
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