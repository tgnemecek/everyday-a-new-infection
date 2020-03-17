class Enemy {
    constructor(path) {
        this.id = new Date().getTime();
        this.jquery = new $(`<div class="enemy"></div>`);
        this.sprite = new $(`<div class="sprite"></div>`);
        this.hpBar = new $(`<div class="hp-bar"><div></div><div></div></div>`);
        this.beingSlowedDown = false;
        
        this.width = 0.008;
        this.height = 0.008;
        this.moveSpeed = 50;
        this.maxHp = 50;
        this.money = 10;
        
        this.hp = this.maxHp;
        this.path = path;
        this.percentWalked = 0;
        this.nextPath = 1;
        this.isAlive = true;
        this.animation = undefined;
        this.random = randomize(1, 30);
        this.style = {
            top: Number($(this.path[0]).css('top').replace("px", "")) + this.random,
            left: Number($(this.path[0]).css('left').replace("px", "")) + this.random,
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
            gameState.modifyMoney(this.money);
            gameState.removeEnemy(this.id);
            this.isAlive = false;
            $(this.jquery).remove();
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
        this.followPath();
    }

    moveTo(x, y) {
        x = x + this.random;
        y = y + this.random;

        let currPos = this.jquery.position();
        let currX = currPos.left;
        let currY = currPos.top;
        let distance = distanceTo(x, y, currX, currY);
        let duration = (distance * 500000 / windowSize.width) / this.moveSpeed;
        if (this.beingSlowedDown) duration = duration * 2;
        console.log(duration);
        this.jquery.animate({
            left: x,
            top: y
        }, {
            duration,
            easing: "linear",
            start: (an) => this.animation = an,
            progress: (an, prog, remaining) => {
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

        let x = Number($(this.path[this.nextPath]).css('left').replace("px", ""));
        let y = Number($(this.path[this.nextPath]).css('top').replace("px", ""));


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
        this.sprite.height(this.height * windowSize.width);
        this.sprite.width(this.width * windowSize.width);
        this.followPath();
    }
}

class EnemySmall extends Enemy {
    constructor(path) {
        super(path);
        this.setup();
    }
    static name = "Small Enemy";
    static description = "Fast but weak.";
}

class EnemyBig extends Enemy {
    constructor(path) {
        super(path);
        this.height = 0.016;
        this.width = 0.016;
        this.setup();
    }
    static name = "Big Enemy";
    static description = "Hard to kill but slow.";
}