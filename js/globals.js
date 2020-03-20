const mainMenu = $('.main-menu');
const game = $('.game');
const fps = 60;
let windowSize = {};
let gameState;

class GameState {
    constructor(levelIndex) {
        this.levelIndex = levelIndex
        this.inGameTime = new Date().getTime()
        this.inGameTimeId = undefined
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
                image: "images/level1.jpg",
                nodes: [
                    { left: "75%", top: "22%"},
                    { left: "19%", top: "40%"},
                    { left: "10%", top: "12%"},
                    { left: "10%", top: "70%"},
                    { left: "75%", top: "65%"},
                ],
                path: [
                    { left: "90%", top: "-15%"},
                    { left: "90%", top: "25%"},
                    { left: "80%", top: "40%"},
                    { left: "65%", top: "40%"},
                    { left: "50%", top: "20%"},
                    { left: "25%", top: "20%"},
                    { left: "15%", top: "30%"},
                    { left: "15%", top: "60%"},
                    { left: "25%", top: "75%"},
                    { left: "60%", top: "85%"},
                    { left: "100%", top: "80%"},
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
            await this.spawnGroup(
                enemies[i].type,
                enemies[i].quantity,
                enemies[i].waitTime
            );
        }
    }
    spawnGroup(Type, numberOfEnemies, groupWaitTime) {
        return new Promise((resolve, reject) => {
            let subPromises = [];
            let enemyWaitTime = 1000; // To separate enemies
            let range = 300; // How much they are separated
            
            for (let i = 0; i < numberOfEnemies; i++) {
                subPromises.push(new Promise((subResolve) => {
                    let random = Math.random() * range;
                    enemyWaitTime += random;
                    this.queuedActions.push({
                        queuedAt: this.inGameTime,
                        waitTime: enemyWaitTime,
                        callback: () => {
                            this.spawnEnemy(Type);
                            subResolve();
                        }
                    })
                }))
            }
            Promise.all(subPromises).then(() => {
                this.queuedActions.push({
                    queuedAt: this.inGameTime,
                    waitTime: groupWaitTime,
                    callback: () => {
                        resolve();
                    }
                })
            });
        })
    }
    spawnEnemy(Type) {
        const path = $('.path');
        let enemy = new Type(path);
        this.enemies.push(enemy);
    }
    startInGameTime() {
        this.inGameTimeId = setInterval(() => {
            let now = new Date().getTime();
            if (!this.isPaused) {
                if (this.lastPaused) {
                    this.totalPaused += now - this.lastPaused;
                    this.lastPaused = undefined;
                }
                this.inGameTime = now - this.totalPaused;
                let loops = [];
                this.queuedActions = this.queuedActions
                .filter((action) => {
                    if (action.queuedAt + action.waitTime <= this.inGameTime) {
                        action.callback();
                        if (action.loop) loops.push({
                            ...action,
                            queuedAt: new Date().getTime()
                        })
                        return false;
                    } else return true;
                })
                this.queuedActions = this.queuedActions.concat(loops);
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
        $('.hp').text(": " + this.hp);
    }
    modifyMoney(amount) {
        this.money += amount;
        $('.money').text(": " + this.money);
    }
    removeEnemy(id) {
        let enIndex = this.enemies
        .findIndex((enemy) => {
            if (enemy.id === id) {
                enemy.isAlive = false;
                return true;
            }
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
        clearInterval(this.inGameTimeId);
        startGame(this.levelIndex);
    }
    exit() {
        clearInterval(this.inGameTimeId);
        startMainMenu();
    }
    nextWave() {
        console.log(this.enemies);
        let totalWaves = this.waves.length;
        if (this.currentWave+1 === totalWaves) {
            this.win();
        } else {
            this.currentWave++;
            $('.hud .wave').text(`WAVE: ${this.currentWave+1}/${totalWaves}`);
        }
    }
    win() {
        clearInterval(this.inGameTimeId);
        saveProgress(this.levelIndex+1);
        console.log('you win!');
    }
    gameOver() {
        this.hp = 0;
        this.pause();
        let container = new $(`<div class="game-over"><h2>Game Over!</h2></div>`);
        let text = new $(`<p>Your body was overtaken by the invaders...</p><p>Maybe wash your hands next time?</p>`)
        let buttons = new $(`<div class="buttons"></div>`);
        let exit = new $(`<button>Exit</button>`);
        let restart = new $(`<button>Restart</button>`);
        container.append(text);
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
        this.modifyHp(100);
        this.modifyMoney(300);
        this.spawnWave();
    }
}
function getCookie(key) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + key + "=");
    if (parts.length === 2) {
        return parts.pop().split(";").shift();
    }
}
function startGame(levelIndex) {
    game.children().remove();
    gameState = new GameState(levelIndex);
}
function startMainMenu() {
    game.children().remove();
    game.hide();

    mainMenu.css({display: "flex"});
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

    let minFontSize = 10;
    let fontSize = (newWidth / 100) * 1.5;
    if (fontSize < minFontSize) fontSize = minFontSize;

    wrapper.css({
        width: newWidth,
        height: newHeight,
        fontSize: fontSize + "px"
    })

    if (gameState) {
        [
            ...gameState.enemies,
            ...gameState.nodes,
            ...gameState.towers,
            ...gameState.projectiles,
            gameState.hud

        ].forEach((instance) => {
            if (typeof instance.onResize === 'function') {
                instance.onResize(newWidth, newHeight)
            }
        })
    }
    windowSize = {
        width: newWidth,
        height: newHeight,
    }
}
function saveProgress(nextLevel) {
    let pair = "loadLevelIndex=" + nextLevel;
    let expiry = "; expires=Thu, 1 Dec 2100 12:00:00 UTC";
    let cookie = pair + expiry;
    document.cookie = cookie;
}
function onPageLoad() {
    $(window).resize(resizeGameArea);
    $(window).on('resize', resizeGameArea);
    windowSize = {
        width: window.innerWidth,
        height: window.innerHeight,
    }
    let startGameButton = $(`.main-menu .start-game`);
    startGameButton.on('click', () => {
        mainMenu.hide();
        game.show();
        startGame(0);
    })
    let loadLevelIndex = getCookie("loadLevelIndex");
    if (loadLevelIndex !== undefined) {
        $('.load-game')
            .show()
            .on('click', () => {
                mainMenu.hide();
                game.show();
                startGame(loadLevelIndex);
            })
    }
    resizeGameArea();
    startMainMenu();
}
onPageLoad();