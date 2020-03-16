class Enemy {
    constructor(path) {
        this.id = new Date().getTime();
        this.jquery = new $(`<div class="enemy"></div>`);
        this.sprite = new $(`<div class="sprite"></div>`);
        this.hpBar = new $(`<div class="hp-bar"><div></div><div></div></div>`);
        this.beingSlowedDown = false;
        
        this.width = 8;
        this.height = 8;
        this.moveSpeed = 0.05;
        this.maxHp = 50;
        this.money = 10;
        
        this.hp = this.maxHp;
        this.path = path;
        this.percentWalked = 0;
        this.nextPath = 1;
        this.isAlive = true;
        this.style = {
            top: randomize($(this.path[0]).position().top, 30) + "px",
            left: randomize($(this.path[0]).position().left, 30) + "px",
        }
        // this.setup();
    }

    spritePosition() {
        let width = this.jquery.width();
        let height = this.jquery.height();
        let basePosition = this.jquery.position();
        return {
            left: basePosition.left + width/2,
            top: basePosition.top + height/2
        }
    }

    pause() {
        this.jquery.stop();
    }

    resume() {
        this.followPath();
    }

    modifyHp(amount) {
        this.hp += amount;
        let percentLeft = (this.hp / this.maxHp) * 100;
        let percentLost = ((this.maxHp - this.hp) / this.maxHp) * 100;
        this.hpBar.css({
            gridTemplateColumns: `${percentLeft}% ${percentLost}%`,
            visibility: "inherit"
        })

        if (this.hp <= 0) {
            this.hp = 0;
            let enIndex = gameState.enemies
            .findIndex((enemy) => {
                return enemy.id === this.id;
            })
            gameState.enemies.splice(enIndex, 1);
            $(this.jquery).remove();
            gameState.modifyMoney(this.money);
            this.isAlive = false;
        }
    }

    slowDown() {
        if (!this.beingSlowedDown) {
            this.jquery.stop();
            this.beingSlowedDown = true;
            this.followPath();
        }
    }

    regularSpeed() {
        if (this.beingSlowedDown) {
            this.jquery.stop();
            this.beingSlowedDown = false;
            this.followPath();
        }
    }

    moveTo(x, y) {
        x = randomize(x, 30);
        y = randomize(y, 30);

        let currPos = this.jquery.position();
        let currX = currPos.left;
        let currY = currPos.top;
        let distance = distanceTo(x, y, currX, currY);
        let duration = distance / this.moveSpeed;
        if (this.beingSlowedDown) duration = duration * 2;
        this.jquery.animate({
            left: x,
            top: y
        }, {
            duration,
            easing: "linear",
            // step: (now, fx) => {
            //     console.log(fx);
            //     if (this.beingSlowedDown) {
            //         fx.now -= 5;
            //     }
                
            // },
            progress: (an, prog, remaining) => {
                // console.log(remaining);
                // if (this.beingSlowedDown && !appliedSlowedDown) {
                //     console.log(an);
                //     an.startTime = an.startTime - 500;
                //     an.duration = an.duration + 500;
                //     appliedSlowedDown = true;
                // }
                this.percentWalked = prog;
            },
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
        this.jquery.append(this.hpBar);
        this.jquery.append(this.sprite);
        this.jquery.css(this.style);
        this.sprite.css({
            backgroundColor: getRandomizedColor(217, 59, 59)
        });
        this.sprite.height(this.height);
        this.sprite.width(this.width);
        this.followPath();
    }
}

class EnemySmall extends Enemy {
    constructor(path) {
        super(path);
        this.setup();
    }
}

class EnemyBig extends Enemy {
    constructor(path) {
        super(path);
        this.height = 16;
        this.width = 16;
        this.setup();
    }
}

class GameOver {
    constructor() {
        this.jquery = new $(`<div class="game-over"></div>`);
        this.box = new $(`<div class="box"><h2>Game Over!</h2></div>`);
        this.text = new $(`<p>Some text here...</p>`);
        this.button = new $(`<button>Try Again</button>`);
        this.overlay = new $(`<div class="overlay"></div>`);
        this.setup();
    }
    setup() {
        game.append(this.jquery);
        this.jquery.append(this.box);
        this.box.append(this.text);
        this.box.append(this.button);
        this.jquery.append(this.overlay);
        this.box.css({
            top: 'calc(50% - ' + this.box.height()/2 + 'px)',
            left: 'calc(50% - ' + this.box.width()/2 + 'px)',
        })
        this.button.on('click', () => reset());
    }
}

class Node {
    constructor(position) {
        this.jquery = new $('<div><div>');
        this.style = {...position};
        this.hasTower = false;
        // this.overlay = undefined;
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
    closeTowerPicker() {
        // this.overlay.jquery.remove();
        this.towerPicker.jquery.remove();
        // this.overlay = undefined;
        this.towerPicker = undefined;
    }
    chooseTower(ChosenTower) {
        gameState.modifyMoney(-ChosenTower.cost);
        let tower = new ChosenTower(this.jquery);
        // this.jquery.append(tower.jquery);
        this.jquery.css('border', 'none');
        gameState.towers.push(tower);
        this.hasTower = true;
        this.closeTowerPicker();
        // this.closeOverlay();
    }
    setup() {
        game.append(this.jquery);
        this.jquery.addClass('node');
        this.jquery.css(this.style);
        this.jquery.on('click', () => {
            if (!this.hasTower && !this.paused) {
                // this.overlay = new Overlay({
                //     closeOverlay: this.closeOverlay.bind(this),
                //     children: new TowerPicker(
                //         this.chooseTower.bind(this),
                //         this.jquery.position()
                //     )
                // });
                // game.append(this.overlay.jquery);
                this.towerPicker = new TowerPicker(
                    this.chooseTower.bind(this),
                    this.closeTowerPicker.bind(this)
                    // this.jquery.position()
                );
                // game.append(this.towerPicker.jquery);
            }
        })
    }
}

class Projectile {
    constructor(initPosition, enemy, damage, moveSpeed, color) {
        this.id = new Date().getTime();
        this.jquery = new $(`<div class="projectile"></div>`);
        this.style = {
            top: initPosition.top,
            left: initPosition.left,
            backgroundColor: getRandomizedColor(...color)
        }
        this.enemy = enemy;
        this.moveSpeed = moveSpeed;
        this.damage = damage;
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
            enPosition = this.destination;
        } else enPosition = this.enemy.spritePosition();

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
        this.jquery.css(this.style);
        this.moveToTarget();
    }
}

class TowerPicker {
    constructor(confirmTower, closeTowerPicker) {
        this.jquery = new $(`<div class="tower-picker"></div>`);
        this.box = new $('<div class="box"><h2>Build a Tower</h2></div>');
        this.container = new $(`<div class="container"></div>`);
        this.confirm = new $(`<button class="confirm">OK</button>`);
        this.description = new $(`<div class="description"></div>`);
        this.overlay = new $(`<div class="overlay"></div>`);
        this.confirmTower = confirmTower;
        this.closeTowerPicker = closeTowerPicker;
        this.towerSelected = undefined;
        this.towers = [
            TowerFast,
            TowerSlow,
            TowerSticky
        ]
        this.setup();
    }
    selectTower(Tower) {
        $('.tower-picker .container button').each((i, element) => {
            $(element).removeClass('selected');
        })
        $(`.${Tower.id} button`).addClass('selected');
        this.towerSelected = Tower;
        this.confirm.prop('disabled', false);
        this.box.append(this.description);
        this.description.text(Tower.description);
    }
    checkIfDisabled(Tower) {
        let button = $(`.tower-picker .${Tower.id} button`);
        if (gameState.money >= Tower.cost) {
            button.prop("disabled", false);
        } else button.prop("disabled", true);
    }
    update() {
        setInterval(() => {
            this.towers.forEach((Tower) => {
                this.checkIfDisabled(Tower);
            })
        }, fps)
    }
    setup() {
        game.append(this.jquery);
        this.jquery.append(this.box);
        this.overlay.on('click', () => this.closeTowerPicker())
        this.box.append(this.container);
        this.towers.forEach((Tower) => {
            let towerDiv = new $(`<div class=${Tower.id}></div>`);
            let button = new $(`<button><img src="${Tower.image}"/></button>`);
            let label = $(`<label>$${Tower.cost}</label>`);

            towerDiv.append(button);
            towerDiv.append(label);

            this.container.append(towerDiv);
            button.on('click', () => this.selectTower(Tower));
            this.checkIfDisabled(Tower);
        })
        this.confirm.prop('disabled', true);
        this.box.append(this.confirm);
        this.confirm.on('click', () => this.confirmTower(this.towerSelected));
        this.jquery.append(this.overlay);
        this.box.css({
            top: 'calc(50% - ' + this.box.height()/2 + 'px)',
            left: 'calc(50% - ' + this.box.width()/2 + 'px)',
        })
        this.update();
    }
}

class Radar {
    constructor(node, tower, range) {
        this.node = node;
        this.tower = tower;
        this.range = range;
        this.jquery = new $(`<div class="radar"></div>`);
        this.animationDuration = 3000;
        this.style = {
            width: 0,
            height: 0,
            left: this.tower.width()/2 - 0,
            top: this.tower.height()/2 - 0,
            opacity: 1
        }
        this.setup();
    }
    // reverseAnimation() {
    //     this.jquery.animate({
    //         width: 0,
    //         height: 0,
    //         left: this.tower.width()/2,
    //         top: this.tower.height()/2
    //     }, {
    //         duration: this.animationDuration,
    //         complete: () => this.animation()
    //     })
    // }
    animation() {
        this.jquery.animate({
            width: this.range*2,
            height: this.range*2,
            left: this.tower.width()/2 - this.range,
            top: this.tower.height()/2 - this.range,
            opacity: 0
        }, {
            duration: this.animationDuration,
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

class Tower {
    constructor(node) {
        this.jquery = new $(`<div class="tower"></div>`);
        this.node = node;
        this.nodePosition = node.position();
        this.offset = {};
        this.projectilePosition = {};

        this.range = 100;
        this.attackSpeed = 2;
        this.projectileSpeed = 0.2;
        this.damage = 10;
        this.projectileColor = [35, 196, 196];

        this.canAttack = true;
        this.paused = false;
        // this.setup();
    }

    static image = "";

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }
    setup() {
        this.jquery.css("background-image", `url(${this.constructor.image})`);
        this.node.append(this.jquery);
        this.radar = new Radar(this.node, this.jquery, this.range);
        this.offset = {
            left: this.jquery.width()/2,
            top: 5
        }
        this.projectilePosition = {
            left: this.nodePosition.left + this.offset.left,
            top: this.nodePosition.top + this.offset.top,
        }
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

                let nodeX = this.projectilePosition.left;
                let nodeY = this.projectilePosition.top;

                let distance = distanceTo(nodeX, nodeY, enX, enY);

                if (distance < this.range) {
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
                    this.projectilePosition,
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
        this.range = 80;
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
        this.range = 120;
        this.attackSpeed = 1;
        this.projectileSpeed = 0.1;
        this.damage = 5;
        this.enemiesChosen = [];
        this.setup();
    }
    static name = "Sticky Tower";
    static id = "sticky-tower";
    static cost = 70;
    static description = "Slows down up to 5 enemies";
    static image = "slow-tower.png";

    update() {
        if (!this.paused) {
            let enemiesInRange = [];
            gameState.enemies.forEach((enemy, i) => {
                let enPosition = enemy.jquery.position();
                let enX = enPosition.left;
                let enY = enPosition.top;

                let nodeX = this.projectilePosition.left;
                let nodeY = this.projectilePosition.top;

                let distance = distanceTo(nodeX, nodeY, enX, enY);

                if (distance < this.range) {
                    enemiesInRange.push(enemy);
                } else enemy.regularSpeed();
            })
            let enemiesChosen = []
            enemiesInRange.forEach((enemy, i) => {
                if (i < 5) {
                    enemiesChosen.push(enemy);
                    enemy.slowDown();
                } else enemy.regularSpeed();
            })
            if (this.canAttack) {
                enemiesChosen.forEach((enemy) => {
                    if (enemy.isAlive) {
                        enemy.modifyHp(-this.damage);
                        this.canAttack = false;
                    }
                })
            }
            setTimeout(() => {
                this.canAttack = true;
            }, 2000)
        }
    }
}