class Node {
    constructor(position) {
        this.jquery = new $('<button></button>');
        this.style = {
            ...position,
            width: windowSize.width / 10,
            height: windowSize.width / 10
        };
        this.hasTower = false;
        this.towerPicker = undefined;
        this.paused = false;
        this.setup();
    }
    onResize(newWidth) {
        this.jquery.css({
            width: newWidth / 10,
            height: newWidth / 10
        })
    }
    pause() {
        this.paused = true;
    }
    resume() {
        this.paused = false;
    }
    closeTowerPicker() {
        this.towerPicker.jquery.remove();
        this.towerPicker = undefined;
    }
    chooseTower(ChosenTower) {
        gameState.modifyMoney(-ChosenTower.cost);
        let tower = new ChosenTower(this.jquery);
        this.jquery.css('border', 'none');
        gameState.towers.push(tower);
        this.hasTower = true;
        this.closeTowerPicker();
    }
    setup() {
        game.append(this.jquery);
        this.jquery.addClass('node');
        this.jquery.css(this.style);
        this.jquery.on('click', () => {
            if (!this.hasTower && !this.paused) {
                this.towerPicker = new TowerPicker(
                    this.chooseTower.bind(this),
                    this.closeTowerPicker.bind(this)
                );
            }
        })
    }
}

class Radar {
    constructor(node, tower, getActualRange) {
        this.node = node;
        this.tower = tower;
        this.getActualRange = getActualRange;
        this.jquery = new $(`<div class="radar"></div>`);
        this.animationDuration = 3000;
        this.progress = 0;
        this.style = {
            width: 0,
            height: 0,
            left: this.tower.width()/2 - 0,
            top: this.tower.height()/2 - 0,
            opacity: 1
        }
        this.setup();
    }
    onResize() {
        this.jquery.stop();
        this.animation();
    }
    animation() {
        this.jquery.animate({
            width: this.getActualRange()*2,
            height: this.getActualRange()*2,
            left: this.tower.width()/2 - this.getActualRange(),
            top: this.tower.height()/2 - this.getActualRange(),
            opacity: 0
        }, {
            duration: this.animationDuration,
            progress: (prog) => this.progress = prog,
            complete: () => {
                this.jquery.css(this.style);
                this.animation();
            }
        })
    }
    setup() {
        this.node.append(this.jquery);
        this.jquery.width(0);
        this.jquery.height(0);
        this.jquery.css(this.style);
        this.animation();
    }
}

class Projectile {
    constructor(getInitPosition, enemy, damage, moveSpeed, color) {
        this.id = new Date().getTime();
        this.jquery = new $(`<div class="projectile"></div>`);
        this.style = {
            ...getInitPosition(),
            backgroundColor: getRandomizedColor(...color)
        }
        this.width = 0.006;
        this.height = 0.006;
        this.enemy = enemy;
        this.moveSpeed = moveSpeed;
        this.damage = damage;
        this.animationEnded = false;
        this.destination = this.enemy.spritePosition();
        this.setup();
    }
    onResize(newWidth, newHeight) {
        let pos = this.jquery.position();
        let xCurRatio = (pos.left / windowSize.width);
        let xNewPos = newWidth * xCurRatio;
        let yCurRatio = (pos.top / windowSize.height);
        let yNewPos = newHeight * yCurRatio;

        this.jquery.height(this.height * newWidth);
        this.jquery.width(this.width * newWidth);

        this.jquery.stop();
        this.jquery.css({
            left: xNewPos,
            top: yNewPos
        })
        this.moveToTarget();
    }
    pause() {
        this.jquery.stop();
    }
    resume() {
        this.moveToTarget();
    }
    moveToTarget() {
        let enPosition = this.enemy.spritePosition();;

        let enX = enPosition.left - this.jquery.width()/2;
        let enY = enPosition.top - this.jquery.height()/2;

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
                    let newEnCoord = this.enemy.spritePosition()[fx.prop];
                    if (fx.prop === 'left') newEnCoord -= this.jquery.width()/2;
                    if (fx.prop === 'top') newEnCoord -= this.jquery.height()/2;
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
        if (this.enemy.isAlive) {
            this.enemy.modifyHp(-this.damage);
        }
    }
    setup() {
        game.append(this.jquery);
        this.jquery.height(this.height * windowSize.width);
        this.jquery.width(this.width * windowSize.width);
        this.jquery.css(this.style);
        this.moveToTarget();
    }
}

class Tower {
    constructor(node) {
        this.jquery = new $(`<div class="tower"></div>`);
        this.node = node;

        this.range = 0.2; // Range to be adjusted
        this.attackSpeed = 2;
        this.projectileSpeed = 0.2;
        this.damage = 10;
        this.projectileColor = [35, 196, 196];

        this.canAttack = true;
        this.paused = false;
        // this.setup();
    }

    static image = "";

    onResize(newWidth) {
        this.radar.onResize(newWidth);
    }

    getActualRange() {
        return this.range * windowSize.width;
    }

    getProjectilePosition() {
        let offset = {
            left: this.jquery.width()/2,
            top: 5
        }
        return {
            left: this.node.position().left + offset.left,
            top: this.node.position().top + offset.top,
        }
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }
    setup() {
        this.jquery.css("background-image", `url(${this.constructor.image})`);
        this.node.append(this.jquery);
        this.radar = new Radar(this.node, this.jquery, this.getActualRange.bind(this));
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

                let nodeX = this.getProjectilePosition().left;
                let nodeY = this.getProjectilePosition().top;

                let distance = distanceTo(nodeX, nodeY, enX, enY);

                if (distance < this.getActualRange()) {
                    enemiesInRange.push(enemy);
                }
            })
            if (enemiesInRange.length) {
                let enemyCloserToEnd = {
                    percentWalked: 0,
                    nextPath: 0
                };
                enemiesInRange.forEach((enemy) => {
                    if (enemyCloserToEnd.nextPath < enemy.nextPath) {
                        enemyCloserToEnd = enemy;
                    } else if (enemyCloserToEnd.nextPath === enemy.nextPath) {
                        if (enemyCloserToEnd.percentWalked < enemy.percentWalked) {
                            enemyCloserToEnd = enemy;
                        }
                    }
                })
                let projectile = new Projectile(
                    this.getProjectilePosition.bind(this),
                    enemyCloserToEnd,
                    this.damage,
                    this.projectileSpeed,
                    this.projectileColor
                );
                gameState.projectiles.push(projectile);
                this.canAttack = false;
                setTimeout(() => {
                    this.canAttack = true;
                }, 1000/this.attackSpeed)
            }
        }
    }
}

class TowerFast extends Tower {
    constructor(node) {
        super(node);
        this.setup();
    }
    static name = "Fast Tower";
    static id = "fast-tower";
    static cost = 100;
    static description = "Fast tower with good range. Low damage.";
    static image = "fast-tower.png";
}

class TowerSlow extends Tower {
    constructor(node) {
        super(node);
        this.range = 0.15;
        this.attackSpeed = 1;
        this.projectileSpeed = 0.1;
        this.damage = 50;
        this.setup();
    }
    static name = "Powerful Tower";
    static id = "slow-tower";
    static cost = 120;
    static description = "High damage but slow speed.";
    static image = "slow-tower.png";
}

class TowerSticky extends Tower {
    constructor(node) {
        super(node);
        this.range = 0.2;
        this.attackSpeed = 1;
        this.projectileSpeed = 0.1;
        this.damage = 5;
        this.enemiesChosen = [];
        this.setup();
    }
    static name = "Sticky Tower";
    static id = "sticky-tower";
    static cost = 70;
    static description = "Slows down enemies in range.";
    static image = "slow-tower.png";

    update() {
        if (!this.paused) {
            let enemiesInRange = [];
            gameState.enemies.forEach((enemy, i) => {
                let enPosition = enemy.jquery.position();
                let enX = enPosition.left;
                let enY = enPosition.top;

                let nodeX = this.getProjectilePosition().left;
                let nodeY = this.getProjectilePosition().top;

                let distance = distanceTo(nodeX, nodeY, enX, enY);

                if (distance < this.getActualRange()) {
                    enemy.slowDown();
                } else enemy.regularSpeed();
            })
        }
    }
}