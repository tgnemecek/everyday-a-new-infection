class GameState {
    constructor({levelIndex = 0, skipIntro = false, startGame, saveGame, startMainMenu}) {
        this.levelIndex = levelIndex
        this.skipIntro = skipIntro
        this.startGame = startGame
        this.saveGame = saveGame
        this.startMainMenu = startMainMenu

        this.inGameTime = new Date().getTime()
        this.inGameTimeId = undefined
        this.updateRate = 60 // Only affects queued actions, ignores animations
        this.hud = undefined
        this.tutorial = undefined
        this.callWaveButton = new $(`<button class="call-wave">START!</button>`)
        this.card = undefined
        // waitTime (ms), queuedAt (ms), callback, loop (boolean), id (string), group (string)
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
        this.pauseModal = undefined
        this.powerCoolDownTime = 30000;
        this.currentWave = -1
        this.spawnDelay = 500;
        // this.pathALastSpawned = false;
        this.waves = []
        this.waveFullySpawned = false;
        this.canUsePower = false;
        this.gameFrozen = false;
        this.setup()
    }
    getLevelData(getLength) {
        let levels = [
            { // DAY 1
                image: "images/level1.jpg",
                startingHP: 10,
                startingMoney: 180,
                moneyMultiplier: 1,
                zoom: 1,
                canLevelUp: false,
                nodes: [
                    { left: "25%", top: "32%"},
                    { left: "53%", top: "38%"},
                    { left: "72%", top: "65%"},
                ],
                pathA: [
                    { left: "18%", top: "-15%"},
                    { left: "18%", top: "0%"},
                    { left: "22%", top: "50%"},
                    { left: "42%", top: "58%"},
                    { left: "80%", top: "58%"},
                    { left: "85%", top: "70%"},
                    { left: "85%", top: "100%"},
                ],
                pathB: [],
                powersAvailable: [],
                towersAvailable: [
                    {type: TowerFast, new: true}
                ],
                waves: [
                    [
                        {type: EnemySmall, quantity: 1, waitTime: 1000},
                        {type: EnemySmall, quantity: 2, waitTime: 2000},
                        {type: EnemySmall, quantity: 4, waitTime: 2000},
                    ],
                    [
                        {type: EnemySmall, quantity: 6, waitTime: 1000},
                        {type: EnemySmall, quantity: 4, waitTime: 1000},
                    ]
                ]
            },
            { // DAY 2
                image: "images/level2.jpg",
                startingHP: 10,
                startingMoney: 210,
                moneyMultiplier: 1,
                zoom: 1,
                canLevelUp: true,
                nodes: [
                    { left: "67%", top: "17%"},
                    { left: "19%", top: "40%"},
                    { left: "10%", top: "12%"},
                    { left: "10%", top: "70%"},
                    { left: "75%", top: "65%"},
                ],
                pathA: [
                    { left: "90%", top: "-15%"},
                    { left: "90%", top: "0%"},
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
                pathB: [],
                powersAvailable: [],
                towersAvailable: [
                    {type: TowerFast, new: false},
                    {type: TowerSticky, new: true},
                ],
                waves: [
                    [
                        {type: EnemySmall, quantity: 3, waitTime: 2000},
                        {type: EnemySmall, quantity: 3, waitTime: 2000},
                        {type: EnemySmall, quantity: 4, waitTime: 2000},
                        {type: EnemySmall, quantity: 5, waitTime: 2000},
                    ],
                    [
                        {type: EnemySmall, quantity: 3, waitTime: 500},
                        {type: EnemySmall, quantity: 3, waitTime: 500},
                        {type: EnemySmall, quantity: 6, waitTime: 2000},
                        {type: EnemySmall, quantity: 10, waitTime: 2000},
                    ],
                    [
                        {type: EnemyBig, quantity: 1, waitTime: 3000},
                        {type: EnemyBig, quantity: 1, waitTime: 3000},
                        {type: EnemyBig, quantity: 3, waitTime: 3000},
                    ]
                ]
            },
            { // DAY 3
                image: "images/level3.jpg",
                startingHP: 10,
                startingMoney: 250,
                moneyMultiplier: 1,
                zoom: 0.7,
                canLevelUp: true,
                nodes: [
                    { left: "11%", top: "51%"},
                    { left: "29%", top: "30%"},
                    { left: "46%", top: "60%"},
                    { left: "45%", top: "20%"},
                    { left: "62%", top: "20%"},
                ],
                pathA: [
                    { left: "7%", top: "-15%"},
                    { left: "7%", top: "0%"},
                    { left: "7%", top: "60%"},
                    { left: "14%", top: "73%"},
                    { left: "22%", top: "65%"},
                    { left: "23%", top: "35%"},
                    { left: "30%", top: "20%"},
                    { left: "40%", top: "30%"},
                    { left: "41%", top: "70%"},
                    { left: "50%", top: "80%"},
                    { left: "58%", top: "70%"},
                    { left: "55%", top: "20%"},
                    { left: "62%", top: "12%"},
                    { left: "78%", top: "20%"},
                    { left: "100%", top: "60%"},
                ],
                pathB: [],
                powersAvailable: [
                    {type: PowerFreeze, new: true},
                    {type: PowerNothing, new: true},
                    {type: PowerSpawnDelay, new: true}
                ],
                towersAvailable: [
                    {type: TowerFast, new: false},
                    {type: TowerSticky, new: false},
                    {type: TowerSlow, new: true},
                ],
                waves: [
                    [
                        {type: EnemySmall, quantity: 3, waitTime: 500},
                        {type: EnemySmall, quantity: 3, waitTime: 300},
                        {type: EnemySmall, quantity: 4, waitTime: 300},
                        {type: EnemySmall, quantity: 5, waitTime: 2000},
                    ],
                    [
                        {type: EnemyBig, quantity: 1, waitTime: 500},
                        {type: EnemySmall, quantity: 6, waitTime: 300},
                        {type: EnemySmall, quantity: 12, waitTime: 1},
                        {type: EnemyBig, quantity: 2, waitTime: 500},
                        {type: EnemySmall, quantity: 24, waitTime: 2000},
                    ],
                    [
                        {type: EnemyBig, quantity: 1, waitTime: 1000},
                        {type: EnemyBig, quantity: 2, waitTime: 5000},
                        {type: EnemySmall, quantity: 35, waitTime: 2000},
                        {type: EnemyBig, quantity: 3, waitTime: 10000},
                        {type: EnemySmall, quantity: 20, waitTime: 10000},
                        {type: EnemySmall, quantity: 10, waitTime: 10000},
                        {type: EnemyBig, quantity: 3, waitTime: 5000},
                        {type: EnemyBig, quantity: 3, waitTime: 5000},
                        {type: EnemySmall, quantity: 5, waitTime: 5000},
                        {type: EnemySmall, quantity: 5, waitTime: 3000},
                        {type: EnemySmall, quantity: 10, waitTime: 5000},
                        {type: EnemySmall, quantity: 10, waitTime: 5000},
                    ]
                ]
            },
            { // DAY 4
                image: "images/level4.jpg",
                startingHP: 10,
                startingMoney: 300,
                moneyMultiplier: 1,
                zoom: 0.7,
                canLevelUp: true,
                nodes: [
                    { left: "20%", top: "20%"},
                    { left: "30%", top: "30%"},
                    { left: "20%", top: "48%"},
                    { left: "38%", top: "57%"},
                    { left: "47%", top: "33%"},

                    { left: "75%", top: "10%"},
                    { left: "65%", top: "27%"},
                    { left: "78%", top: "42%"},
                    { left: "56%", top: "57%"},
                ],
                pathA: [
                    { left: "13%", top: "-15%"},
                    { left: "13%", top: "0%"},
                    { left: "16%", top: "30%"},
                    { left: "40%", top: "50%"},
                    { left: "50%", top: "55%"},
                    { left: "50%", top: "100%"},
                ],
                pathB: [
                    { left: "88%", top: "-15%"},
                    { left: "88%", top: "0%"},
                    { left: "83%", top: "30%"},
                    { left: "60%", top: "50%"},
                    { left: "50%", top: "55%"},
                    { left: "50%", top: "100%"},
                ],
                powersAvailable: [
                    {type: PowerFreeze, new: false},
                    {type: PowerNothing, new: false},
                    {type: PowerSpawnDelay, new: false}
                ],
                towersAvailable: [
                    {type: TowerFast, new: false},
                    {type: TowerSticky, new: false},
                    {type: TowerSlow, new: false},
                ],
                waves: [
                    [
                        {type: EnemySmall, quantity: 5, waitTime: 1, path: 'a'},
                        {type: EnemyBig, quantity: 1, waitTime: 5000, path: 'b'},
                        {type: EnemySmall, quantity: 5, waitTime: 3000, path: 'a'},
                        {type: EnemyBig, quantity: 1, waitTime: 8000, path: 'b'},
                    ],
                    [
                        {type: EnemyBig, quantity: 1, waitTime: 1, path: 'b'},
                        {type: EnemySmall, quantity: 6, waitTime: 3000, path: 'a'},
                        {type: EnemyBig, quantity: 1, waitTime: 1, path: 'b'},
                        {type: EnemySmall, quantity: 10, waitTime: 1, path: 'a'},
                        {type: EnemyBig, quantity: 1, waitTime: 4000, path: 'b'},
                        {type: EnemyBig, quantity: 1, waitTime: 8000, path: 'b'},
                        {type: EnemySmall, quantity: 6, waitTime: 8000, path: 'a'},
                        {type: EnemySmall, quantity: 6, waitTime: 2000, path: 'a'},
                    ],
                    [
                        {type: EnemyBig, quantity: 1, waitTime: 1, path: 'b'},
                        {type: EnemySmall, quantity: 6, waitTime: 7000, path: 'a'},
                        {type: EnemyBig, quantity: 1, waitTime: 2000, path: 'b'},
                        {type: EnemyBig, quantity: 1, waitTime: 1, path: 'b'},
                        {type: EnemySmall, quantity: 6, waitTime: 1, path: 'a'},
                        {type: EnemyBig, quantity: 1, waitTime: 6000, path: 'b'},
                        {type: EnemyBig, quantity: 2, waitTime: 1, path: 'b'},
                        {type: EnemySmall, quantity: 6, waitTime: 1, path: 'a'},
                        {type: EnemySmall, quantity: 6, waitTime: 4000, path: 'a'},
                        {type: EnemyBig, quantity: 1, waitTime: 3000, path: 'b'},
                        {type: EnemyBig, quantity: 1, waitTime: 3000, path: 'b'},
                        {type: EnemyBig, quantity: 1, waitTime: 2000, path: 'b'},
                        {type: EnemyBig, quantity: 1, waitTime: 3000, path: 'b'},
                        {type: EnemyBig, quantity: 1, waitTime: 4000, path: 'b'},
                        {type: EnemySmall, quantity: 16, waitTime: 2000, path: 'a'},
                    ]
                ]
            },
            { // DAY 5
                image: "images/level5.jpg",
                startingHP: 10,
                startingMoney: 450,
                moneyMultiplier: 1,
                zoom: 0.5,
                canLevelUp: true,
                nodes: [
                    // Outer Top
                    // { left: "30%", top: "16%"},
                    { left: "47%", top: "16%"},
                    // { left: "63%", top: "16%"},
                    // Inner Top
                    { left: "47%", top: "30%"},
                    // Outer Left
                    { left: "21%", top: "30%"},
                    { left: "15%", top: "50%"},
                    { left: "20%", top: "68%"},
                    // Inner Left
                    { left: "27%", top: "40%"},
                    { left: "27%", top: "58%"},
                    { left: "7%", top: "68%"},
                    // Outer Right
                    { left: "72%", top: "29%"},
                    { left: "78%", top: "48%"},
                    { left: "73%", top: "68%"},
                    // Inner Right
                    { left: "66%", top: "40%"},
                    { left: "66%", top: "58%"},
                    { left: "87%", top: "68%"},
                    // Inner Bottom
                    { left: "48%", top: "68%"},
                    // Outer Bottom
                    { left: "14%", top: "82%"},
                    { left: "80%", top: "83%"},
                ],
                pathA: [
                    { left: "-15%", top: "25%"},
                    { left: "0%", top: "27%"},
                    { left: "50%", top: "27%"},
                    { left: "65%", top: "33%"},
                    { left: "70%", top: "38%"},
                    { left: "76%", top: "49%"},
                    { left: "76%", top: "60%"},
                    { left: "70%", top: "70%"},
                    { left: "53%", top: "80%"},
                    { left: "-5%", top: "80%"},
                ],
                pathB: [
                    { left: "115%", top: "25%"},
                    { left: "100%", top: "27%"},
                    { left: "50%", top: "27%"},
                    { left: "32%", top: "33%"},
                    { left: "28%", top: "38%"},
                    { left: "23%", top: "48%"},
                    { left: "23%", top: "60%"},
                    { left: "27%", top: "70%"},
                    { left: "47%", top: "80%"},
                    { left: "105%", top: "80%"},
                ],
                powersAvailable: [
                    {type: PowerFreeze, new: false},
                    {type: PowerNothing, new: false},
                    {type: PowerSpawnDelay, new: false}
                ],
                towersAvailable: [
                    {type: TowerFast, new: false},
                    {type: TowerSticky, new: false},
                    {type: TowerSlow, new: false},
                ],
                waves: [
                    [
                        {type: EnemyDivide, quantity: 1, waitTime: 7000, path: 'a'},
                        {type: EnemySmall, quantity: 10, waitTime: 5000, path: 'b'},
                        {type: EnemySmall, quantity: 10, waitTime: 5000, path: 'b'},
                        {type: EnemySmall, quantity: 10, waitTime: 3000, path: 'b'},
                        {type: EnemySmall, quantity: 12, waitTime: 3000, path: 'b'},
                    ],
                    [
                        {type: EnemyDivide, quantity: 1, waitTime: 1, path: 'a'},
                        {type: EnemyBig, quantity: 1, waitTime: 1000, path: 'b'},
                        {type: EnemyBig, quantity: 1, waitTime: 1000, path: 'b'},
                        {type: EnemyBig, quantity: 1, waitTime: 1000, path: 'b'},
                        {type: EnemyBig, quantity: 1, waitTime: 5000, path: 'b'},
                        {type: EnemySmall, quantity: 10, waitTime: 3000, path: 'b'},
                        {type: EnemyDivide, quantity: 1, waitTime: 5000, path: 'a'},
                        {type: EnemySmall, quantity: 20, waitTime: 3000, path: 'b'},
                        {type: EnemyBig, quantity: 2, waitTime: 3000, path: 'b'},
                        {type: EnemyBig, quantity: 1, waitTime: 3000, path: 'b'},
                        {type: EnemySmall, quantity: 25, waitTime: 3000, path: 'b'},
                        {type: EnemySmall, quantity: 20, waitTime: 7000, path: 'b'},
                    ],
                    [
                        {type: EnemyDivide, quantity: 1, waitTime: 1, path: 'a'},
                        {type: EnemyDivide, quantity: 1, waitTime: 6000, path: 'b'},
                        {type: EnemySmall, quantity: 30, waitTime: 7000, path: 'b'},
                        {type: EnemyBig, quantity: 1, waitTime: 1000, path: 'b'},
                        {type: EnemyBig, quantity: 1, waitTime: 1000, path: 'b'},
                        {type: EnemyBig, quantity: 1, waitTime: 5000, path: 'b'},
                        {type: EnemySmall, quantity: 10, waitTime: 3000, path: 'b'},
                        {type: EnemySmall, quantity: 10, waitTime: 10000, path: 'b'},
                        {type: EnemyDivide, quantity: 1, waitTime: 1, path: 'a'},
                        {type: EnemySmall, quantity: 10, waitTime: 8000, path: 'b'},
                        {type: EnemySmall, quantity: 10, waitTime: 8000, path: 'b'},
                        {type: EnemySmall, quantity: 10, waitTime: 3000, path: 'b'},
                        {type: EnemySmall, quantity: 10, waitTime: 3000, path: 'b'},
                        {type: EnemyBig, quantity: 2, waitTime: 3000, path: 'b'},
                        {type: EnemyBig, quantity: 1, waitTime: 3000, path: 'b'},
                        {type: EnemyDivide, quantity: 1, waitTime: 5000, path: 'b'},
                        {type: EnemySmall, quantity: 25, waitTime: 3000, path: 'b'},
                        {type: EnemySmall, quantity: 100, waitTime: 7000, path: 'b'},
                    ],
                ]
            }
        ]
        if (getLength) return levels.length;
        return levels[this.levelIndex];
    }
    loadLevelCutscene(callback) {
        audioManager.play('dayMusic');
        let levelCount = this.getLevelData(true);
        let title;
        let subText;
        if (this.levelIndex+1 === levelCount) {
            title = "Last Day"
            subText = "Can you survive the ultimate battle against the Corona Queen?"
        } else {
            title = `Day ${this.levelIndex+1}`;
            subText = `Can you survive all ${levelCount} days of infections?`;
        }
        $('.black-screen')
            .css({opacity: 1, pointerEvents: "all"})
        $('.black-screen .content')
            .append(`<h2>${title}</h2>`)
            .append(`<p>${subText}</p>`)
            .animate({opacity: 1}, 1000)
            .animate({opacity: 1}, 3000) // Wait time
            .animate({opacity: 0}, {
                duration: 1000,
                complete: () => {
                    $('.black-screen .content').children().remove();
                    $('.black-screen').animate({opacity: 0}, {
                        duration: 2000,
                        start: () => {
                            $('.black-screen').css({pointerEvents: "none"});
                            callback();
                        }
                    })
                }
            })
    }
    async spawnWave() {
        // this.nextWave();
        this.waveFullySpawned = false;
        let enemies = [...this.waves[this.currentWave]];
    
        for (let i = 0; i < enemies.length; i++) {
            if (i === enemies.length-1) this.waveFullySpawned = true;
            await this.spawnGroup(
                enemies[i].type,
                enemies[i].quantity,
                enemies[i].waitTime,
                enemies[i].path,
            );
        }
    }
    spawnGroup(Type, numberOfEnemies, groupWaitTime, path) {
        return new Promise((resolve, reject) => {
            let subPromises = [];
            let rangeMin = 500;
            let rangeMax = 300;
            let range = rangeMax - rangeMin;
            
            for (let i = 0; i < numberOfEnemies; i++) {
                let currentRange = (Math.random() * range) + rangeMin;
                currentRange = currentRange * i * windowSize.zoom;
                let delay = this.spawnDelay * i;

                subPromises.push(new Promise((subResolve) => {
                    this.queuedActions.push({
                        group: 'spawn-enemy',
                        queuedAt: new Date().getTime(),
                        waitTime: delay,
                        callback: () => {
                            this.spawnEnemy(Type, path);
                            subResolve();
                        }
                    })
                }))
            }
            Promise.all(subPromises).then(() => {
                this.queuedActions.push({
                    group: 'enemy-group-wait',
                    queuedAt: this.inGameTime,
                    waitTime: groupWaitTime,
                    callback: () => {
                        resolve();
                    }
                })
            });
        })
    }
    spawnEnemy(Type, pathName) {
        let path = pathName ? $('.path-' + pathName) : $('.path-a');

        let enemy = new Type(path);
        this.enemies.push(enemy);
        enemy.addToScene();
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
                let toBeCalled = [];
                this.queuedActions = this.queuedActions
                .sort((a, b) => {
                    let timeToHappenA = a.queuedAt + a.waitTime;
                    let timeToHappenB = b.queuedAt + b.waitTime;
                    if (timeToHappenA > timeToHappenB) return -1;
                    if (timeToHappenA < timeToHappenB) return 1;
                    return 0;
                })
                .filter((action) => {
                    if (action.queuedAt + action.waitTime <= this.inGameTime) {
                        toBeCalled.push(action);
                        if (action.loop) {
                            loops.push({
                                ...action,
                                queuedAt: this.inGameTime
                            })
                        }
                        return false;
                    } else return true;
                })
                toBeCalled.forEach((action) => action.callback());
                this.queuedActions = this.queuedActions.concat(loops);
            } else {
                if (!this.lastPaused) this.lastPaused = new Date().getTime();
            }
        }, this.updateRate);
    }
    onResize(newWidth, newHeight, belowResolutionLimit) {
        [
            ...this.enemies,
            ...this.nodes,
            ...this.towers,
            ...this.projectiles,
        ].forEach((instance) => {
            if (typeof instance.onResize === 'function') {
                instance.onResize(newWidth, newHeight)
            }
        })
        this.resizeTutorial();
        if (belowResolutionLimit && !this.isPaused) {
            this.togglePause();
        }
    }
    usePower(powerName, options) {
        if (!this.canUsePower) return false;

        let powerButton = $('.power button');

        powerButton
            .attr('disabled', true)
            .css({backgroundPositionY: `0%`})
            .find('.new').hide();

        powerButton.animate({
            backgroundPositionY: `99%`
        }, {
            easing: 'linear',
            duration: this.powerCoolDownTime,
            complete: () => {
                this.canUsePower = true;
                powerButton.attr('disabled', false);
            }
        })

        if (powerName === 'PowerFreeze') {
            let frozenEnemies = [];
            this.isSpawnDelayed = true;
            this.gameFrozen = true;
            audioManager.filterMusic();
            audioManager.play('powerFreeze');
            game.css({ filter: 'invert(1)' });
            this.enemies.forEach((enemy) => {
                enemy.pause();
                frozenEnemies.push(enemy);
            })
            this.queuedActions.forEach((action) => {
                if (action.group === 'path-prediction') {
                    action.waitTime += options.waitTime;
                }
            })
            this.queuedActions.push({
                id: powerName,
                group: 'power-freeze',
                waitTime: options.waitTime,
                queuedAt: new Date().getTime(),
                loop: false,
                callback: () => {
                    audioManager.unfilterMusic();
                    game.css({ filter: '' });
                    this.gameFrozen = false;
                    frozenEnemies.forEach((enemy) => {
                        if (enemy.isAlive) {
                            enemy.resume();
                        }
                    })
                }
            })
        } else if (powerName === 'PowerSpawnDelay') {
            audioManager.filterMusic();
            audioManager.play('powerSpawnDelay');
            game.css({ filter: 'grayscale(80%)' });
            
            this.queuedActions.forEach((action) => {
                if (action.group === 'spawn-enemy') {
                    action.waitTime += options.waitTime;
                }
            })

            this.queuedActions.push({
                group: 'power-spawn-delay',
                waitTime: this.spawnDelay,
                queuedAt: new Date().getTime(),
                callback: () => {
                    audioManager.unfilterMusic();
                    game.css({ filter: '' });
                }
            })
        }

        this.canUsePower = false;
        return true;
    }
    modifyHp(amount) {
        this.hp += amount;
        if (amount < 0) {
            audioManager.play('audioDamageTaken');
        }
        if (this.hp <= 0) {
            this.gameOver();
        }
        $('.hp').text(": " + this.hp);
    }
    modifyMoney(amount, useMultiplier) {
        if (useMultiplier) {
            this.money += amount * this.getLevelData().moneyMultiplier;
        } else {
            this.money += amount;
        }
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
        this.checkForNextWave();
        // if (this.waveFullySpawned && !this.enemies.length) {
        //     this.nextWave();
        // }
    }
    checkForNextWave() {
        let enemiesAlive = 0;
        this.enemies.forEach((enemy) => {
            if (enemy.isAlive) enemiesAlive++;
        })
        if (this.waveFullySpawned && !enemiesAlive && this.hp) {
            this.nextWave();
        }
    }
    togglePause() {
        let pauseMenu = new $(`<div class="pause-menu"></div>`);
        let exit = new $(`<button>Exit</button>`);
        let restart = new $(`<button>Restart</button>`);
        let resume = new $(`<button>Resume</button>`);
        pauseMenu.append(exit)
                 .append(restart)
                 .append(resume);

        restart.on('click', () => {
            this.reset();
        })

        exit.on('click', () => {
            this.exit();
        })

        resume.on('click', () => {
            this.togglePause();
        })

        if (!this.isPaused) {
            this.pauseModal = new ModalBox(pauseMenu, this.togglePause.bind(this));
            game.append(this.pauseModal.jquery);
            if (!audioManager.isMuted) audioManager.audioContext.suspend();
            this.pause();
        } else {
            this.pauseModal.jquery.remove();
            this.pauseModal = undefined;
            if (!audioManager.isMuted) audioManager.audioContext.resume();
            this.resume();
        }
    }
    pause() {
        this.lastPaused = new Date();
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
            if (enemy.isAlive) enemy.resume();
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
        audioManager.stop('preCombatMusic');
        audioManager.stop('combatMusic');
        this.startGame({
            levelIndex: this.levelIndex,
            skipIntro: this.skipIntro,
            startGame: this.startGame
        });
    }
    exit() {
        clearInterval(this.inGameTimeId);
        this.startMainMenu();
    }
    nextWave() {
        let totalWaves = this.waves.length;
        this.waveFullySpawned = false;
        if (this.currentWave+1 === totalWaves) {
            this.queuedActions.push({
                group: 'next-wave',
                waitTime: 2000,
                queuedAt: new Date().getTime(),
                callback: () => this.win()
            })
        } else {
            this.currentWave++;
            $('.hud .wave').text(`INFECTION: ${this.currentWave+1}/${totalWaves}`);
            this.waveCustscene();
        }
    }
    waveCustscene() {
        const getContent = () => {
            let waves = this.getLevelData().waves;
            if (this.currentWave === 0) {
                return "<h2>NEW INFECTION DETECTED!</h2><p>Stop the invading microbes!</p>"
            } else if (this.currentWave+1 === waves.length) {
                return '<h2>JUST ONE MORE TO GO!</h2><p>You can do this!</p>'
            } else {
                let options = [
                    "GOOD JOB!<br>BUT IT'S NOT OVER YET!",
                    "NICE! KEEP IT UP!",
                    "WAY TO GO!<br>BUT DON'T STOP NOW!"
                ]
                let random = Math.round(Math.random() * (options.length-1));
                return `<h2>${options[random]}</h2>`;
            }
        }
        let content = new $(`<div class="content"><h2>${getContent()}</h2></div>`)
            .append(`<i class="fas fa-exclamation-triangle"></i>`)
        this.card = new Card(content, {
            waitTime: 2000,
            callback: this.spawnWave.bind(this)
        });

    }
    win() {
        audioManager.playAtTempo('victoryMusic', 'combatMusic', 1)
            .then(() => {
                this.pause();
                $('.modal').remove();
                let exit = new $(`<button>Exit</button>`);
                let next = new $(`<button>Next Day</button>`);
                exit.on('click', () => this.exit());
                next.on('click', () => this.nextDay());
                
                let buttons = new $(`<div class="buttons"></div>`)
                    .append(exit)
                    .append(next)
                let content = new $(`<div class="container"><h2>Victory!</h2></div>`);


                if (this.levelIndex+1 >= this.getLevelData(true)) {
                    let finish = new $(`<button class="end-game">Finish</button>`);
                    finish.on('click', () => this.endGame());
                    content
                        .append(`<p>You survived all days of infections!</p>`)
                        .append(`<i class="far fa-heart"></i>`)
                        .append(`<i class="far fa-heart"></i>`)
                        .append(`<i class="far fa-heart"></i>`)
                        .append(finish)
                } else {
                    content
                        .append(`<p>Your body has survived today's infection!</p>`)
                        .append(`<i class="far fa-heart"></i>`)
                        .append(buttons)
                }
                this.card = new Card(content, {
                    extraClass: "win-game"
                })
            })
    }
    gameOver() {
        this.hp = 0;
        this.pause();
        $('.modal').remove();

        audioManager.playAtTempo('gameOverMusic', 'combatMusic', 4)
            .then(() => {
                let exit = new $(`<button>Exit</button>`);
                let restart = new $(`<button>Restart</button>`);
                exit.on('click', () => this.exit());
                restart.on('click', () => this.reset());
        
                let buttons = new $(`<div class="buttons"></div>`)
                    .append(exit)
                    .append(restart)
                let content = new $(`<div class="container"><h2>Game Over!</h2></div>`)
                    .append(`<p>Your body was overtaken by the invaders...</p>`)
                    .append(`<p>Maybe wash your hands next time?</p>`)
                    .append(buttons)
        
                this.card = new Card(content, {
                    extraClass: "game-over"
                })
            })
    }
    nextDay() {
        this.saveGame(this.levelIndex+1);
        this.startGame({
            levelIndex: this.levelIndex+1,
            skipIntro: this.skipIntro,
            startGame: this.startGame,
            saveGame: this.saveGame,
            startMainMenu: this.startMainMenu
        });
    }
    endGame() {
        game.hide();
        $('.about').show();
    }
    tutorialSetup() {
        this.tutorial = new $(`<div class="tutorial"></div>`);
        let pointer = new $(`<div class="pointer"><i class="fas fa-hand-point-up"></i></div>`);
        game.append(this.tutorial);
        if (this.levelIndex === 0) {
            this.nodes.forEach((node, i) => {
                let pos = node.jquery.position();
                let height = node.jquery.height();
                let width = node.jquery.width();
                let curPointer = pointer.clone();
                curPointer.css({
                    left: pos.left + width/2,
                    top: pos.top + height/2
                })
                this.tutorial.append(curPointer)
                let text = new $(`<p class="node-text">Build here!</p>`);
                if (i < 2) {
                    text.css({left: '2em'});
                } else text.css({right: '5em'});
                
                curPointer.append(text);
            })
            let hpPos = $('.hp').position();
            let hpPointer = pointer.clone();
            hpPointer.css({
                left: hpPos.left,
                top: hpPos.top
            })
            let hpText = new $(`<p class="hp-text">This is your Health. Don't let it reach zero!</p>`);
            hpPointer.append(hpText);
            this.tutorial.append(hpPointer);
            let moneyPos = $('.money').position();
            let moneyPointer = pointer.clone();
            moneyPointer.css({
                left: moneyPos.left,
                top: moneyPos.top
            })
            let moneyText = new $(`<p class="money-text">Use Resources to build structures. Destroy invaders to collect more!</p>`);
            moneyPointer.append(moneyText);
            this.tutorial.append(moneyPointer);
        } else if (this.levelIndex === 1) {
            let node = this.nodes[0];
            let pos = node.jquery.position();
            let height = node.jquery.height();
            let width = node.jquery.width();
            let curPointer = pointer.clone();
            curPointer.css({
                left: pos.left + width/2,
                top: pos.top + height/2
            })
            this.tutorial.append(curPointer)
            let text = new $(`<p class="node-text">After you build, click on your Structure to Upgrade!</p>`);
            text.css({
                right: '5em',
                top: '3em'
            });
            curPointer.append(text);
        } else if (this.levelIndex === 2) {
            let currPointer = pointer.clone();
            let text = new $(`<div class="text">Powers are now available! They have a long cooldown time. Choose wisely. (Click twice on mobile)</div>`);
            currPointer.css({
                position: 'absolute',
                top: '80%',
                left: '30%',
            })
            currPointer.addClass('powers');
            currPointer.append(text);
            currPointer.children('i').css({ transform: 'rotate(90deg)' });
            this.tutorial.append(currPointer)
        }
    }
    removeTutorial() {
        this.tutorial.remove();
        this.tutorial = undefined;
    }
    resizeTutorial() {
        if (!this.tutorial) return;

        this.removeTutorial();
        this.tutorialSetup();
    }
    setup() {
        let levelData = this.getLevelData();
        windowSize.zoom = levelData.zoom;
        
        const subSetup = () => {
            this.waves = levelData.waves;
            this.hud = new HUD(
                this.levelIndex,
                this.getLevelData(),
                this.usePower.bind(this)
            );
            
            game.append($(`<img src="${levelData.image}" class="background"></img>`));
            game.append(this.hud.jquery);
            game.append(this.callWaveButton);
            this.callWaveButton.on('click', () => {
                this.callWaveButton.remove();
                this.removeTutorial();
                this.nextWave();
                this.canUsePower = true;
                audioManager.stop('preCombatMusic');
                audioManager.play('combatMusic');
            })
            levelData.nodes.forEach((position) => {
                let node = new Node(position);
                this.nodes.push(node);
            })
            levelData.pathA.forEach((pathPosition) => {
                let path = new $(`<div class="path path-a"></div>`);
                game.append(path);
                path.css(pathPosition);
            })
            levelData.pathB.forEach((pathPosition) => {
                let path = new $(`<div class="path path-b"></div>`);
                game.append(path);
                path.css(pathPosition);
            })
            this.modifyHp(levelData.startingHP);
            this.modifyMoney(levelData.startingMoney);
            this.startInGameTime();
            this.tutorialSetup();
            audioManager.play('preCombatMusic');
        }

        if (!this.skipIntro) {
            this.loadLevelCutscene(subSetup);
        } else {
            subSetup();
        }
    }
}