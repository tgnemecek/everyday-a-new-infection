# Tower Defence Game Pseudo Code

## Part 1: Globals

## Game State

Initially it will be just an object (because the game will have only one level). If I have more levels later I'll transform it into a class.
It will hold information about the level: array of enemies, towers, projectiles, player hp and money.

## Game Object

Main parent div retrieved by jQuery. All game elements (static or spawned) will be nested within it.

## Setup & Update

The setup function is the main function to be called that starts the game. The update function runs 60 frames per second and loops through every array of objects inside Game State and running their update methods (if they have any). Enemy Spawner function to create enemies at intervals of time (waves).

## Part 2: Classes

### Enemy Class

* Receives a path argument, which is a list of path elements retrieved by jQuery.
* Set initial position to first path element.
* Animate to second position, on end: animate to next.
* If it arrives at the last path element, modify player health and remove itself.

### Tower Class

* All game nodes are retrieved by jQuery that adds a click event to them.
* On click, generate a tower if player has enough money.
* An update method checks for enemies within range.
    1. If enemies are within range, check for the one closest to the next path element.
    2. Spawn projectile.
    3. Disable its own shoot method until cooldown is complete.

### Projectile Class

* Receives target enemy from parent tower.
* Animate position with jQuery towards enemy.
* After every step(), get new enemy position and change destination (follow).
* On hit, destroy self and enemy.

## Part 3: Extras

* Pause button.
    1. Access all classes pause methods, stopping currently running animations and storing them in memory, to be resumed later.
    2. Overlay div to block pointer events and dim game.
    3. On resume, access resume methods on all classes.
* Main Menu with a Start Game button, that starts main game main function.
* When player hp goes to 0 (checked in update function), show overlay with Game Over screen.
* When all enemies are defeated, overlay with You Win screen.