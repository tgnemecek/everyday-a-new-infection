const game = $('.game');
const fps = 60;
let gameState;

class GameState {
    constructor(levelIndex) {
        this.levelIndex = levelIndex
        this.inGameTime = new Date().getTime()
        this.hud = new HUD()
        this.queuedActions = []
        this.enemies = []
        this.nodes = []
        this.towers = []
        this.projectiles = []
        this.hp = 0
        this.money = 0
        this.lastPaused = undefined
        this.totalPaused = 0
        this.isPaused = false
        this.currentWave = -1
        this.waves = []
        this.setup()
    }
    getLevelData() {
        let levels = [
            {
                image: "background.jpg",
                nodes: [
                    { left: "21%", top: "35%"},
                    { left: "45%", top: "35%"},
                    { left: "66%", top: "65%"},
                    { left: "18%", top: "85%"},
                ],
                path: [
                    { left: "80%", top: "-15%"},
                    { left: "80%", top: "85%"},
                    { left: "60%", top: "85%"},
                    { left: "60%", top: "20%"},
                    { left: "12%", top: "20%"},
                    { left: "12%", top: "80%"},
                    { left: "0%", top: "100%"},
                ],
                waves: [
                    // [
                    //     {type: EnemySmall, quantity: 10, waitTime: 5000},
                    //     {type: EnemySmall, quantity: 10, waitTime: 5000},
                    //     {type: EnemyBig, quantity: 2, waitTime: 5000},
                    // ],
                    [
                        {type: EnemyBig, quantity: 1, waitTime: 5000},
                    ]
                ]
            }
        ]
        return levels[this.levelIndex];
    }
    async spawnWave() {
        this.nextWave();
        let enemies = [...this.waves[this.currentWave]];
    
        for (let i = 0; i < enemies.length; i++) {
            await this.enemySpawner(
                enemies[i].type,
                enemies[i].quantity,
                enemies[i].waitTime
            );
        }
    }
    enemySpawner(Type, numberOfEnemies, waitTime) {
        return new Promise((resolve, reject) => {
            const path = $('.path');
            for (let i = 0; i < numberOfEnemies; i++) {
                let enemy = new Type(path);
                this.enemies.push(enemy);
            }
            this.queuedActions.push({
                queuedAt: this.inGameTime,
                waitTime,
                callback: () => resolve()
            })
        })
    }
    startInGameTime() {
        setInterval(() => {
            let now = new Date().getTime();
            if (!this.isPaused) {
                if (this.lastPaused) {
                    this.totalPaused += now - this.lastPaused;
                    this.lastPaused = undefined;
                }
                this.inGameTime = now - this.totalPaused;
                this.queuedActions = this.queuedActions
                .filter((action) => {
                    if (action.queuedAt + action.waitTime <= this.inGameTime) {
                        action.callback();
                        return false;
                    } else return true;
                })
            } else {
                if (!this.lastPaused) this.lastPaused = new Date().getTime();
            }
        }, 1);
    }
    modifyHp(amount) {
        this.hp += amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.pause();
            let gameOver = new GameOver();
        }
        this.hud.jquery.children('.hp').text("HP: " + this.hp);
    }
    modifyMoney(amount) {
        this.money += amount;
        this.hud.jquery.children('.money').text("MONEY: " + this.money);
    }
    removeEnemy(id) {
        let enIndex = this.enemies
        .findIndex((enemy) => {
            return enemy.id === id;
        })
        this.enemies.splice(enIndex, 1);
        if (!this.enemies.length) this.nextWave();
    }
    pause() {
        this.lastPaused = new Date(),
        this.isPaused = true;
        this.enemies.forEach((enemy) => {
            enemy.pause();
        })
        this.towers.forEach((tower) => {
            tower.pause();
        })
        this.projectiles.forEach((projectile) => {
            projectile.pause();
        })
        this.nodes.forEach((node) => {
            node.pause();
        })
    }
    resume() {
        this.isPaused = false;
        this.enemies.forEach((enemy) => {
            enemy.resume();
        })
        this.towers.forEach((tower) => {
            tower.resume();
        })
        this.projectiles.forEach((projectile) => {
            projectile.resume();
        })
        this.nodes.forEach((node) => {
            node.resume();
        })
    }
    nextWave() {
        let totalWaves = this.waves.length;
        if (this.currentWave+1 === totalWaves) {
            this.win();
        } else {
            this.currentWave++;
            $('.hud .wave').text(`WAVE: ${this.currentWave+1}/${totalWaves}`);
        }
    }
    win() {
        alert('you win!');
    }
    setup() {
        let levelData = this.getLevelData();
        this.waves = levelData.waves;

        game.append($(`<img src="${levelData.image}" class="background"></img>`));
        game.append(this.hud.jquery);
        levelData.nodes.forEach((position) => {
            let node = new Node(position);
            this.nodes.push(node);
        })
        levelData.path.forEach((pathPosition) => {
            let path = new $(`<div class="path"></div>`);
            game.append(path);
            path.css(pathPosition);
        })
        this.startInGameTime();
        this.modifyHp(100);
        this.modifyMoney(300);
        this.spawnWave();
    }
}



// let gameState = {
//     inGameTime: new Date().getTime(),
//     queuedActions: [],
//     enemies: [],
//     nodes: [],
//     towers: [],
//     projectiles: [],
//     hp: 0,
//     modifyHp: function (amount) {
//         gameState.hp += amount;
//         if (gameState.hp <= 0) {
//             gameState.hp = 0;
//             gameState.pause();
//             let gameOver = new GameOver();
//         }
//         $('.hud .hp').text("HP: " + gameState.hp);
//     },
//     money: 0,
//     modifyMoney: function (amount) {
//         gameState.money += amount;
//         $('.hud .money').text("MONEY: " + gameState.money);
//     },
//     removeEnemy: function(id) {
//         let enIndex = gameState.enemies
//         .findIndex((enemy) => {
//             return enemy.id === id;
//         })
//         gameState.enemies.splice(enIndex, 1);
//         if (!gameState.enemies.length) gameState.nextWave();
//     },
//     lastPaused: undefined,
//     totalPaused: 0,
//     isPaused: false,
//     pause: function() {
//         gameState.lastPaused = new Date(),
//         gameState.isPaused = true;
//         gameState.enemies.forEach((enemy) => {
//             enemy.pause();
//         })
//         gameState.towers.forEach((tower) => {
//             tower.pause();
//         })
//         gameState.projectiles.forEach((projectile) => {
//             projectile.pause();
//         })
//         gameState.nodes.forEach((node) => {
//             node.pause();
//         })
//     },
//     resume: function() {
//         gameState.isPaused = false;
//         gameState.enemies.forEach((enemy) => {
//             enemy.resume();
//         })
//         gameState.towers.forEach((tower) => {
//             tower.resume();
//         })
//         gameState.projectiles.forEach((projectile) => {
//             projectile.resume();
//         })
//         gameState.nodes.forEach((node) => {
//             node.resume();
//         })
//     },
//     nextWave: function() {
//         let totalWaves = gameState.waves.length;
//         if (gameState.currentWave+1 === totalWaves) {
//             gameState.win();
//         } else {
//             gameState.currentWave++;
//             $('.hud .wave').text(`WAVE: ${gameState.currentWave+1}/${totalWaves}`);
//         }
//     },
//     currentWave: -1,
//     win: function() {
//         alert('you win!');
//     }
// }


function reset() {
    let levelIndex = gameState.levelIndex;
    game.children().remove();
    start(levelIndex);
}

function start(levelIndex) {
    gameState = new GameState(levelIndex);
}

start(0);


