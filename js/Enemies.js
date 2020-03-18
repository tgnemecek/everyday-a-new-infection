class Enemy {
    constructor(path) {
        this.id = new Date().getTime();
        this.jquery = new $(`<div class="enemy"></div>`);
        this.sprite = new $(`<div class="sprite"></div>`);
        this.hpBar = new $(`<div class="hp-bar"><div></div><div></div></div>`);
        this.beingSlowedDown = false;
        
        this.width = 0.03;
        this.height = 0.03;
        this.moveSpeed = 50;
        this.maxHp = 50;
        this.money = 10;

        this.hp = this.maxHp;
        this.path = path;
        this.percentWalked = 0;
        this.nextPath = 1;
        this.isAlive = true;
        this.animation = undefined;
        this.spriteAnimation = undefined;
        this.style = {
            top: this.randomizePosition($(this.path[0]).position().top, 100),
            left: this.randomizePosition($(this.path[0]).position().left, 100),
            filter: `brightness(${tools.randomize(1, 0.2)}) hue-rotate(${tools.randomize(1, 50)}deg)`,
        }
        // this.setup();
    }

    randomizePosition(value, range) {
        let factor = windowSize.width / 1920;
        return tools.randomize(value, range * factor);
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
            this.sprite.css({
                filter: `hue-rotate(90deg)`
            })
            this.followPath();
        }
    }

    regularSpeed() {
        if (this.beingSlowedDown) {
            this.jquery.stop();
            this.beingSlowedDown = false;
            this.sprite.css({
                filter: this.style.filter
            })
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
        x = this.randomizePosition(x, 100);
        y = this.randomizePosition(y, 100);

        let currPos = this.jquery.position();
        let currX = currPos.left;
        let currY = currPos.top;
        let distance = tools.distanceTo(x, y, currX, currY);
        let duration = (distance * 500000 / windowSize.width) / this.moveSpeed;
        if (this.beingSlowedDown) duration = duration * 2;
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
        gameState.modifyHp(-10);
        gameState.removeEnemy(this.id);
        this.jquery.remove();
    }

    setup() {
        game.append(this.jquery);
        this.jquery.append(this.hpBar);
        this.jquery.append(this.sprite);
        this.jquery.css(this.style);
        // this.sprite.css({
        //     backgroundColor: tools.getRandomizedColor(217, 59, 59)
        // });
        this.sprite.height(this.height * windowSize.width);
        this.sprite.width(this.width * windowSize.width);
        this.spriteAnimation = tools.addSpriteAnimation(
            this.sprite,
            this.constructor.image,
            5,
            0.4
        )
        this.followPath();
    }
}

class EnemySmall extends Enemy {
    constructor(path) {
        super(path);
        this.setup();
    }
    static name = "Cold Virus";
    static description = "Really common and fast, but easy to treat.";
    static image = "images/cold-virus.png";
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