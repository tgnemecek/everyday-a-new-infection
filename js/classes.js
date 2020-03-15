class Enemy {
    constructor(path) {
        this.id = new Date().getTime();
        this.jquery = new $(`<div></div>`);
        this.moveSpeed = 0.05;
        this.path = path;
        this.percentWalked = 0;
        this.nextPath = 1;
        this.isAlive = true;
        this.style = {
            top: randomize($(this.path[0]).position().top, 30) + "px",
            left: randomize($(this.path[0]).position().left, 30) + "px",
            backgroundColor: getRandomizedColor(217, 59, 59)
        }
        this.setup();
    }

    pause() {
        this.jquery.stop();
    }

    resume() {
        this.followPath();
    }

    moveTo(x, y) {
        x = randomize(x, 30);
        y = randomize(y, 30);

        let currPos = this.jquery.position();
        let currX = currPos.left;
        let currY = currPos.top;
        let distance = distanceTo(x, y, currX, currY);
        let duration = distance / this.moveSpeed;
        this.jquery.animate({
            left: x,
            top: y
        }, {
            duration,
            easing: "linear",
            progress: (an, prog, remaining) => this.percentWalked = prog,
            complete: () => {
                this.nextPath++;
                this.followPath(this.nextPath);
            }
        })
    }

    followPath() {
        let lastIndex = this.path.length - 1;
        if (this.nextPath > lastIndex) {
            this.arrived();
            return;
        };
        let x = $(this.path[this.nextPath]).position().left;
        let y = $(this.path[this.nextPath]).position().top;
        this.moveTo(x, y)
    }

    arrived() {
        let i = gameState.enemies.findIndex((enemy) => {
            return enemy.id === this.id;
        })
        gameState.enemies.splice(i, 1);
        gameState.modifyHp(-10);
        this.jquery.remove();
    }

    setup() {
        game.append(this.jquery);
        this.jquery.addClass('enemy');
        this.jquery.css(this.style);
        this.followPath();
    }
}

class EnemySmall extends Enemy {
    constructor(path) {
        super(path);
    }
}

class EnemyBig extends Enemy {
    constructor(path) {
        super(path);
    }
}

class Overlay {
    constructor(props) {
        this.jquery = new $('<div></div>');
        this.props = props;
        this.setup();
    }
    setup() {
        this.jquery.addClass('overlay');
        this.jquery.on('click', () => this.props.closeOverlay());
    }
}

class TowerPicker {
    constructor(chooseTower, parentPos) {
        this.jquery = new $('<div><h2>Build a Tower</h2></div>');
        this.chooseTower = chooseTower;
        this.parentPos = parentPos;
        this.towers = [
            {
                name: "Base Tower",
                cost: 100,
                button: new $('<button></button>')
            }
        ]
        this.setup();
    }
    checkIfDisabled(tower) {
        if (gameState.money >= tower.cost) {
            tower.button.prop("disabled", false);
        } else tower.button.prop("disabled", true);
    }
    update() {
        setInterval(() => {
            this.towers.forEach((tower) => {
                this.checkIfDisabled(tower);
            })
        }, fps)
    }
    setup() {
        this.jquery.addClass('tower-picker');
        this.jquery.css({...this.parentPos});
        this.towers.forEach((tower) => {
            this.jquery.append(tower.button);
            tower.button.on('click', () => this.chooseTower(tower));
            let nameDiv = $(`<div>${tower.name}</div>`);
            let costDiv = $(`<div>$${tower.cost}</div>`);
            tower.button.append(nameDiv).append(costDiv);
            this.checkIfDisabled(tower);
        })
        this.update();
    }
}


class Node {
    constructor(position) {
        this.jquery = new $('<div><div>');
        this.style = {...position};
        this.hasTower = false;
        this.overlay = undefined;
        this.towerPicker = undefined;
        this.paused = false;
        this.setup();
    }
    pause() {
        this.paused = true;
    }
    resume() {
        this.paused = false;
    }
    closeOverlay() {
        this.overlay.jquery.remove();
        this.towerPicker.jquery.remove();
        this.overlay = undefined;
        this.towerPicker = undefined;
    }
    chooseTower(chosenTower) {
        gameState.modifyMoney(-chosenTower.cost);
        let tower = new Tower(this.jquery);
        this.jquery.append(tower.jquery);
        gameState.towers.push(tower);
        this.hasTower = true;
        this.closeOverlay();
    }
    setup() {
        game.append(this.jquery);
        this.jquery.addClass('node');
        this.jquery.css(this.style);
        this.jquery.on('click', () => {
            if (!this.overlay && !this.hasTower && !this.paused) {
                this.overlay = new Overlay({
                    closeOverlay: this.closeOverlay.bind(this),
                    children: new TowerPicker(
                        this.chooseTower.bind(this),
                        this.jquery.position()
                    )
                });
                game.append(this.overlay.jquery);
                this.towerPicker = new TowerPicker(
                    this.chooseTower.bind(this),
                    this.jquery.position()
                );
                game.append(this.towerPicker.jquery);
            }
        })
    }
}

class Projectile {
    constructor(initPosition, enemy) {
        this.id = new Date().getTime();
        this.jquery = new $(`<div>P</div>`);
        this.style = {
            top: initPosition.top,
            left: initPosition.left
        }
        this.enemy = enemy;
        this.moveSpeed = 0.5;
        this.animationEnded = false;
        this.destination = {};
        this.setup();
    }
    pause() {
        this.jquery.stop();
    }
    resume() {
        this.moveToTarget();
    }
    moveToTarget() {
        let enPosition;

        if (!this.enemy.isAlive) {
            // debugger;
            enPosition = this.destination;
        } else enPosition = this.enemy.jquery.position();

        let enX = enPosition.left;
        let enY = enPosition.top;

        let curPosition = this.jquery.position();
        let x = curPosition.left;
        let y = curPosition.top;

        let distance = distanceTo(x, y, enX, enY);
        let duration = distance / this.moveSpeed;

        this.destination = {
            left: enX,
            top: enY
        }

        this.jquery.animate(this.destination, {
            duration,
            easing: "linear",
            step: (now, fx) => {
                this.destination[fx.prop] = fx.end;
                if (!this.animationEnded && this.enemy.isAlive) {
                    let newEnCoord = this.enemy.jquery.position()[fx.prop];
                    fx.end = newEnCoord;
                    console.log(fx);
                }
            },
            complete: () => this.hit()
        })
    }
    hit() {
        this.animationEnded = true;
        let projIndex = gameState.projectiles.findIndex((projectile) => {
            return projectile.id === this.id;
        })
        gameState.projectiles.splice(projIndex, 1);
        this.jquery.remove();
        if (this.enemy.isAlive) {
            let enIndex = gameState.enemies.findIndex((enemy) => {
                return enemy.id === this.enemy.id;
            })
            gameState.enemies.splice(enIndex, 1);
            $(this.enemy.jquery).remove();
            this.enemy.isAlive = false;
        }
    }
    setup() {
        game.append(this.jquery);
        this.jquery.addClass('projectile');
        this.jquery.css(this.style);
        this.moveToTarget();
    }
}

class Tower {
    constructor(node) {
        this.jquery = new $(`<div>T</div>`);
        this.node = node;
        this.nodePosition = node.position();
        this.attackSpeed = 1000;
        this.range = 100;
        this.canAttack = true;
        this.paused = false;
        this.setup();
    }
    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }
    setup() {
        this.jquery.addClass('tower');
        setInterval(() => {
            this.update();
        }, fps)
    }
    update() {
        if (this.canAttack && !this.paused) {
            let enemiesInRange = [];
            gameState.enemies.forEach((enemy) => {
                let enPosition = enemy.jquery.position();
                let enX = enPosition.left;
                let enY = enPosition.top;

                let nodeX = this.nodePosition.left;
                let nodeY = this.nodePosition.top;

                let distance = distanceTo(nodeX, nodeY, enX, enY);

                if (distance < this.range) {
                    enemiesInRange.push(enemy);
                }
            })
            if (enemiesInRange.length) {
                let enemyCloserToEnd = { percentWalked: 0 };
                enemiesInRange.forEach((enemy) => {
                    if (enemyCloserToEnd.percentWalked < enemy.percentWalked) {
                        enemyCloserToEnd = enemy;
                    }
                })
                let projectile = new Projectile(
                    this.nodePosition, enemyCloserToEnd
                );
                gameState.projectiles.push(projectile);
                this.canAttack = false;
                setTimeout(() => {
                    this.canAttack = true;
                }, 1/this.attackSpeed)
            }
        }
    }
}