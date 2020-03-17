class ModalBox {
    constructor(child, overlayOnClick) {
        this.jquery = new $(`<div class="modal"></div>`);
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
    constructor() {
        this.jquery = new $(`<div class="hud"></div>`);
        this.hp = new $(`<div class="hp"></div>`);
        this.money = new $(`<div class="money"></div>`);
        this.wave = new $(`<div class="wave"></div>`);
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

class GameOver {
    constructor() {
        this.jquery = new $(`<div></div>`);
        this.restart = new $(`<button>Restart</button>`);
        this.exit = new $(`<button>Exit</button>`);
        this.setup();
    }
    setup() {
        game.append(this.jquery);
        this.jquery.append(this.box);
        this.box.append(this.text);
        this.box.append(this.button);
        this.jquery.append(this.overlay);
        this.box.css({
            top: 'calc(50% - ' + this.box.height()/2 + 'px)',
            left: 'calc(50% - ' + this.box.width()/2 + 'px)',
        })
        this.button.on('click', () => reset());
    }
}

class TowerPicker {
    constructor(confirmTower, closeTowerPicker) {
        this.jquery = new $('<div class="tower-picker"><h2>Build a Tower</h2></div>');
        this.container = new $(`<div class="container"></div>`);
        this.confirm = new $(`<button class="confirm">OK</button>`);
        this.description = new $(`<div class="description"></div>`);
        this.confirmTower = confirmTower;
        this.closeTowerPicker = closeTowerPicker;
        this.towerSelected = undefined;
        this.modalBox = undefined;
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
        this.description.text(Tower.description);
    }
    checkIfDisabled(Tower) {
        let button = $(`.tower-picker .${Tower.id} button`);
        if (gameState.money >= Tower.cost) {
            button.prop("disabled", false);
        } else button.prop("disabled", true);
    }
    update() {
        setInterval(() => {
            this.towers.forEach((Tower) => {
                this.checkIfDisabled(Tower);
            })
        }, fps)
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
            let button = new $(`<button><img src="${Tower.image}"/></button>`);
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
        this.update();
    }
}

