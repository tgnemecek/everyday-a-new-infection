let game = $('.game');
let mover = $('.mover');
let path = $('.path');
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

function enemySpawner(numberOfEnemies) {
    for (let i = 0; i < numberOfEnemies; i++) {
        let enemy = new Enemy(path);
        gameState.enemies.push(enemy);
    }
}

function setupNodes() {
    let nodes = $('.node');
    nodes.on('click', function() {
        // Create Tower
        if (!$(this).children().length) {
            let tower = new Tower($(this));
            // $(this).append(tower.jquery);
            gameState.towers.push(tower);
        }

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
    enemySpawner(10);
    update(60)
}

start();