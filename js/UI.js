class ModalBox {
    constructor(child, overlayOnClick, extraClass) {
        this.jquery = new $(`<div class="modal ${extraClass || ""}"></div>`);
        this.overlay = new $(`<div class="overlay"></div>`);
        this.box = new $(`<div class="box"></div>`);
        this.child = child;
        this.overlayOnClick = overlayOnClick;
        this.setup();
    }
    setup() {
        if (this.child) this.jquery.append(this.box);
        this.jquery.append(this.overlay);
        this.box.append(this.child);
        if (typeof this.overlayOnClick === 'function') {
            this.overlay.on('click', () => {
                this.overlayOnClick();
            })
        }
    }
}

class HUD {
    constructor(levelIndex, levelData, usePower) {
        this.levelData = levelData;
        this.usePower = usePower;
        this.jquery = new $(`<div class="hud"></div>`);
        this.encyclopedia = new Encyclopedia(levelData);
        this.topHud = new $(`<div class="top-hud"></div>`);
        this.hp = new $(`<div><i class="fas fa-heart"></i><span class="hp"></span></div>`);
        this.money = new $(`<div><i class="fas fa-atom"></i><span class="money"></span></div>`);
        this.wave = new $(`<div class="wave">INFECTION:</div>`);
        this.level = new $(`<div class="level">Day: ${levelIndex+1}</div>`);
        this.volume = new $(`<button class="volume"><i class="fas fa-volume-up"></i></button>`)
        this.playPause = new $(`<button class="playPause"><i class="fas fa-pause-circle"></i></button>`);
        this.bottomHud = new $(`<div class="bottom-hud"></div>`);
        this.setup();
    }
    setup() {
        this.jquery.append(this.topHud);
        this.jquery.append(this.bottomHud);
        this.topHud
            .append(this.hp)
            .append(this.money)
            .append(this.wave)
            .append(this.level)
            .append(this.volume)
            .append(this.playPause)
            .append(this.encyclopedia.jquery)

        this.playPause.append(this.pauseIcon);

        this.playPause.on('click', () => {
            gameState.togglePause();
        });

        const volumeToggle = () => {
            if (audioManager.isMuted) {
                this.volume.html(`<i class="fas fa-volume-mute"></i>`);
            } else {
                this.volume.html(`<i class="fas fa-volume-up"></i>`);
            }
        }

        volumeToggle();

        this.volume.on('click', function() {
            audioManager.toggleMute();
            // $(this).children().remove();
            volumeToggle();
        })

        this.levelData.powersAvailable.forEach((powerData) => {
            let power = new powerData.type(this.usePower, powerData.new);
            power.addToScene(this.bottomHud);
        })
    }

}

class Encyclopedia {
    constructor(levelData) {
        this.levelData = levelData;
        this.jquery = new $(`<div class="encyclopedia"><i class="fas fa-question-circle"></i></div>`);
        this.content = new $(`<div class="content"></div>`);
        this.enemies = [];
        this.setup();
    }
    setup() {
        this.jquery.append(this.content);
        this.levelData.waves.forEach((wave) => {
            wave.forEach((subWave) => {
                let found = this.enemies.find((enemy) => {
                    return enemy.type === subWave.type;
                })
                if (found) {
                    found.quantity += subWave.quantity;
                } else {
                    this.enemies.push({
                        type: subWave.type,
                        quantity: subWave.quantity
                    });
                }
            })
        })
        this.enemies.forEach((enemy) => {
            let enJquery = new $(`<div></div>`);
            let img = new $(`<img src="${enemy.type.image()}"/>`);
            let description = new $(`<div class="description"></div>`);
            description.append(`<h2>${enemy.type.name()}</h2><p>${enemy.type.description()}</p>`);
            img.css({ filter: `hue-rotate(${enemy.type.baseHue()}deg)` });
            enJquery.append(img);
            enJquery.append(description);
            enJquery.append(`<div class="quantity"><p>${enemy.quantity}</p></div>`);
            this.content.append(enJquery);
        })
    }
}

class Card {
    constructor(content, {waitTime = -1, extraClass = "", callback}) {
        this.modalBox = new ModalBox(content, '', "card " + extraClass);
        this.waitTime = waitTime;
        this.callback = callback;
        this.isWaiting = false;
        this.setup()
    }
    inAndOut(bottom) {
        this.in(bottom);
        this.wait(bottom);
        this.out();
    }
    in() {
        audioManager.play('audioCardIn');
        this.modalBox.jquery.children('.box')
        .animate({
            bottom: this.getBottomPos()
        }, {
            duration: 1000,
            easing: 'easeOutBounce'
        })
    }
    wait() {
        this.modalBox.jquery.children('.box')
        .animate({ bottom: this.getBottomPos() }, {
            duration: this.waitTime,
            start: () => this.isWaiting = true,
            always: () => this.isWaiting = false
        })
    }
    out() {
        let initRight;
        this.modalBox.jquery.children('.box')
        .animate({
            right: "120%"
        }, {
            duration: 1000,
            start: () => {
                audioManager.play('audioCardOut')
            },
            step: function(now, fx) {
                if (!initRight) initRight = now;
                let deg = ((now - initRight) / 120) * -30;
                $(this).css({ transform: `rotateZ(${deg}deg)` })
            },
            complete: () => {
                $('.card .overlay')
                .animate({opacity: 0}, {
                    duration: 2000,
                    start: () => this.modalBox.jquery.css({pointerEvents: "none"}),
                    complete: () => {
                        this.modalBox.jquery.remove();
                        if (typeof this.callback === 'function') {
                            this.callback();
                        }
                    }
                })
            }
        })
    }
    getBottomPos(windowHeight) {
        windowHeight = windowHeight || windowSize.height;
        let boxHeight = this.modalBox.jquery.children('.box').height();
        let halfHeight = boxHeight / 2;
        let boxRelHeight = (halfHeight / windowHeight) * 100;
        return (50 - boxRelHeight) + "%";
    }
    setup() {
        game.append(this.modalBox.jquery);
        this.modalBox.jquery.on('click' , () => {
            if (this.isWaiting) {
                this.modalBox.jquery.children('.box').stop();
            }
        })

        if (this.waitTime === -1) {
            this.in();
        } else {
            this.inAndOut();
        }
    }
}

class TowerPicker {
    constructor(confirmTower, closeTowerPicker) {
        this.jquery = new $('<div class="tower-picker"><h2>Build a Structure</h2></div>');
        this.container = new $(`<div class="container"></div>`);
        this.confirm = new $(`<button class="confirm">OK</button>`);
        this.description = new $(`<div class="description"></div>`);
        this.confirmTower = confirmTower;
        this.closeTowerPicker = closeTowerPicker;
        this.towerSelected = undefined;
        this.actionId = tools.generateId();
        this.modalBox = undefined;
        this.towers = gameState.getLevelData().towersAvailable;
        this.setup();
    }
    close() {
        this.jquery.remove();
        this.modalBox.jquery.remove();
        let actionIndex = gameState.queuedActions.findIndex((action) => {
            return action.id === this.actionId
        })
        gameState.queuedActions.splice(actionIndex, 1);
    }
    selectTower(TowerType) {
        $('.tower-picker .container button').each((i, element) => {
            $(element).removeClass('selected');
        })
        $(`.${TowerType.id()} button`).addClass('selected');
        this.towerSelected = TowerType;
        if (gameState.money >= TowerType.cost()) {
            this.confirm.prop('disabled', false);
        } else {
            this.confirm.prop('disabled', true);
        }
        this.jquery.append(this.description);
        this.description.children().remove();
        this.description.append(`<h3>${TowerType.name()}</h3><p>${TowerType.description()}</p>`)
    }
    checkIfDisabled(TowerType) {
        let button = $(`.tower-picker .${TowerType.id()} button`);
        if (gameState.money >= TowerType.cost()) {
            button.css({backgroundColor: 'white'});
            if ($(`.${TowerType.id()} button`).hasClass('selected')) {
                this.confirm.prop('disabled', false);
            }
        } else {
            button.css({backgroundColor: 'grey'});
        }
    }
    update() {
        this.towers.forEach((Tower) => {
            this.checkIfDisabled(Tower.type);
        })
        if (gameState.isPaused) {
            this.close();
        }
    }
    setup() {
        this.jquery.append(this.container);
        this.modalBox = new ModalBox(this.jquery, () => {
            this.modalBox.jquery.remove();
            this.close();
        });
        game.append(this.modalBox.jquery);
        this.towers.forEach((Tower) => {
            let towerDiv = new $(`<div class=${Tower.type.id()}></div>`);
            let button = new $(`<button><img src="${Tower.type.thumbnail()}"/></button>`);
            let label = $(`<label><div><i class="fas fa-atom"></i> : ${Tower.type.cost()}</label>`);

            towerDiv.append(button)
                    .append(label);
            
            if (Tower.new) {
                towerDiv.append(`<label class="new">new!</label>`)
            }

            this.container.append(towerDiv);
            button.on('click', () => this.selectTower(Tower.type));
            this.checkIfDisabled(Tower.type);
        })
        this.confirm.prop('disabled', true);
        this.jquery.append(this.confirm);
        this.confirm.on('click', () => {
            this.close();
            this.confirmTower(this.towerSelected);
        });
        gameState.queuedActions.push({
            id: this.actionId,
            group: 'tower-picker-update',
            waitTime: 1,
            loop: true,
            callback: this.update.bind(this),
            queuedAt: new Date().getTime()
        })
        // this.update();
    }
}