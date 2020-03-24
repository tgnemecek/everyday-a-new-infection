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
    constructor(levelIndex) {
        this.jquery = new $(`<div class="hud"></div>`);
        this.hp = new $(`<div><i class="fas fa-heart"></i><span class="hp"></span></div>`);
        this.money = new $(`<div><i class="fas fa-atom"></i><span class="money"></span></div>`);
        this.wave = new $(`<div class="wave"></div>`);
        this.level = new $(`<div class="level">Day: ${levelIndex+1}</div>`);
        this.button = new $(`<button><i class="fas fa-pause-circle"></i></button>`);
        this.restart = new $(`<button>Restart</button>`);
        this.exit = new $(`<button>Exit</button>`);
        this.modal = new $(`<div class="pause-menu"></div>`);
        this.modalBox = undefined;
        this.setup();
    }
    togglePause() {
        if (!gameState.isPaused) {
            this.modalBox = new ModalBox(this.modal, this.togglePause.bind(this));
            game.append(this.modalBox.jquery);
            gameState.pause();
        } else {
            this.modalBox.jquery.remove();
            this.modalBox = undefined;
            gameState.resume();
        }
    }
    setup() {
        this.jquery.append(this.hp);
        this.jquery.append(this.money);
        this.jquery.append(this.wave);
        this.jquery.append(this.level);
        this.jquery.append(this.button);
        this.button.append(this.pauseIcon);

        this.modal.append(this.exit);
        this.modal.append(this.restart);

        this.button.on('click', () => {
            this.togglePause();
        });

        this.restart.on('click', () => {
            gameState.reset();
        })

        this.exit.on('click', () => {
            gameState.exit();
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
            let img = new $(`<img src="${enemy.type.image}"/>`);
            let description = new $(`<div class="description"></div>`);
            description.append(`<h2>${enemy.type.name}</h2><p>${enemy.type.description}</p>`);
            img.css({ filter: `hue-rotate(${enemy.type.baseHue}deg)` });
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
        this.modalBox.jquery.children('.box')
        .animate({
            bottom: this.getBottomPos()
        }, {
            duration: 1000,
            easing: 'easeOutBounce'
        })
    }
    wait() {
        this.isWaiting = true;
        this.modalBox.jquery.children('.box')
        .animate({ bottom: this.getBottomPos() }, {
            duration: this.waitTime,
            complete: () => this.isWaiting = false
        })
    }
    out() {
        let initRight;
        this.modalBox.jquery.children('.box')
        .animate({
            right: "120%"
        }, {
            duration: 1000,
            step: function(now, fx) {
                if (!initRight) initRight = now;
                let deg = ((now - initRight) / 120) * -30;
                $(this).css({ transform: `rotateZ(${deg}deg)` })
            },
            complete: () => {
                $('.card .overlay')
                .animate({opacity: 0}, {
                    duration: 3000,
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
                this.out();
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
        this.modalBox = undefined;
        this.updateInterval = undefined;
        this.towers = [
            TowerFast,
            TowerSlow,
            TowerSticky
        ]
        this.setup();
    }
    selectTower(Tower) {
        $('.tower-picker .container button').each((i, element) => {
            $(element).removeClass('selected');
        })
        $(`.${Tower.id} button`).addClass('selected');
        this.towerSelected = Tower;
        this.confirm.prop('disabled', false);
        this.jquery.append(this.description);
        this.description.children().remove();
        this.description.append(`<h3>${Tower.name}</h3><p>${Tower.description}</p>`)
    }
    checkIfDisabled(Tower) {
        let button = $(`.tower-picker .${Tower.id} button`);
        if (gameState.money >= Tower.cost) {
            button.prop("disabled", false);
        } else button.prop("disabled", true);
    }
    update() {
        this.towers.forEach((Tower) => {
            this.checkIfDisabled(Tower);
        })
        if (gameState.isPaused) {
            this.closeTowerPicker();
            clearInterval(this.updateInterval);
        }

        // this.updateInterval = setInterval(() => {
        //     this.towers.forEach((Tower) => {
        //         this.checkIfDisabled(Tower);
        //     })
        //     if (gameState.isPaused) {
        //         this.closeTowerPicker();
        //         clearInterval(this.updateInterval);
        //     }
        // }, fps)
    }
    setup() {
        this.jquery.append(this.container);
        this.modalBox = new ModalBox(this.jquery, () => {
            this.modalBox.jquery.remove();
            this.closeTowerPicker();
        });
        game.append(this.modalBox.jquery);
        this.towers.forEach((Tower) => {
            let towerDiv = new $(`<div class=${Tower.id}></div>`);
            let button = new $(`<button><img src="${Tower.thumbnail}"/></button>`);
            let label = $(`<label>$${Tower.cost}</label>`);

            towerDiv.append(button);
            towerDiv.append(label);

            this.container.append(towerDiv);
            button.on('click', () => this.selectTower(Tower));
            this.checkIfDisabled(Tower);
        })
        this.confirm.prop('disabled', true);
        this.jquery.append(this.confirm);
        this.confirm.on('click', () => {
            this.modalBox.jquery.remove();
            this.confirmTower(this.towerSelected);
        });
        gameState.queuedActions.push({
            waitTime: 1,
            loop: true,
            callback: this.update.bind(this),
            queuedAt: new Date().getTime()
        })
        // this.update();
    }
}