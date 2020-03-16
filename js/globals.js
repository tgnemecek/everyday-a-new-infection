const game = $('.game');
const fps = 60;

let gameState = {
    inGameTime: new Date().getTime(),
    queuedActions: [],
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
            let gameOver = new GameOver();
        }
        $('.hp').text("HP: " + gameState.hp);
    },
    money: 0,
    modifyMoney: function (amount) {
        gameState.money += amount;
        $('.money').text("MONEY: " + gameState.money)
    },
    lastPaused: undefined,
    totalPaused: 0,
    isPaused: false,
    pause: function() {
        gameState.lastPaused = new Date(),
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
            {type: EnemySmall, quantity: 10, waitTime: 5000},
            {type: EnemySmall, quantity: 10, waitTime: 5000},
            {type: EnemyBig, quantity: 2, waitTime: 5000},
        ]
    ]
}
const initGameObjects = game.children().clone();

function setupNodes() {
    let nodePositions = [
        { left: "21%", top: "35%"},
        { left: "45%", top: "35%"},
        { left: "66%", top: "65%"},
        { left: "18%", top: "85%"},
    ]
    nodePositions.forEach((position) => {
        let node = new Node(position);
        gameState.nodes.push(node);
    })
}

function setupPath() {
    let pathPositions = [
        { left: "80%", top: "-15%"},
        { left: "80%", top: "85%"},
        { left: "60%", top: "85%"},
        { left: "60%", top: "20%"},
        { left: "12%", top: "20%"},
        { left: "12%", top: "80%"},
        { left: "0%", top: "100%"},
    ]
    pathPositions.forEach((pathPosition) => {
        let path = new $(`<div class="path"></div>`);
        game.append(path);
        path.css(pathPosition);
    })
}

function enemySpawner(Type, numberOfEnemies, waitTime) {
    return new Promise((resolve, reject) => {
        const path = $('.path');
        for (let i = 0; i < numberOfEnemies; i++) {
            let enemy = new Type(path);
            gameState.enemies.push(enemy);
        }
        gameState.queuedActions.push({
            queuedAt: gameState.inGameTime,
            waitTime,
            callback: () => resolve()
        })
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

function startInGameTime() {
    setInterval(() => {
        let now = new Date().getTime();
        if (!gameState.isPaused) {
            if (gameState.lastPaused) {
                gameState.totalPaused += now - gameState.lastPaused;
                gameState.lastPaused = undefined;
            }
            gameState.inGameTime = now - gameState.totalPaused;
            gameState.queuedActions = gameState.queuedActions
            .filter((action) => {
                if (action.queuedAt + action.waitTime <= gameState.inGameTime) {
                    console.log(action.queuedAt, action.waitTime, gameState.inGameTime);
                    action.callback();
                    return false;
                } else return true;
            })
        } else {
            if (!gameState.lastPaused) gameState.lastPaused = new Date().getTime();
        }
    }, 1);
}

function setupPause() {
    let overlay = new $(`<div class="overlay"></div>`);
    $('.pause').on('click', function() {
        if (!gameState.isPaused) {
            gameState.pause();
            game.append(overlay);
            $(this).text('RESUME');
        } else {
            gameState.resume();
            overlay.remove();
            $(this).text('PAUSE');
        }
    });
}

function reset() {
    gameState = {
        ...gameState,
        hp: 0,
        money: 0,
        enemies: [],
        nodes: [],
        towers: [],
        projectiles: [],
        isPaused: false,
        currentWave: 0
    }
    game.children().remove();
    game.append(initGameObjects);
    start();
}

function start() {
    gameState.modifyHp(100);
    gameState.modifyMoney(300);
    startInGameTime();
    setupPause();

    setupNodes();
    setupPath();
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


