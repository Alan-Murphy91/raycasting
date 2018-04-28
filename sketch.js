
// Link to code -> https://dev.opera.com/articles/3d-games-with-canvas-and-raycasting-part-1/

/*
 Setting up map and movement notes + collision detection

 a 2d array is declared with 0 representing empty spaces and numbers representing obstacles
 of various texture. ideally the width and height of the array is x times the lenght of the 2d array
 ie a 320x200 array has 20 nested arrays of 32 length with each item in the array occupying 10 pixels.
 we establish the viewDist which is the distance from player to projection plane. half the width of the projection plane
divided by tan of half the fov (80/2). the fov in this case being 80 degrees

 we then declare a player object with an:
 x: x position on x-axis
 y: y position on y-axis
 dir: default: 0 .. and.. -1 (decreasing on x-axis, ie left) or 1 (the opposite). this value is zero unless a 
 key is held down to change the value to the corresponding intended direction of the keys
 speed: if the player is moving forward the speed is one, if the player is moving backwards it is -1
 movespeed: how far in pixels the player can move in one game loop, original value being 0.18
 rotspeed: 6 * math.pi/180  .. 6 times math.pi/180 gives us a turn in rotation of 0.1047 radians per game loop
 60 rotations equates to 6.28 radians or 360 degrees. essentially we are mimicing the radians of a 
 second hand on a clock


 how the player moves:
 the player only truly moves on the x-axis, either forward or backwards. at each instance of the game loop
 we record how far and on which direction vector we will travel. either forwards (1) or backwards(-1).
 we first take the value of how much on the ''x-axis'' the player will move (parenthesis as the player
could appear to be moving along the y-axis based on rotation). 
we then multiply rotSpeed(0.1047radians) by -1, 0 or 1 to find which way we are rotating and add this to the
player.rot value.

to find the new x and y coordinates we ..
for player.x we take the cosine of the new player.rot value, multiply is by movestep (to see if this
direction is moving forward or backwards) to get and add it to the original player.x value to get the 
new value for player.x. We do the same for y but use the sine of the player.rot value
https://www.math10.com/algimages/trig-en.gif im not sure why its cos for x and sin for y but this image
below offers an insight.

for collision detection a blocking function will cause the move function to return without updating the 
newx and newy. this works by ensuring the x and y coordinates are inside the grid at all times and stops
the player if it is inside a non 0 block. we are still able to reverse out of a block by comparing
the newx and newy (as opposed to player.x and player.y) to see if they still reside within a block. as
such we could run into the wall and rotate the player until the new x and new y are in the adjacent '0' block,
should there be one or simply reverse.
 */


let map = [
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,3,0,3,0,0,1,1,1,2,1,1,1,1,1,2,1,1,1,2,1,0,0,0,0,0,0,0,0,1],
	[1,0,0,3,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1,1,1,1,1],
	[1,0,0,3,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,3,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
	[1,0,0,3,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
	[1,0,0,0,0,0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0,0,0,0,0,0,3,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,4,0,0,4,2,0,2,2,2,2,2,2,2,2,0,2,4,4,0,0,4,0,0,0,0,0,0,0,1],
	[1,0,0,4,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,4,0,0,0,0,0,0,0,1],
	[1,0,0,4,3,3,4,2,2,2,2,2,2,2,2,2,2,2,2,2,4,3,3,4,0,0,0,0,0,0,0,1],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let screenStrips = [];

let mapWidth = map[0].length * 10;
let	mapHeight = map.length * 10;
let screenWidth = 320;
let screenHeight = 200;
let stripWidth = 4;
let fov = 60 * Math.PI/180;
let numRays = Math.ceil(screenWidth/stripWidth);
let twoPI = Math.PI * 2;
let numTextures = 4;


var viewDist = (screenWidth/2) / Math.tan((fov / 2));
let player = {
    x: 18,
    y: 18,
    dir: 0,
    rot: 0,
    speed: 0,
    moveSpeed: 0.18,
    rotSpeed: 2 * Math.PI/180
}

function setup(){
	createCanvas(320,200);
}

let cnv = document.getElementById('myContainer');
for(let i=0; i<screenWidth; i+= stripWidth){
	var strip = document.createElement("div");
	strip.style.position = "absolute";
	strip.style.left = i + "px";
	strip.style.width = stripWidth + "px";
	strip.style.height = "0px";
	strip.style.overflow = "hidden";
	
	var img = document.createElement("img");
	img.setAttribute("src", "walls.png");
	img.setAttribute("position", "absolute");
	img.setAttribute("left", "0px");
	strip.appendChild(img);
	strip.img = img;	
	screenStrips.push(strip);
	cnv.appendChild(strip);
}

function draw(){
    //clear();
    if(keyIsDown(LEFT_ARROW)){
        player.dir = -1;
    }
    if(keyIsDown(RIGHT_ARROW)){
        player.dir = 1;
    }
    if(keyIsDown(UP_ARROW)){
        player.speed = 1;
    }
    if(keyIsDown(DOWN_ARROW)){
        player.speed = -1;
    }
    moveFunctions();
	castRays();
}

function move(){
    let moveStep = player.speed * player.moveSpeed;
    player.rot += player.dir * player.rotSpeed;
    let newX = player.x + cos(player.rot) * moveStep;
    let newY = player.y + sin(player.rot) * moveStep;
    if (isBlocking(newX, newY)) {
		return;
	}
    player.x = newX;
    player.y = newY;
}

function keyReleased() {
    player.speed = 0;
    player.dir = 0;
}

function moveFunctions() {
    background(200);
    fill(0);
    for(let i=0; i<map.length; i++){
        for(let j=0; j<map[i].length; j++){
            if(map[i][j]){
                rect(j*10,i*10,10,10);
            }
        }
    }
    move();
    rect(player.x,player.y,4,4);
}

function isBlocking(x,y) {
	if (y < 0 || y >= mapHeight || x < 0 || x >= mapWidth) {
		return true;
	}
	return (map[Math.floor(y/10)][Math.floor(x/10)] != 0);
}

/*
notes on how castRays works

we are designating spaces on the **projection plane** and using theorems to find measurements for
distances and angles of each individual right-angled triangle. The distance from the viewer and
the projection plane is pre-initialised.

we cut the FOV in half to allow us to create two right-angled triangles and thereby take
advantage of the pythagorean theorem. the rayScreen position in this case brings us from
-160 to +160 encompassing the full screenWidth(320) while also giving us each individual length of one
of the sides of the right-angled triangle as the loop increments.

rayViewDist is pythagoras to get the hypotenuse, the rayViewdist. the length of the line from the viewer
to the point on the projection plane.

rayAngle, a theorem to get the angle of the ray relative to the viewing direction (a = Sin(A)*c) gives
us the angle of the ray from the point of view of the player

recursively call the cast single ray function adding the new angle to player.rot. we add player.rot
to the angle so the rays face outward from whatever angle the player is facing.
*/


function castRays() {

    let stripIdx = 0;

	for (let i=0; i < numRays; i++) {
        let rayScreenPos = (-numRays/2 + i) * stripWidth;
		let rayViewDist = Math.sqrt(rayScreenPos*rayScreenPos + viewDist*viewDist);
		let rayAngle = Math.asin(rayScreenPos / rayViewDist);
		castSingleRay(
			player.rot + rayAngle, 
			stripIdx++
		);
	}
}


/* 
comments on castSingleRay

as we rotate the player the player.rot value can quickly exceed 6.24, which is a complete revolution
of the circle. rayAngle %= twoPI simply divides the number by 6.24 until we get the remainder and
thus the current players rotation in radians.
raycasting works by measuring intersections on the horizontal and vertical axes. for accuracy
we need to begin on the edge of the current block. when we start off on the map our player begins
with a player.rot value of 0 and is moving 'right', ie, the player is moving 'down' the map because
its position is increasing 'down' the x-axis as the x-axis value is increasing rather than decreasing.
we use these beginning truths to determine via the player.rot value which way we are facing in terms
of 'up', 'down', 'left' and 'right'

we then take the sine and cosine of the rayangle in order to get the vertical and horizontal slope
of the line...or at least I think thats whats going on here

the dx and dy values determine how much we increment the cast ray whilst the condition of the while
loop is not met (hasnt hit a wall) and x and y are the starting positions of the ray. here we use
the uprightleftdown variables defined earlier. as we firstly begin my checking for vertical lines
we 'pin' the x value to a vertical line in the array and adjust y by adding the increment in the slopes
direction (so times the increment by the slope) so we can find the first intersection to check. note that if we are moving left we need to subtract
1 from the x-axis to start on the first block left of where we begin.
we then begin the loop. in the case of checking for vertical intersections the x axis is pinned to a vertical
line increasing or decreasing by one whilst following the slope up or down until it finds an intersection.

when the intersection is found (in order to check we divide and floor the pixel value to check via an array lookup) we subtract the distance from the x and y distance to form a right angled
triangle which enables us to use pythagoras theorem to find the length of the line. we then record the hit.
if there is no intersection found we increment the starting x,y position by dx and dy.

checking for horizontal intersections is the opposite. the y-axis is pinned to a horixontal line on the grid
which basically means any pixel when divided by the size of each grid would return the grid[x] location.
the only difference here is that we check if the distance to the intersection is less than or greater
than the one found in the prior loop for vertical intersections, if its a shorter distance then we discard
the prior distance value and substitute it for this one.

we then take the xhit and yhit and use it to draw a line originating from the players x and y position
*/


function castSingleRay(rayAngle, stripIdx) {

	// first make sure the angle is between 0 and 360 degrees
	rayAngle %= twoPI;
	if (rayAngle < 0) {
        rayAngle += twoPI;
    } 

	let right = (rayAngle > twoPI * 0.75 || rayAngle < twoPI * 0.25);
	let up = (rayAngle < 0 || rayAngle > Math.PI);
	let angleSin = Math.sin(rayAngle);
	let angleCos = Math.cos(rayAngle);
    let wallType = 0;
	
	let dist = 0;	// the distance to the block we hit
	let xHit = 0; 	// the x and y coord of where the ray hit the block
	let yHit = 0;

	let textureX;	// the x-coord on the texture of the block, ie. what part of the texture are we going to render
	let wallX;	// the (x,y) map coords of the block
	let wallY;
    let wallIsHorizontal = false;
	let slope = angleSin / angleCos; 	// the slope of the straight line made by the ray
	let dX = right ? 1 : -1; 	// we move either 1 map unit to the left or right
	let dY = dX * slope; 		// how much to move up or down

	let x = right ? Math.ceil(player.x) : Math.floor(player.x);	// starting horizontal position, at one of the edges of the current map block
	let y = player.y + (x - player.x) * slope;			// starting vertical position. We add the small horizontal step we just made, multiplied by the slope.

	while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
		// let wallX = Math.floor((Math.floor(x + (right ? 0 : -1)))/8);
        // let wallY = Math.floor((Math.floor(y))/8);
        let wallX = Math.floor(x + (right ? 0 : -1));
		let wallY = Math.floor(y); 

		// is this point inside a wall block?
		if (map[Math.floor(wallY/10)][Math.floor(wallX/10)] > 0) {

			let distX = x - player.x;
			let distY = y - player.y;
			dist = distX*distX + distY*distY;	// the distance from the player to this point, squared.
            wallType = map[Math.floor(wallY/10)][Math.floor(wallX/10)];
			textureX = y % 1;	// where exactly are we on the wall? textureX is the x coordinate on the texture that we'll use when texturing the wall.
			if (!right) textureX = 1 - textureX; // if we're looking to the left side of the map, the texture should be reversed

			xHit = x;	// save the coordinates of the hit. We only really use these to draw the rays on minimap.
			yHit = y;

			break;
		}
		x += dX;
		y += dY;
	}

	let lineSlope = angleCos / angleSin;
	dY = up ? -1 : 1;
	dX = dY * lineSlope;
	y = up ? Math.floor(player.y) : Math.ceil(player.y);
	x = player.x + (y - player.y) * lineSlope;

	while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
		// let wallY = Math.floor((Math.floor(y + (up ? -1 : 0))/8));
        // let wallX = Math.floor((Math.floor(x)/8));
        let wallY = Math.floor(y + (up ? -1 : 0));
		let wallX = Math.floor(x);

		if (map[Math.floor(wallY/10)][Math.floor(wallX/10)] > 0) {
			let distX = x - player.x;
			let distY = y - player.y;
			let blockDist = distX*distX + distY*distY;
			if (!dist || blockDist < dist) {
				dist = blockDist;
				xHit = x;
				yHit = y;
				textureX = x % 1;
				if (up) textureX = 1 - textureX;
			}
			break;
		}
		x += dX;
		y += dY;
	}

	if (dist) {
        drawRay(xHit, yHit);
        var strip = screenStrips[stripIdx];
		dist = Math.sqrt(dist);
		dist = dist * Math.cos(player.rot - rayAngle);

		let height = Math.round(viewDist / dist);
		let width = height * stripWidth;
		let top = Math.round((screenHeight - height) / 2);

		strip.style.height = height+"px";
		strip.style.top = top+"px";

		strip.img.style.height = Math.floor(height * numTextures) + "px";
		strip.img.style.width = Math.floor(width*2) +"px";
		strip.img.style.top = -Math.floor(height * (wallType-1)) + "px";

		let texX = Math.round(textureX*width);

		if (texX > width - stripWidth)
			texX = width - stripWidth;

		strip.img.style.left = -texX + "px";
	}

}

function drawRay(rayX, rayY) {
    stroke(0,255,0);
    line(player.x+2, player.y+2, rayX, rayY);
    stroke(0);
}