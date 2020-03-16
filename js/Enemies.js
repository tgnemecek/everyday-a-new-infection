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
            top: randomize($(this.path[0]).position().top, 30),
            left: randomize($(this.path[0]).position().left, 30),
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