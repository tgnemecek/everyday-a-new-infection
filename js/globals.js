const mainMenu = $('.main-menu');
const game = $('.game');
const fps = 60;
let windowSize = {};
let gameState;

class GameState {
    constructor(levelIndex) {
        this.levelIndex = levelIndex
        this.inGameTime = new Date().getTime()
        this.hud = new HUD()
        this.encyclopedia = undefined
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
                    [
                        {type: EnemySmall, quantity: 10, waitTime: 5000},
                        {type: EnemySmall, quantity: 10, waitTime: 5000},
                        {type: EnemyBig, quantity: 2, waitTime: 5000},
                    ],
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
            this.gameOver();
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
    reset() {
        startGame(this.levelIndex);
    }
    exit() {
        startMainMenu();
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
    gameOver() {
        this.hp = 0;
        this.pause();
        let container = new $(`<div class="game-over"><h2>Game Over!</h2></div>`);
        let buttons = new $(`<div class="buttons"></div>`);
        let exit = new $(`<button>Exit</button>`);
        let restart = new $(`<button>Restart</button>`);
        container.append(buttons);
        buttons.append(exit);
        buttons.append(restart);
        exit.on('click', () => this.exit());
        restart.on('click', () => this.reset());
        let gameOver = new ModalBox(container);
        game.append(gameOver.jquery);
    }
    setup() {
        let levelData = this.getLevelData();
        this.waves = levelData.waves;

        game.append($(`<img src="${levelData.image}" class="background"></img>`));
        game.append(this.hud.jquery);
        this.encyclopedia = new Encyclopedia(this.getLevelData());
        game.append(this.encyclopedia.jquery);
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
        this.modifyHp(1000);
        this.modifyMoney(300);
        this.spawnWave();
    }
}

function startGame(levelIndex) {
    game.children().remove();
    console.log(levelIndex);
    gameState = new GameState(levelIndex);
}
function startMainMenu() {
    game.children().remove();
    game.hide();
    mainMenu.show();

    let startGameButton = $(`.main-menu .start-game`);
    startGameButton.on('click', () => {
        mainMenu.hide();
        game.show();
        startGame(0);
    })
}
function resizeGameArea() {
    let wrapper = $('.wrapper');
    let widthToHeight = 16 / 9;
    let newWidth = window.innerWidth;
    let newHeight = window.innerHeight;
    let newWidthToHeight = newWidth / newHeight;
    
    if (newWidthToHeight > widthToHeight) {
        newWidth = newHeight * widthToHeight;
        wrapper.css({
            width: newWidth + 'px',
            height: newHeight + 'px'
        })
    } else {
        newHeight = newWidth / widthToHeight;
        wrapper.css({
            width: newWidth + 'px',
            height: newHeight + 'px'
        })
    }

    wrapper.css({
        marginTop: (-newHeight / 2) + 'px',
        marginLeft: (-newWidth / 2) + 'px'
    })

    game.css({
        width: newWidth,
        height: newHeight
    })
    if (gameState) {
        gameState.enemies.forEach((enemy) => {
            enemy.onResize(newWidth, newHeight);
        })
        gameState.nodes.forEach((node) => {
            node.onResize(newWidth);
        })
        gameState.towers.forEach((tower) => {
            tower.onResize(newWidth);
        })
        gameState.projectiles.forEach((projectile) => {
            projectile.onResize(newWidth, newHeight);
        })
    }
    windowSize = {
        width: newWidth,
        height: newHeight,
    }
}

function onPageLoad() {
    $(window).resize(resizeGameArea);
    $(window).on('resize', resizeGameArea);
    windowSize = {
        width: window.innerWidth,
        height: window.innerHeight,
    }
    resizeGameArea();
    startMainMenu();
}

onPageLoad();