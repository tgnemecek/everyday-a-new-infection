class Enemy {
    constructor(path) {
        this.id = new Date().getTime();
        this.jquery = new $(`<div class="enemy"></div>`);
        this.sprite = new $(`<div class="sprite"></div>`);
        this.hpBar = new $(`<div class="hp-bar"><div></div><div></div></div>`);
        this.beingSlowedDown = 0;
        
        this.width = 0.03;
        this.height = 0.03;
        this.moveSpeed = 40;
        this.maxHp = 50;
        this.money = 10;
        this.damage = 1;
        this.rotationSpeed = 1;
        this.rotation = undefined;

        this.hp = 0;
        this.path = path;
        this.percentWalked = 0;
        this.nextPath = 1;
        this.isPaused = false;
        this.randomRange = 20;
        this.lastRandomX = 1;
        this.lastRandomY = 1;
        this.isAlive = true;
        this.animation = undefined;
        this.spriteAnimation = undefined;
        this.regularSpeedFilter = undefined;
        this.deathImages = [];
        this.waitToRemove = 10000;
        this.fadeOutTime = 2000;
        // this.setup();
    }

    static image() { return "" }

    randomizePosition(range) {
        let factor = windowSize.width / 1920;
        return tools.randomize(0, range * factor);
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
        this.isPaused = true;
    }

    resume() {
        this.followPath({keepLastRandom: true});
        this.isPaused = false;
    }

    modifyHp(amount) {
        this.hp += amount;
        let percentLeft = (this.hp / this.maxHp) * 100;
        let percentLost = ((this.maxHp - this.hp) / this.maxHp) * 100;
        this.hpBar.css({
            gridTemplateColumns: `${percentLeft}% ${percentLost}%`,
            visibility: "inherit"
        })

        if (this.hp <= 0) this.die();
    }

    die() {
        this.hp = 0;
        gameState.modifyMoney(this.money);
        gameState.removeEnemy(this.id);
        this.isAlive = false;
        this.hpBar.remove();
        this.jquery.stop();
        this.rotation.stop();
        let height = this.sprite.height();
        let width = this.sprite.width();

        let size = this.deathImages.length;
        let chosenIndex = Math.floor(Math.random() * size);
        let chosenImage = this.deathImages[chosenIndex];

        this.sprite.css({
            backgroundImage: `url(${chosenImage})`,
            height: height * 2,
            width: width * 2,
            top: -height/2,
            left: -width/2,
            position: "relative"
        })
        tools.addSpriteAnimation(
            this.sprite,
            6,
            0.3,
            "1 normal forwards"
        )
        
        audioManager.play('audioEnemyDeath');

        gameState.queuedActions.push({
            waitTime: this.waitToRemove,
            queuedAt: new Date().getTime(),
            callback: () => {
                this.sprite.animate({opacity: 0}, {
                    duration: this.fadeOutTime,
                    complete: () => $(this.jquery).remove()
                })
            }
        })
    }

    slowDown() {
        if (!this.isAlive) return;
        this.beingSlowedDown++;
        if (this.beingSlowedDown === 1) {
            this.jquery.stop();
            this.regularSpeedFilter = this.sprite.css('filter');
            this.sprite.css({
                filter: `hue-rotate(90deg)`
            })
            this.followPath({keepLastRandom: true});
        }
    }

    regularSpeed() {
        if (!this.isAlive) return;
        this.beingSlowedDown--;
        if (this.beingSlowedDown < 0) this.beingSlowedDown = 0;

        if (this.beingSlowedDown === 0) {
            this.jquery.stop();
            this.sprite.css({
                filter: this.regularSpeedFilter
            })
            this.followPath({keepLastRandom: true});
        }
    }

    onResize(newWidth, newHeight) {
        let pos = this.jquery.position();
        let xCurRatio = (pos.left / windowSize.width);
        let xNewPos = newWidth * xCurRatio;
        let yCurRatio = (pos.top / windowSize.height);
        let yNewPos = newHeight * yCurRatio;

        this.jquery.stop();
        this.sprite.height(this.height * newWidth);
        this.sprite.width(this.width * newWidth);
        this.jquery.css({
            left: xNewPos,
            top: yNewPos
        })
        if (!gameState.isPaused) this.followPath({keepLastRandom: true});
    }

    queueSlowDown(destinationX, destinationY, duration) {
        let towers = gameState.towers;
        let pos = this.jquery.position();
        let currX = pos.left;
        let currY = pos.top;
        towers.forEach((tower) => {
            if (tower instanceof TowerSticky) {
                let towerPos = tower.getProjectilePosition();
                let towerX = towerPos.left;
                let towerY = towerPos.top;
                let towerRadius = tower.getActualRange();
                let intersections = tools.findCircleLineIntersections(
                    currX, currY, destinationX, destinationY,
                    towerRadius, towerX, towerY
                ).sort(function(a, b) {
                    if (a > b) return 1;
                    if (a < b) return -1;
                    return 0;
                });
                if (intersections.length) {
                    let distanceToEnd = tools.distanceTo(currX, currY, destinationX, destinationY);
                    let intersInsideLine = 0;
                    let durations = intersections.map((inter) => {
                        let distanceToInter = tools.distanceTo(currX, currY, inter.x, inter.y);
                        let distanceFromInterToEnd = tools.distanceTo(inter.x, inter.y,
                            destinationX, destinationY);
                        let percentToInter = distanceToInter / distanceToEnd;
                        let durationToInter = percentToInter * duration;

                        let isInsideLine = false;
                        if (percentToInter <= 1 && distanceFromInterToEnd < distanceToEnd) {
                            isInsideLine = true;
                            intersInsideLine++;
                        }
                        return {
                            durationToInter,
                            isInsideLine,
                            distanceToInter,
                            distanceFromInterToEnd
                        };
                    });

                    if (intersInsideLine === 2) {
                        for (let i = 0; i < 2; i++) {
                            let callback = i === 0 ? this.regularSpeed.bind(this)
                                                    : this.slowDown.bind(this)

                            gameState.queuedActions.push({
                                waitTime: durations[i].durationToInter,
                                queuedAt: new Date().getTime(),
                                loop: false,
                                callback
                            })
                        }
                    } else if (intersInsideLine === 1) {
                        let outsider = durations[0].isInsideLine ? durations[1] : durations[0];
                        let insider = outsider === durations[0] ? durations[1] : durations[0];

                        let callback;

                        if (outsider.distanceFromInterToEnd > outsider.distanceToInter) {
                            callback = this.regularSpeed.bind(this)
                        } else callback = this.slowDown.bind(this)

                        gameState.queuedActions.push({
                            waitTime: insider.durationToInter,
                            queuedAt: new Date().getTime(),
                            loop: false,
                            callback
                        })
                    }
                }
            }
        })
    }

    moveTo(x, y, keepLastRandom, callback) {
        if (!keepLastRandom) {
            this.lastRandomX = tools.randomize(0, this.randomRange);
            this.lastRandomY = tools.randomize(0, this.randomRange);
        }

        let factor = windowSize.width / 1920;
        x += this.lastRandomX * factor;
        y += this.lastRandomY * factor;

        x -= this.jquery.width()/2;
        y -= this.jquery.height()/2;

        let currPos = this.jquery.position();
        let currX = currPos.left;
        let currY = currPos.top;
        let distance = tools.distanceTo(x, y, currX, currY);
        let duration = (distance * 500000 / windowSize.width) / this.moveSpeed;
        if (this.beingSlowedDown) duration = duration * 2;


        this.queueSlowDown(x, y, duration);

        this.jquery.animate({
            left: x,
            top: y
        }, {
            duration,
            easing: "linear",
            start: (an) => {
                this.animation = an;
            },
            progress: (an, prog, remaining) => {
                this.percentWalked = prog;
            },
            complete: () => {
                if (typeof callback === 'function') {
                    callback();
                } else {
                    this.nextPath++;
                    this.followPath({keepLastRandom: false});
                }

            }
        })
    }

    followPath({keepLastRandom = false}) {
        let lastIndex = this.path.length - 1;
        if (this.nextPath > lastIndex) {
            this.arrived();
            return;
        };

        let x = $(this.path[this.nextPath]).position().left;
        let y = $(this.path[this.nextPath]).position().top;

        this.moveTo(x, y, keepLastRandom)
    }

    arrived() {
        gameState.modifyHp(-this.damage);
        gameState.removeEnemy(this.id);
        this.jquery.remove();
    }

    onMount() {} // To be overridden

    addToScene() {
        this.hp = this.maxHp;
        game.append(this.jquery);
        this.jquery.append(this.hpBar);
        this.jquery.append(this.sprite);

        let factor = windowSize.width / 1920;
        let randX = tools.randomize(0, this.randomRange * factor);
        let randY = tools.randomize(0, this.randomRange * factor);

        this.jquery.css({
            top: $(this.path[0]).position().top + randX,
            left: $(this.path[0]).position().left + randY,
        });

        this.sprite.css({
            backgroundSize: `100%`,
            backgroundImage: `url(${this.constructor.image()})`,
            backgroundPosition: 0,
            backgroundRepeat: "no-repeat",
            filter: `brightness(${tools.randomize(1, 0.2)})
                    hue-rotate(${tools.randomize(this.constructor.baseHue(), 40)}deg)`,
        });
        let randDirection = Math.round(Math.random());
        this.rotation = tools.addRotationLoop(
            this.sprite,
            1/this.rotationSpeed,
            randDirection ? "normal" : "reverse"
        );

        this.sprite.height(this.height * windowSize.width);
        this.sprite.width(this.width * windowSize.width);
        
        this.followPath({keepLastRandom: false});
        this.onMount();
    }
}

class EnemySmall extends Enemy {
    constructor(path) {
        super(path);
        this.deathImages = ["images/cold-influenza-death1.png", "images/cold-influenza-death2.png", "images/cold-influenza-death3.png"];
    }
    static name() { return "Cold Virus" }
    static description() { return "Really common and fast, but easy to treat." }
    static image() { return "images/cold-influenza.png" }
    static baseHue() { return 0 }
}

class EnemyBig extends Enemy {
    constructor(path) {
        super(path);
        this.height = 0.06;
        this.width = 0.06;
        this.rotationSpeed = 0.4;
        this.maxHp = 600;
        this.moveSpeed = 25;
        this.deathImages = ["images/cold-influenza-death1.png", "images/cold-influenza-death2.png", "images/cold-influenza-death3.png"];
    }
    static name() { return "Flu" }
    static description() { return "Harder to treat but slow." }
    static image() { return "images/cold-influenza.png" }
    static baseHue() { return -150 }
}

class EnemyDivide extends Enemy {
    constructor(path, isClone) {
        super(path);
        this.isClone = isClone;
        this.height = 0.06;
        this.width = 0.06;
        this.moveSpeed = 25;
        this.deathImages = ["images/covid-death.png"];
        this.waitToRemove = 1000;
        this.fadeOutTime = 1;
        this.divideTime = 5000;
        this.divideMin = 20;
        this.divideRange = 70;
    }
    static name() { return "COVID-19" }
    static description() { return "We've never seen this before. Good luck, I guess..." }
    static image() { return "images/covid.png" }
    static baseHue() { return 0 }

    static divide() {
        let maxDivisions = 64;
        let newEnemies = [];

        let count = gameState.enemies.reduce((acc, enemy) => {
            if (enemy instanceof EnemyDivide) {
                return acc + 1;
            } else return acc;
        }, 0);

        if (count >= maxDivisions) return;

        gameState.enemies.forEach((enemy) => {
            if (enemy instanceof EnemyDivide) {
                let currPos = enemy.jquery.position();
                let range = tools.randomize(0, enemy.divideRange);
                if (range < 0) {
                    range -= enemy.divideMin;
                } else {
                    range += enemy.divideMin;
                }
                let actualDivideRange = range * windowSize.width / 1920;
                let divideX = currPos.left + actualDivideRange;
                let divideY = currPos.top + actualDivideRange;

                divideX += enemy.jquery.width()/2;
                divideY += enemy.jquery.height()/2;


                let hpLost = enemy.maxHp - enemy.hp;

                let clone = new EnemyDivide(enemy.path, true);
                newEnemies.push(clone);
    
                clone.addToScene();
                clone.pause();
                if (hpLost) clone.modifyHp(-hpLost);
                clone.jquery.css({...currPos});
                clone.nextPath = enemy.nextPath;
                clone.moveTo(divideX, divideY, false, function() {
                    clone.resume();
                })
            }
        })
        gameState.enemies = gameState.enemies.concat(newEnemies);
        if (count === 0) {
            let index = gameState.queuedActions.findIndex((action) => {
                return action.id === 'EnemyDivide';
            })
            gameState.queuedActions.splice(index, 1);
        }
    }

    onMount() {
        if (!this.isClone) {
            gameState.queuedActions.push({
                id: 'EnemyDivide',
                waitTime: this.divideTime,
                queuedAt: new Date().getTime(),
                callback: () => EnemyDivide.divide(),
                loop: true
            })
        }
    }
}