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
        this.jquery = new $(`<div id=${this.id}></div>`);
        this.moveSpeed = 0.2;
        this.path = path;
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
        $(`#${this.id}`).remove();
    }
    
    setup() {
        this.jquery.addClass('enemy');
        this.jquery.css(this.style);
        this.followPath(1);
    }
}

class Projectile {
    constructor(originX, originY, enemy) {
        this.jquery = new $(`<div>P</div>`);
        this.style = {
            top: originY,
            left: originX
        }
        this.enemy = enemy;
        this.moveSpeed = 0.05;
        this.setup();
    }
    moveToTarget() {
        let currX = convertFromPx(this.jquery.css('left'));
        let currY = convertFromPx(this.jquery.css('top'));
        let enX = convertFromPx($(this.enemy.jquery).css('left'));
        let enY = convertFromPx($(this.enemy.jquery).css('top'));
        let distance = distanceTo(currX, currY, enX, enY);
        let duration = distance / this.moveSpeed;
        this.jquery.animate({
            left: enX,
            top: enY
        }, {
            duration,
            easing: "linear",
            complete: () => console.log('done!')
        })
    }
    setup() {
        this.jquery.addClass('projectile');
        this.jquery.css(this.style);
        this.moveToTarget();
    }
}

class Tower {
    constructor() {
        this.jquery = new $(`<div>T</div>`);
        console.log(this.jquery);
        this.attackSpeed = 200;
        this.range = 100;
        this.canAttack = true;
        this.setup();
    }
    setup() {
        this.jquery.addClass('tower');
    }
    update() {
        if (this.canAttack) {
            gameState.enemies.forEach((enemy) => {
                let enX = convertFromPx($(enemy.jquery).css('left'));
                let enY = convertFromPx($(enemy.jquery).css('top'));
                let x = convertFromPx(this.jquery.css('left'));
                let y = convertFromPx(this.jquery.css('top'));
                let distance = distanceTo(x, y, enX, enY);
                if (distance < this.range) {
                    let projectile = new Projectile(x, y, enemy);
                    game.append(projectile.jquery);
                    gameState.projectiles.push(projectile);
                    this.canAttack = false;
                    setTimeout(() => {
                        this.canAttack = true;
                    }, this.attackSpeed)
                }

            })
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
        let tower = new Tower();
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