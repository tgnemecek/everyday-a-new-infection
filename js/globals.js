const game = $('.game');
const fps = 60;

const gameState = {
    enemies: [],
    nodes: [],
    towers: [],
    projectiles: [],
    hp: 0,
    modifyHp: function (amount) {
        gameState.hp += amount;
        if (gameState.hp <= 0) {
            gameState.hp = 0;
            gameState.pause();
        }
        $('.hp').text("HP: " + gameState.hp);
    },
    money: 0,
    modifyMoney: function (amount) {
        gameState.money += amount;
        $('.money').text("MONEY: " + gameState.money)
    },
    isPaused: false,
    pause: function() {
        gameState.isPaused = true;
        gameState.enemies.forEach((enemy) => {
            enemy.pause();
        })
        gameState.towers.forEach((tower) => {
            tower.pause();
        })
        gameState.projectiles.forEach((projectile) => {
            projectile.pause();
        })
        gameState.nodes.forEach((node) => {
            node.pause();
        })
    },
    resume: function() {
        gameState.isPaused = false;
        gameState.enemies.forEach((enemy) => {
            enemy.resume();
        })
        gameState.towers.forEach((tower) => {
            tower.resume();
        })
        gameState.projectiles.forEach((projectile) => {
            projectile.resume();
        })
        gameState.nodes.forEach((node) => {
            node.resume();
        })
    },
    currentWave: 0,
    waves: [
        [
            {type: EnemySmall, quantity: 3, waitTime: 5000},
            {type: EnemySmall, quantity: 5, waitTime: 5000},
            {type: EnemyBig, quantity: 2, waitTime: 5000},
        ]
    ]
}

function setupNodes() {
    let nodePositions = [
        { left: "10%", top: "10%"},
        { left: "80%", top: "20%"},
        { left: "50%", top: "50%"},
    ]
    nodePositions.forEach((position) => {
        let node = new Node(position);
        gameState.nodes.push(node);
    })
}


function enemySpawner(Type, numberOfEnemies, waitTime) {
    return new Promise((resolve, reject) => {
        const path = $('.path');
        for (let i = 0; i < numberOfEnemies; i++) {
            let enemy = new Type(path);
            gameState.enemies.push(enemy);
        }
        setTimeout(() => {
            resolve();
        }, waitTime)
    })
}

async function spawnWave() {
    let currentWave = gameState.currentWave;
    let enemies = [...gameState.waves[currentWave]];

    for (let i = 0; i < enemies.length; i++) {
        await enemySpawner(
            enemies[i].type,
            enemies[i].quantity,
            enemies[i].waitTime
        );
    }
}

// function update() {
//     setInterval(() => {
//         if (!gameState.enemies.length) {
//             // spawnWave();
//             // if (gameState.currentWave < gameState.waves.length) {
//             //     gameState.currentWave++;
//             // }
//         }
//     }, fps);
// }

function setupPause() {
    let overlay = new Overlay();
    $('.pause').on('click', function() {
        if (!gameState.isPaused) {
            gameState.pause();
            game.append(overlay.jquery);
            $(this).text('RESUME');
        } else {
            gameState.resume();
            overlay.jquery.remove();
            $(this).text('PAUSE');
        }
    });
}

function start() {
    gameState.modifyHp(100);
    gameState.modifyMoney(300);
    setupPause();

    setupNodes();
    // update();
    // setInterval(() => {
    //     gameState.pause();
    // }, 2000);
    // setInterval(() => {
    //     gameState.resume();
    // }, 5000);
    // enemySpawner(Enemy, 1, path);
    spawnWave()
}

start();

