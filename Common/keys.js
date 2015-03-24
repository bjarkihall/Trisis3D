// =================
// KEYBOARD HANDLING
// =================

var keys = [];
//space, left, up, right, down:
var _prevents = [' '.charCodeAt(0), 37, 38, 39, 40];

function handleKeydown(evt) {
    //This will prevent the browser from doing things you don't want it to, like scrolling the page.
    for (var i = 0; i<_prevents.length; i++) {
        if (evt.keyCode===_prevents[i]) {
	       evt.preventDefault();
        }
    }
    keys[evt.keyCode] = true;
}

function handleKeyup(evt) {
    keys[evt.keyCode] = false;
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
