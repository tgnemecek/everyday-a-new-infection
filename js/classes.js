class Enemy {
    constructor(path) {
        this.id = new Date().getTime();
        this.jquery = new $(`<div></div>`);
        this.moveSpeed = 0.05;
        this.path = path;
        this.percentWalked = 0;
        this.style = {
            top: randomize($(this.path[0]).position().top, 30) + "px",
            left: randomize($(this.path[0]).position().left, 30) + "px",
            backgroundColor: getRandomizedColor(217, 59, 59)
        }
        this.setup();
    }

    moveTo(x, y, i) {
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
            complete: () => this.followPath(i + 1)
        })
    }

    followPath(i) {
        let lastIndex = this.path.length - 1;
        if (i > lastIndex) {
            this.arrived();
            return;
        };
        let x = $(this.path[i]).position().left;
        let y = $(this.path[i]).position().top;
        this.moveTo(x, y, i)
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
        this.followPath(1);
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
        this.jquery.append(this.props.children.jquery);
    }
}

class TowerPicker {
    constructor(chooseTower, parentPos) {
        this.jquery = new $('<div><h2>Build a Tower</h2></div>');
        this.button = new $('<button>Base Tower</button>');
        this.chooseTower = chooseTower;
        this.parentPos = parentPos;
        this.setup();
    }
    update() {
        setInterval(() => {

        }, fps)
    }
    setup() {
        this.jquery.addClass('tower-picker');
        this.jquery.css({...this.parentPos});
        this.jquery.append(this.button);
        this.button.on('click', () => this.chooseTower())
    }
}


class Node {
    constructor(position) {
        this.jquery = new $('<div><div>');
        this.style = {...position};
        this.hasTower = false;
        this.overlay = undefined;
        this.setup();
    }
    closeOverlay() {
        this.overlay.jquery.remove();
        this.overlay = undefined;
    }
    chooseTower() {
        let tower = new Tower(this.jquery);
        this.jquery.append(tower.jquery);
        gameState.towers.push(tower);
        this.hasTower = true;
    }
    setup() {
        game.append(this.jquery);
        this.jquery.addClass('node');
        this.jquery.css(this.style);
        this.jquery.on('click', () => {
            if (!this.overlay && !this.hasTower) {
                this.overlay = new Overlay({
                    closeOverlay: this.closeOverlay.bind(this),
                    children: new TowerPicker(
                        this.chooseTower.bind(this),
                        this.jquery.position()
                    )
                });
                game.append(this.overlay.jquery)
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
        this.setup();
    }
    moveToTarget() {
        let enPosition = this.enemy.jquery.position();
        let enX = enPosition.left;
        let enY = enPosition.top;

        let curPosition = this.jquery.position();
        let x = curPosition.left;
        let y = curPosition.top;

        let distance = distanceTo(x, y, enX, enY);
        let duration = distance / this.moveSpeed;
        this.jquery.animate({
            left: enX,
            top: enY
        }, {
            duration,
            easing: "linear",
            step: (now, fx) => {
                if (!this.animationEnded) {
                    let newEnCoord = this.enemy.jquery.position()[fx.prop];
                    fx.end = newEnCoord;
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

        let enIndex = gameState.enemies.findIndex((enemy) => {
            return enemy.id === this.enemy.id;
        })
        gameState.enemies.splice(enIndex, 1);
        $(this.enemy.jquery).remove();
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
        this.attackSpeed = 2000;
        this.range = 100;
        this.canAttack = true;
        this.setup();
    }
    setup() {
        this.jquery.addClass('tower');
        setInterval(() => {
            this.update();
        }, fps)
    }
    update() {
        if (this.canAttack) {
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
                }, this.attackSpeed)
            }
        }
    }
}