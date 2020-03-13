let game = $('.game');
let mover = $('.mover');
let path = $('.path').children();
let hpDisplayer = $('.hp');
let moneyDisplayer = $('.money');

let gameState = {
    enemies: [],
    towers: [],
    projectiles: [],
    hp: 0,
    modifyHp: function(amount) {
        gameState.hp += amount;
        hpDisplayer.text("HP: " + gameState.hp);
    },
    money: 0,
    modifyMoney: function(amount) {
        gameState.money += amount;
        moneyDisplayer.text("MONEY: " + gameState.money)
    }
}

function convertFromPx(str) {
    str = str.replace("px", "");
    return Number(str);
}

function randomize(input, range) {
    let random = Math.floor(Math.random() * range) - range/2;
    return input + random;
}

function getRandomizedColor(r, g, b) {
    r = randomize(r, 80);
    g = randomize(g, 80);
    b = randomize(b, 80);
    return `rgb(${r}, ${g}, ${b})`
}

function distanceTo(x1, y1, x2, y2) {
    let disX = x1 - x2;
    let disY = y1 - y2;
    return Math.sqrt(disX * disX + disY * disY);
}

class Enemy {
    constructor(path) {
        this.id = new Date().getTime();
        this.jquery = new $(`<div></div>`);
        this.moveSpeed = 0.05;
        this.path = path;
        this.percentWalked = 0;
        this.style = {
            top: randomize(convertFromPx($(this.path[0]).css('top')), 30),
            left: randomize(convertFromPx($(this.path[0]).css('left')), 30),
            backgroundColor: getRandomizedColor(217, 59, 59)
        }
        this.setup();
    }

    moveTo(x, y, i) {
        x = randomize(x, 30);
        y = randomize(y, 30);

        let currX = convertFromPx(this.jquery.css('left'));
        let currY = convertFromPx(this.jquery.css('top'));
        let distance = distanceTo(x, y, currX, currY);
        let duration = distance / this.moveSpeed;
        this.jquery.animate({
            left: x,
            top: y
        }, {
            duration,
            easing: "linear",
            progress: (an, prog, remaining) => this.percentWalked = prog,
            complete: () => this.followPath(i+1)
        })
    }

    followPath(i) {
        let lastIndex = this.path.length-1;
        if (i > lastIndex) {
            this.arrived();
            return;
        };
        let x = convertFromPx($(this.path[i]).css('left'));
        let y = convertFromPx($(this.path[i]).css('top'));       
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
        this.jquery.addClass('enemy');
        this.jquery.css(this.style);
        this.followPath(1);
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
        this.moveSpeed = 0.8;
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
        console.log('distance: ' + distance);
        console.log('duration: ' + duration);
        this.jquery.animate({
            left: enX,
            top: enY
        }, {
            duration,
            easing: "linear",
            // step: (now, fx) => {
            //     if (!this.animationEnded) {
            //         let newEnCoord = this.enemy.jquery.position()[fx.prop];
            //         fx.end = newEnCoord;
            //     }
            // },
            // complete: () => this.hit()
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
        this.jquery.addClass('projectile');
        this.jquery.css(this.style);
        this.moveToTarget();
    }
}

class Tower {
    constructor(nodePosition) {
        this.jquery = new $(`<div>T</div>`);
        this.nodePosition = nodePosition;
        this.attackSpeed = 2000;
        this.range = 100;
        this.canAttack = true;
        this.setup();
    }
    setup() {
        this.jquery.addClass('tower');
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
                game.append(projectile.jquery);
                gameState.projectiles.push(projectile);
                this.canAttack = false;
                setTimeout(() => {
                    this.canAttack = true;
                }, this.attackSpeed)
            }
        }
    }
}

function enemySpawner(numberOfEnemies) {
    for (let i = 0; i < numberOfEnemies; i++) {
        let enemy = new Enemy(path);
        game.append(enemy.jquery);
        gameState.enemies.push(enemy);
    }
}

function setupNodes() {
    let nodes = $('.node');
    nodes.on('click', function() {
        // Create Tower
        let tower = new Tower($(this).position());
        $(this).append(tower.jquery);
        gameState.towers.push(tower);
    })
}

function update(rate) {
    setInterval(() => {
        gameState.towers.forEach((tower) => {
            tower.update();
        })
    }, rate)
}

function start() {
    gameState.modifyHp(100);
    gameState.modifyMoney(300);
    setupNodes();
    enemySpawner(1);
    update(60)
}

start();