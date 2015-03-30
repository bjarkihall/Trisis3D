// ==============
// MOUSE HANDLING
// ==============

var g_mouseX = 0,
	g_mouseY = 0,
	g_isMouseDown = false;

function handleMouseMove(e){
	//g_mouseX = e.clientX - canvas.clientLeft + window.pageXclient;
	//g_mouseY = e.clientY - canvas.clientTop;
	if(g_isMouseDown){
		spinY = (spinY + (e.clientX - origX)) % 360;
		spinX = (spinX + (origY - e.clientY)) % 360;
		origX = e.clientX;
		origY = e.clientY;
	}
}

function handleMouseDown(e){
	g_isMouseDown = true;
	origX = e.clientX;
	origY = e.clientY;
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