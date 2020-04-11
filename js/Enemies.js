class Enemy {
    constructor(path) {
        this.id = new Date().getTime();
        this.jquery = new $(`<div class="enemy"></div>`);
        this.sprite = new $(`<div class="sprite"></div>`);
        this.hpBar = new $(`
            <div class="hp-bar">
                <div class="content">
                    <div class="green"></div>
                    <div class="red"></div>
                </div>
            </div>
        `);
        this.beingSlowedDown = 0;
        
        this.width = 0.06;
        this.height = 0.06;
        this.moveSpeed = 100; // debugger Change back to 40!
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
        this.randomRange = 0; // debugger Change back to 100
        this.lastRandomX = 1;
        this.lastRandomY = 1;
        this.isAlive = true;
        this.animation = undefined;
        this.spriteAnimation = undefined;
        this.regularSpeedFilter = undefined;
        this.lastIntersection = undefined
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
        this.hpBar.children('.content').css({
            gridTemplateColumns: `${percentLeft}% ${percentLost}%`,
            visibility: "inherit"
        })

        if (this.hp <= 0) this.die();
    }

    die() {
        if (!this.isAlive) return;
        this.hp = 0;
        gameState.modifyMoney(this.money);
        this.isAlive = false;
        this.hpBar.remove();
        this.jquery.stop();
        this.rotation.stop();

        this.setSize();

        let size = this.deathImages.length;
        let chosenIndex = Math.floor(Math.random() * size);
        let chosenImage = this.deathImages[chosenIndex];

        this.sprite.css({
            backgroundImage: `url(${chosenImage})`,
            position: "relative"
        })
        tools.addSpriteAnimation(
            this.sprite,
            6,
            0.3,
            "1 normal forwards"
        )
        
        audioManager.play('audioEnemyDeath');
        
        gameState.checkForNextWave();

        gameState.queuedActions.push({
            waitTime: this.waitToRemove,
            queuedAt: new Date().getTime(),
            callback: () => {
                this.sprite.animate({opacity: 0}, {
                    duration: this.fadeOutTime,
                    complete: () => {
                        gameState.removeEnemy(this.id);
                        $(this.jquery).remove();
                    }
                })
            }
        })
    }

    slowDown() {
        if (!this.isAlive) return;
        this.beingSlowedDown++;
        // console.log('slowed', this.beingSlowedDown);
        let stickyLen = gameState.towers.filter((tower) => tower instanceof TowerSticky).length;

        if (this.beingSlowedDown > stickyLen) this.beingSlowedDown = stickyLen;

        if (this.beingSlowedDown === 1) {
            this.sprite.css({
                filter: `hue-rotate(90deg)`
            })
        }
        this.jquery.stop();
        this.followPath({keepLastRandom: true});
    }

    regularSpeed() {
        if (!this.isAlive) return;
        this.beingSlowedDown--;
        // console.log('regular', this.beingSlowedDown);

        // if (this.beingSlowedDown < 0) this.beingSlowedDown = 0;

        if (this.beingSlowedDown === 0) {
            this.sprite.css({
                filter: this.regularSpeedFilter
            })
        }
        this.jquery.stop();
        this.followPath({keepLastRandom: true});
    }

    setSize(screenWidth) {
        screenWidth = screenWidth || windowSize.width;
        this.sprite.height(this.height * screenWidth * windowSize.zoom);
        this.sprite.width(this.width * screenWidth * windowSize.zoom);
    }

    onResize(newWidth, newHeight) {
        let pos = this.jquery.position();
        let xCurRatio = (pos.left / windowSize.width);
        let xNewPos = newWidth * xCurRatio;
        let yCurRatio = (pos.top / windowSize.height);
        let yNewPos = newHeight * yCurRatio;

        this.jquery.stop();
        this.setSize(newWidth);
        this.jquery.css({
            left: xNewPos,
            top: yNewPos
        })
        if (!gameState.isPaused && this.isAlive) {
            this.followPath({keepLastRandom: true});
        }
    }

    queueSlowDown(destinationX, destinationY, duration) {
        if (this.nextPath < 2) return;
        // this.count = this.count || 0;
        // this.count++;
        // console.log(this.count);
        // if (this.count === 3) debugger;

        let towers = gameState.towers;
        let pos = this.jquery.position();
        let currX = pos.left + this.jquery.width()/2;
        let currY = pos.top + this.jquery.height()/2;
        destinationX += this.jquery.width()/2;
        destinationY += this.jquery.height()/2;

        let possibleActions = [];

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
                        
                        let d = new $('<div><div>');
                        d.css({
                            width: 5,
                            height: 5,
                            backgroundColor: 'black',
                            zIndex: 99999,
                            position: 'absolute',
                            top: inter.y,
                            left: inter.x
                        })
                        game.append(d);

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
                            distanceFromInterToEnd,
                            x: inter.x,
                            y: inter.y,
                            towerId: tower.id
                        };
                    });

                    if (intersInsideLine === 2) {
                        let closer;
                        if (durations[0].durationToInter < durations[1].durationToInter) {
                            closer = durations[0];
                        } else {
                            closer = durations[1];
                        }
                        possibleActions.push({
                            waitTime: closer.durationToInter,
                            x: closer.x,
                            y: closer.y,
                            towerId: closer.towerId,
                            queuedAt: new Date().getTime(),
                            loop: false,
                            callback: this.slowDown.bind(this)
                        })

                    } else if (intersInsideLine === 1) {
                        let outsider = durations[0].isInsideLine ? durations[1] : durations[0];
                        let insider = outsider === durations[0] ? durations[1] : durations[0];

                        let callback;

                        if (outsider.distanceFromInterToEnd > outsider.distanceToInter) {
                            callback = this.regularSpeed.bind(this)
                        } else callback = this.slowDown.bind(this)

                        possibleActions.push({
                            waitTime: insider.durationToInter,
                            x: insider.x,
                            y: insider.y,
                            towerId: insider.towerId,
                            queuedAt: new Date().getTime(),
                            loop: false,
                            callback
                        })
                    }
                }
            }
        })

        // possibleActions = possibleActions.filter((action) => {
        //     if (this.count === 3) debugger;
        //     if (!this.lastIntersection) return true;
        //     if (Math.abs(action.x - this.lastIntersection.x) < 2
        //         && Math.abs(action.y - this.lastIntersection.y) < 2) {
        //             if (action.towerId === this.lastIntersection.towerId) {
        //                 return false;
        //             }
        //     }
        //     return true;
        // });

        if (!possibleActions.length) return;

        let delay = 10;

        let nextAction = possibleActions.reduce((acc, cur) => {
            if (!acc) return cur;
            if (cur.waitTime < acc.waitTime) {
                return cur;
            } else return acc;
        })

        this.lastIntersection = {
            x: nextAction.x,
            y: nextAction.y,
            towerId: nextAction.towerId
        }
        delete nextAction.x;
        delete nextAction.y;
        delete nextAction.towerId;
        // gameState.queuedActions.push({
        //     ...nextAction,
        //     waitTime: nextAction.waitTime + delay
        // });
        setTimeout(() => {
            nextAction.callback()
        }, nextAction.waitTime + delay)
    }

    moveTo(x, y, {keepLastRandom = false, callback, skipSpeedChange = false}) {
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
        let currX = currPos.left + this.jquery.width()/2;
        let currY = currPos.top + this.jquery.height()/2;
        let distance = tools.distanceTo(x, y, currX, currY);
        let duration = (distance * 500000 / windowSize.width) / this.moveSpeed;
        if (this.beingSlowedDown) duration = duration * 2;

        if (!skipSpeedChange) this.queueSlowDown(x, y, duration);

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

    followPath(options) {
        let lastIndex = this.path.length - 1;
        if (this.nextPath > lastIndex) {
            this.arrived();
            return;
        };

        let x = $(this.path[this.nextPath]).position().left;
        let y = $(this.path[this.nextPath]).position().top;

        this.moveTo(x, y, options)
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

        this.randomRange = this.randomRange * windowSize.zoom;

        let speedRange = this.moveSpeed * 0.1;
        this.moveSpeed = tools.randomize(this.moveSpeed * windowSize.zoom, speedRange);

        let factor = windowSize.width / 1920;
        let randX = tools.randomize(0, this.randomRange * factor);
        let randY = tools.randomize(0, this.randomRange * factor);

        this.jquery.css({
            top: $(this.path[0]).position().top + randX,
            left: $(this.path[0]).position().left + randY,
        });

        this.sprite.css({
            backgroundSize: `50%`,
            backgroundImage: `url(${this.constructor.image()})`,
            backgroundPosition: 'center',
            backgroundRepeat: "no-repeat",
            filter: `brightness(${tools.randomize(1, 0.2)})
                    hue-rotate(${tools.randomize(this.constructor.baseHue(), 40)}deg)`,
        });
        this.regularSpeedFilter = this.sprite.css('filter');
        let randDirection = Math.round(Math.random());
        this.rotation = tools.addRotationLoop(
            this.sprite,
            1/this.rotationSpeed,
            randDirection ? "normal" : "reverse"
        );
        this.setSize();
        
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
        this.height = 0.12;
        this.width = 0.12;
        this.rotationSpeed = 0.4;
        this.maxHp = 400;
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
        this.height = 0.15;
        this.width = 0.15;
        this.maxHp = 120;
        // this.moveSpeed = 25;
        this.deathImages = ["images/covid-death.png"];
        this.waitToRemove = 1000;
        this.fadeOutTime = 1;
        this.divideTime = 5000;
        this.divideMin = 20;
        this.divideRange = 10;
    }
    static name() { return "COVID-19" }
    static description() { return "We've never seen this before. Good luck, I guess..." }
    static image() { return "images/covid.png" }
    static baseHue() { return 0 }

    divide() {
        if (gameState.gameFrozen) return;
        if (!this.isAlive) {
            gameState.queuedActions = gameState.queuedActions.filter((action) => {
                return action.id !== this.id
            });
            return;
        }

        let maxDivisions = 32;

        let count = gameState.enemies.reduce((acc, cur) => {
            if (cur instanceof EnemyDivide && cur.isAlive) {
                return acc + 1;
            } else return acc;
        }, 0)

        if (count >= maxDivisions) return;

        let currPos = this.jquery.position();
        let range = tools.randomize(0, this.divideRange);
        if (range < 0) {
            range -= this.divideMin;
        } else {
            range += this.divideMin;
        }
        let actualDivideRange = range * windowSize.width * windowSize.zoom / 1920;
        let divideX = currPos.left + actualDivideRange;
        let divideY = currPos.top + actualDivideRange;

        divideX += this.jquery.width()/2;
        divideY += this.jquery.height()/2;

        let hpLost = this.maxHp - this.hp;

        let clone = new EnemyDivide(this.path, true);
        
        clone.addToScene();
        clone.pause();
        if (hpLost) clone.modifyHp(-hpLost);
        clone.jquery.css({...currPos});
        clone.nextPath = this.nextPath;
        clone.moveTo(divideX, divideY, {callback: clone.resume})
        gameState.enemies.push(clone);
    }

    onMount() {
        let minTime = 1000;
        let maxTime = 8000;

        let time = (Math.random() * (maxTime - minTime)) + minTime;

        gameState.queuedActions.push({
            id: this.id,
            waitTime: time,
            queuedAt: new Date().getTime(),
            callback: () => this.divide(),
            loop: true
        })
    }
}