// =================
// KEYBOARD HANDLING
// =================

var keys = [];
//space, left, up, right, down:
var _prevents = [' '.charCodeAt(0), 37, 38, 39, 40];

function handleKeydown(e) {
	//This will prevent the browser from doing things you don't want it to, like scrolling the page.
	for (var i = 0; i<_prevents.length; i++) {
		if (e.keyCode===_prevents[i]) {
			e.preventDefault();
		}
	}
	keys[e.keyCode] = true;

	customKeyHandler();
}

function handleKeyup(e) {
	keys[e.keyCode] = false;

	//SLOW DOWN
	if(!keys[keyCode(' ')]) DELTA_TIME = SLOW;
}

function eatKey(keyCode) {
	var isDown = keys[keyCode];
	keys[keyCode] = false;
	return isDown;
}

function keyCode(keyChar) {
	return keyChar.charCodeAt(0);
}

window.addEventListener("keydown", handleKeydown);
window.addEventListener("keyup", handleKeyup);


function customKeyHandler(){
	var up=38,down=40,left=37,right=39,
		x,y,z;
	x = y = z = 0;

	//SPEED UP
	if(keys[keyCode(' ')]) DELTA_TIME = FAST;
	
	//MOVE
	if(keys[up])	z++;
	if(keys[down])	z--;
	if(keys[left])	x++;
	if(keys[right])	x--;

	trio.move(-x,-y,-z);
	if(!isLegal()) trio.move(x,y,z);

	//ROTATE
	x = y = z = 0;
	var d = 90.0;

	if(keys[keyCode('A')]) x-=d;
	if(keys[keyCode('Z')]) x+=d;
	if(keys[keyCode('S')]) y-=d;
	if(keys[keyCode('X')]) y+=d;
	if(keys[keyCode('D')]) z-=d;
	if(keys[keyCode('C')]) z+=d;

	trio.rotate(-x, -y, -z);
	if(!isLegal()) trio.rotate(x,y,z);
}