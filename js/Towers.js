class Node {
    constructor(position) {
        this.jquery = new $('<button></button>');
        this.sizeRelative = 10 / windowSize.zoom;
        this.style = {
            ...position,
            width: windowSize.width / this.sizeRelative,
            height: windowSize.width / this.sizeRelative
        };
        this.hasTower = false;
        this.towerPicker = undefined;
        this.paused = false;
        this.setup();
    }
    onResize(newWidth) {
        this.jquery.css({
            width: newWidth / this.sizeRelative,
            height: newWidth / this.sizeRelative
        })
    }
    pause() {
        this.paused = true;
    }
    resume() {
        this.paused = false;
    }
    chooseTower(ChosenTower) {
        gameState.modifyMoney(-ChosenTower.cost());
        let tower = new ChosenTower(this.jquery);
        this.jquery.css('border', 'none');
        gameState.towers.push(tower);
        tower.setup();
        this.hasTower = true;
        this.towerPicker = undefined;
    }
    setup() {
        game.append(this.jquery);
        this.jquery.addClass('node');
        this.jquery.css(this.style);
        this.jquery.on('click', () => {
            if (!this.hasTower && !this.paused) {
                this.towerPicker = new TowerPicker(
                    this.chooseTower.bind(this)
                );
            }
        })
    }
}

class Radar {
    constructor(node, tower, getActualRange, attackSpeed) {
        this.node = node;
        this.tower = tower;
        this.visualOffset = 1.1;
        this.getActualRange = getActualRange;
        this.jquery = new $(`<div class="radar"></div>`);
        this.animationDuration = 1000/(attackSpeed/4);
        this.setup();
    }
    style() {
        return {
            width: 0,
            height: 0,
            left: this.tower.width()/2,
            top: this.tower.height()/2,
            pointerEvents: 'none',
            opacity: 1,
        }
    }
    onResize() {
        this.jquery.stop();
        this.jquery.css(this.style());
        this.animation();
    }
    animation() {
        this.jquery.animate({
            width: this.getActualRange() * 2 * this.visualOffset,
            height: this.getActualRange() * 2 * this.visualOffset,
            opacity: 0
        }, {
            duration: this.animationDuration,
            progress: () => {
                this.jquery.css({
                    left: this.node.innerWidth()/2 - this.jquery.outerWidth()/2,
                    top: this.node.innerHeight()/2 - this.jquery.outerHeight()/2,
                })
            },
            complete: () => {
                this.jquery.css(this.style());
                this.animation();
            }
        })
    }
    setup() {
        this.node.append(this.jquery);
        this.jquery.width(0);
        this.jquery.height(0);
        this.jquery.css(this.style());
        this.animation();
    }
}

class Projectile {
    constructor(getInitPosition, enemy, damage, moveSpeed, color, size, maxDistance, areaOfEffect) {
        this.id = new Date().getTime();
        this.jquery = new $(`<div class="projectile"></div>`);
        this.getInitPosition = getInitPosition;
        this.color = color;
        this.size = size;
        this.width = size * windowSize.zoom;
        this.height = size * windowSize.zoom;
        this.enemy = enemy;
        this.moveSpeed = moveSpeed;
        this.damage = damage;
        this.areaOfEffect = areaOfEffect;
        this.maxDistance = maxDistance * 1.2;
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

        this.jquery.height(this.height * newWidth * windowSize.zoom);
        this.jquery.width(this.width * newWidth * windowSize.zoom);

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

        let distance = tools.distanceTo(x, y, enX, enY);
        let duration = distance / this.moveSpeed;

        this.destination = {
            left: enX,
            top: enY
        }

        this.jquery.animate(this.destination, {
            duration,
            easing: "linear",
            progress: (an) => {
                let initPos = this.getInitPosition();
                let nowPos = this.jquery.position();
                nowPos = {
                    left: nowPos.left + this.jquery.width()/2,
                    top: nowPos.top + this.jquery.height()/2,
                }
                let distance = tools.distanceTo(
                    initPos.left,
                    initPos.top,
                    nowPos.left,
                    nowPos.top
                );
                if (distance > this.maxDistance) {
                    this.fail();
                }
            },
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
        if (this.animationEnded) return;
        this.animationEnded = true;
        let projIndex = gameState.projectiles.findIndex((projectile) => {
            return projectile.id === this.id;
        })
        gameState.projectiles.splice(projIndex, 1);
        if (this.areaOfEffect) {
            this.explode();
        } else {
            if (this.enemy.isAlive) {
                this.enemy.modifyHp(-this.damage);
            }
            this.jquery.remove();
        }
    }
    fail() {
        if (this.animationEnded) return;
        this.animationEnded = true;
        this.jquery.stop();
        let projIndex = gameState.projectiles.findIndex((projectile) => {
            return projectile.id === this.id;
        })
        gameState.projectiles.splice(projIndex, 1);
        
        if (this.areaOfEffect) {
            this.explode();
        } else {
            this.jquery.remove();
        }
    }
    explode() {
        let enemies = gameState.enemies.filter((enemy) => enemy.isAlive);
        let curPosition = this.jquery.position();
        let x = curPosition.left + this.jquery.width()/2;
        let y = curPosition.top + this.jquery.height()/2;
        let relativeAreaOfEffect = this.areaOfEffect * windowSize.width * windowSize.zoom / 1920;
        enemies.forEach((enemy) => {
            if (enemy.isAlive) {
                let enPosition = enemy.spritePosition();
                let enX = enPosition.left;
                let enY = enPosition.top;
    
                let distance = tools.distanceTo(x, y, enX, enY);
                
                if (distance <= relativeAreaOfEffect) {
                    enemy.modifyHp(-this.damage);
                }
            }
        })
        this.jquery.toggle({
            effect: 'puff',
            complete: () => this.jquery.remove()
        });
        audioManager.play('towerExplosion');
    }
    setup() {
        game.append(this.jquery);
        this.jquery.height(this.height * windowSize.width * windowSize.zoom);
        this.jquery.width(this.width * windowSize.width * windowSize.zoom);

        let initPos = this.getInitPosition();
        this.jquery.css({
            left: initPos.left - this.jquery.width()/2,
            top: initPos.top - this.jquery.height()/2,
            backgroundColor: tools.getRandomizedColor(...this.color)
        });
        this.moveToTarget();
    }
}

class Tower {
    constructor(node) {
        this.jquery = new $(`<div class="tower"></div>`);
        this.node = node;
        this.id = new Date().getTime();
        this.levelBox = undefined

        this.range = 0.19;
        this.attackSpeed = 2;
        this.projectileSpeed = 0.4;
        this.projectileSize = 0.012;
        this.damage = 20;
        this.projectileColor = [35, 196, 196];
        this.areaOfEffect = 0;
        this.audioName = '';
        this.hasSpriteAnimation = false;
        this.spriteAnimation = undefined;

        this.level = 0;
        this.levelInfo = []

        // this.paused = false;
        // this.setup();
    }

    static image() { return "" }

    onResize(newWidth) {
        this.radar.onResize(newWidth);
    }

    getActualRange() {
        return this.range * windowSize.width * windowSize.zoom;
    }

    onMount() {} // To be overriden

    getProjectilePosition() {
        let offset = {
            left: this.jquery.width()/2,
            top: this.jquery.height()/2
        }
        return {
            left: this.node.position().left + offset.left,
            top: this.node.position().top + offset.top,
        }
    }
    pause() {
        // this.paused = true;
    }
    resume() {
        // this.paused = false;
    }

    onLevelUp() {} // To be overriden

    openLevelUpBox() {
        if (!gameState.getLevelData().canLevelUp) return;

        let levelInfo = this.levelInfo[this.level+1];

        if (!levelInfo) return;
        
        let levelContent = new $(`<div class="content">
                <h2>Upgrade Your Structure</h2>
                <div><label>Current Level: </label><span>${this.level+1}</span></div>
                <div><label>Cost to Upgrade: </label><span><i class="fas fa-atom"></i> ${levelInfo.cost}</span></div>
                <div>
                    <label>Next Level Changes:</label>
                    <ul>
                        ${levelInfo.changes.map((change) => {
                            return `<li><label>${change.label}: </label><span>+${change.value * 100}%</span></li>`
                        }).join("")}
                    </ul>
                </div>
                <div class="buttons">
                    <button class="close-button">Close</button>
                    <button class="level-up-button">Upgrade!</button>
                </div>
            </div>`)

        const close = () => {
            this.levelBox.jquery.remove();
            this.levelBox = undefined;
            gameState.queuedActions = gameState.queuedActions.filter((action) => {
                return action.id !== 'level-up';
            })
        }

        levelContent.find('.close-button').on('click', close.bind(this));
        levelContent.find('.level-up-button').on('click', () => {
            gameState.modifyMoney(-levelInfo.cost);
            levelInfo.changes.forEach((change) => {
                this[change.key] = this[change.key] * (change.value + 1);
            })
            this.level++;
            let color = `rgba(255, 255, 255, ${0.2 * this.level})`;
            // this.jquery.css({boxShadow: `0px 0px 9px 10px rgba(255,255,255,1)`});
            this.node.css({
                boxShadow: `0px 0px 9px 10px ${color}`,
                border: 'none',
                backgroundColor: color
            });

            this.radar.jquery.remove();
            this.radar = new Radar(
                this.node,
                this.jquery,
                this.getActualRange.bind(this),
                this.attackSpeed
            );

            this.onLevelUp();

            gameState.queuedActions = gameState.queuedActions.filter((action) => {
                return action.id !== this.id;
            })
            gameState.queuedActions.push({
                id: this.id,
                waitTime: 1000/this.attackSpeed,
                queuedAt: new Date().getTime(),
                callback: this.update.bind(this),
                loop: true
            })
            close();
        });
        levelContent.find('.level-up-button').prop('disabled', true);

        const checkIfBuyable = () => {
            if (gameState.money >= levelInfo.cost) {
                levelContent.find('.level-up-button').prop('disabled', false);
            } else {
                levelContent.find('.level-up-button').prop('disabled', true);
            }
        }

        gameState.queuedActions.push({
            id: 'level-up',
            waitTime: 100,
            loop: true,
            callback: () => checkIfBuyable(),
            queuedAt: new Date().getTime()
        })


        this.levelBox = new ModalBox(levelContent, close.bind(this), 'level-up');
        game.append(this.levelBox.jquery)
    }
    update() {
        let enemiesInRange = [];
        gameState.enemies.forEach((enemy) => {
            if (enemy.isAlive) {
                let enPosition = enemy.jquery.position();
                let enX = enPosition.left + enemy.jquery.width()/2;
                let enY = enPosition.top + enemy.jquery.height()/2;
    
                let nodeX = this.getProjectilePosition().left;
                let nodeY = this.getProjectilePosition().top;
    
                let distance = tools.distanceTo(nodeX, nodeY, enX, enY);
    
                if (distance < this.getActualRange()) {
                    enemiesInRange.push(enemy);
                }
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
                this.projectileSize,
                this.getActualRange(),
                this.areaOfEffect
            );
            gameState.projectiles.push(projectile);
            audioManager.play(this.audioName);
        }
    }
    setup() {
        this.node.append(this.jquery);
        this.jquery.css({
            backgroundSize: `100%`,
            backgroundImage: `url(${this.constructor.image()})`,
            backgroundPosition: 0,
            backgroundRepeat: "no-repeat",
        })

        this.jquery.on('click', () => {
            this.openLevelUpBox();
        })
        
        this.radar = new Radar(
            this.node,
            this.jquery,
            this.getActualRange.bind(this),
            this.attackSpeed
        );

        if (this.hasSpriteAnimation) {
            this.spriteAnimation = tools.addSpriteAnimation(
                ...this.hasSpriteAnimation
            )
        }

        this.onMount();

        gameState.queuedActions.push({
            id: this.id,
            waitTime: 1000/this.attackSpeed,
            queuedAt: new Date().getTime(),
            callback: this.update.bind(this),
            loop: true
        })
    }
}

class TowerFast extends Tower {
    constructor(node) {
        super(node);
        this.audioName = 'towerFast';
        tools.addRotationLoop(
            this.jquery,
            1
        )
        this.levelInfo = [
            // Level 1
            {},
            // Level 2
            {
                cost: 300,
                changes: [
                    {label: 'Range', key: 'range', value: 0.25},
                    {label: 'Attack Speed', key: 'attackSpeed', value: 0.25},
                    {label: 'Damage', key: 'attackSpeed', value: 0.50},
                ]
            },
            // Level 3
            {
                cost: 600,
                changes: [
                    {label: 'Range', key: 'range', value: 0.75},
                    {label: 'Attack Speed', key: 'attackSpeed', value: 0.25},
                    {label: 'Damage', key: 'attackSpeed', value: 0.50},
                ]
            },
        ];
    }
    static name() { return  "B Cell (White Blood)" }
    static id() { return  "fast-tower" }
    static cost() { return  100 }
    static description() { return  "Shoots antibodies at a high speed and range, but causes low damage." }
    static image() { return  "images/b-cell.png" }
    static thumbnail() { return  "images/b-cell.png" }
}

class TowerSlow extends Tower {
    constructor(node) {
        super(node);
        this.range = 0.15;
        this.attackSpeed = 0.4;
        this.projectileSpeed = 0.07;
        this.projectileSize = 0.1;
        this.damage = 40;
        this.areaOfEffect = 120;
        this.audioName = 'towerSlow';
        tools.addRotationLoop(
            this.jquery,
            3
        )
        this.levelInfo = [
            // Level 1
            {},
            // Level 2
            {
                cost: 400,
                changes: [
                    {label: 'Attack Speed', key: 'attackSpeed', value: 0.15},
                    {label: 'Range', key: 'range', value: 0.25},
                    {label: 'Area of Effect', key: 'areaOfEffect', value: 0.25},
                    {label: 'Damage', key: 'attackSpeed', value: 0.5},
                ]
            },
            // Level 3
            {
                cost: 1000,
                changes: [
                    {label: 'Range', key: 'range', value: 0.25},
                    {label: 'Damage', key: 'attackSpeed', value: 0.25},
                    {label: 'Attack Speed', key: 'attackSpeed', value: 0.50},
                    {label: 'Area of Effect', key: 'areaOfEffect', value: 0.50},
                ]
            },
        ];
    }
    static name() { return  "T Cell (White Blood)" }
    static id() { return  "slow-tower" }
    static cost() { return  120 }
    static description() { return  "Shoots phagocytes that cause high area damage but have slow speed." }
    static image() { return  "images/t-cell.png" }
    static thumbnail() { return  "images/t-cell.png" }
}

class TowerSticky extends Tower {
    constructor(node) {
        super(node);
        this.range = 0.2;
        this.attackSpeed = 2;
        this.projectileSpeed = 0.1;
        this.damage = 5;
        this.enemiesChosen = [];
        this.hasSpriteAnimation = [this.jquery, 5, 0.8];
        this.levelInfo = [
            // Level 1
            {},
            // Level 2
            {
                cost: 100,
                changes: [
                    {label: 'Range', key: 'range', value: 0.25},
                ]
            },
            // Level 3
            {
                cost: 300,
                changes: [
                    {label: 'Range', key: 'range', value: 0.25},
                ]
            },
        ];
    }
    static name() { return  "Mucosa" }
    static id() { return  "sticky-tower" }
    static cost() { return  70 }
    static description() { return  "Generate mucus to slow down enemies in range." }
    static image() { return  "images/mucosa.png" }
    static thumbnail() { return  "images/mucosa-thumbnail.png" }
    update() {}
    onMount() {
        gameState.enemies.forEach((enemy) => {
            if (enemy.isAlive) {
                let enPosition = enemy.getCenterPosition();
                let enX = enPosition.left;
                let enY = enPosition.top;
        
                let nodeX = this.getProjectilePosition().left;
                let nodeY = this.getProjectilePosition().top;
        
                let distance = tools.distanceTo(nodeX, nodeY, enX, enY);

                if (distance <= this.getActualRange()) {
                    enemy.slowDown(this.id);
                }
                enemy.pause();
                enemy.resume();
            }
        })
    }
    onLevelUp() {
        this.onMount();
    }
}