// ==============
// MOUSE HANDLING
// ==============

var g_mouseX = 0,
	g_mouseY = 0,
	g_isMouseDown = false;

function handleMouseMove(e){
	//g_mouseX = e.clientX - canvas.offsetLeft + window.pageXOffset;
	//g_mouseY = e.clientY - canvas.offsetTop;
	if(g_isMouseDown){
		spinY = (spinY + (e.offsetX - origX)) % 360;
		spinX = (spinX + (origY - e.offsetY)) % 360;
		origX = e.offsetX;
		origY = e.offsetY;
	}
}

function handleMouseDown(e){
	g_isMouseDown = true;
	origX = e.offsetX;
	origY = e.offsetY;
	e.preventDefault();
}

function handleMouseUp(e){
	g_isMouseDown = false;
}

function handleMouseWheel(e){
	if(e.wheelDelta > 0.0){
		zDist += 0.1;
	} else {
		zDist -= 0.1;
	}
	e.preventDefault();
}

// Handle "up", "down" and "move" events separately.
window.addEventListener("mousedown", handleMouseDown);
window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("mouseup", handleMouseUp);
window.addEventListener("mousewheel", handleMouseWheel);