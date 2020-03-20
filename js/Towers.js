class Node {
    constructor(position) {
        this.jquery = new $('<button></button>');
        this.style = {
            ...position,
            width: windowSize.width / 12,
            height: windowSize.width / 12
        };
        this.hasTower = false;
        this.towerPicker = undefined;
        this.paused = false;
        this.setup();
    }
    onResize(newWidth) {
        this.jquery.css({
            width: newWidth / 12,
            height: newWidth / 12
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
    constructor(getInitPosition, enemy, damage, moveSpeed, color, size) {
        this.id = new Date().getTime();
        this.jquery = new $(`<div class="projectile"></div>`);
        this.style = {
            ...getInitPosition(),
            backgroundColor: tools.getRandomizedColor(...color)
        }
        this.width = size;
        this.height = size;
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
        if (!this.enemy.isAlive) console.log('not alive');
        let enPosition = this.enemy.spritePosition();;

        let enX = enPosition.left - this.jquery.width()/2;
        let enY = enPosition.top - this.jquery.height()/2;

        let curPosition = this.jquery.position();
        let x = curPosition.left;
        let y = curPosition.top;

        let distance = tools.distanceTo(x, y, enX, enY);
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
        this.id = new Date().getTime();

        this.range = 0.2; // Range to be adjusted
        this.attackSpeed = 2;
        this.projectileSpeed = 0.4;
        this.projectileSize = 0.006;
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
            top: this.jquery.height() * 0.2
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
        this.jquery.css({
            backgroundSize: `100%`,
            backgroundImage: `url(${this.constructor.image})`,
            backgroundPosition: 0,
            backgroundRepeat: "no-repeat",
        })
        this.node.append(this.jquery);
        this.radar = new Radar(
            this.node,
            this.jquery,
            this.getActualRange.bind(this)
        );
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

                let distance = tools.distanceTo(nodeX, nodeY, enX, enY);

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
                    this.projectileColor,
                    this.projectileSize
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
        tools.addRotationLoop(
            this.jquery,
            1
        )
    }
    static name = "White Blood: B Cell";
    static id = "fast-tower";
    static cost = 100;
    static description = "Shoots antibodies at a high speed and range, but causes low damage.";
    static image = "images/b-cell.png";
    static thumbnail = "images/b-cell.png";
}

class TowerSlow extends Tower {
    constructor(node) {
        super(node);
        this.range = 0.15;
        this.attackSpeed = 1;
        this.projectileSpeed = 0.1;
        this.projectileSize = 0.06;
        this.damage = 50;
        this.setup();
        tools.addRotationLoop(
            this.jquery,
            1
        )
    }
    static name = "White Blood: T Cell";
    static id = "slow-tower";
    static cost = 120;
    static description = "Shoots phagocytes that cause high damage but have slow speed.";
    static image = "images/t-cell.png";
    static thumbnail = "images/t-cell.png";
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
        this.spriteAnimation = tools.addSpriteAnimation(
            this.jquery,
            5,
            0.8
        )
    }
    static name = "Mucosa";
    static id = "sticky-tower";
    static cost = 70;
    static description = "Generate mucus to slow down enemies in range.";
    static image = "images/mucosa.png";
    static thumbnail = "images/mucosa-thumbnail.png";

    update() {
        if (!this.paused) {
            gameState.enemies.forEach((enemy, i) => {
                let enPosition = enemy.jquery.position();
                let enX = enPosition.left;
                let enY = enPosition.top;

                let nodeX = this.getProjectilePosition().left;
                let nodeY = this.getProjectilePosition().top;

                let distance = tools.distanceTo(nodeX, nodeY, enX, enY);

                if (distance < this.getActualRange()) {
                    enemy.slowDown(this.id);
                } else enemy.regularSpeed(this.id);
            })
        }
    }
}