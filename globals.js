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

* Pause möguleiki
* Hraði eykst smátt og smátt, level.
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

	FAST = 15,
	SLOW = 1500,
	DELTA_TIME = SLOW,
	lastTime = new Date().getTime(),
	score = 0;