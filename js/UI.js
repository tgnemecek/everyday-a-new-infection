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
        this.jquery.append(this.box);
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
            reset();
        })
    }

}

class GameOver {
    constructor() {
        this.jquery = new $(`<div class="game-over"></div>`);
        this.box = new $(`<div class="box"><h2>Game Over!</h2></div>`);
        this.text = new $(`<p>Some text here...</p>`);
        this.button = new $(`<button>Try Again</button>`);
        this.overlay = new $(`<div class="overlay"></div>`);
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
        this.jquery = new $(`<div class="tower-picker"></div>`);
        this.box = new $('<div class="box"><h2>Build a Tower</h2></div>');
        this.container = new $(`<div class="container"></div>`);
        this.confirm = new $(`<button class="confirm">OK</button>`);
        this.description = new $(`<div class="description"></div>`);
        this.overlay = new $(`<div class="overlay"></div>`);
        this.confirmTower = confirmTower;
        this.closeTowerPicker = closeTowerPicker;
        this.towerSelected = undefined;
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
        this.box.append(this.description);
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
        game.append(this.jquery);
        this.jquery.append(this.box);
        this.overlay.on('click', () => this.closeTowerPicker())
        this.box.append(this.container);
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
        this.box.append(this.confirm);
        this.confirm.on('click', () => this.confirmTower(this.towerSelected));
        this.jquery.append(this.overlay);
        this.box.css({
            top: 'calc(50% - ' + this.box.height()/2 + 'px)',
            left: 'calc(50% - ' + this.box.width()/2 + 'px)',
        })
        this.update();
    }
}

