class Power {
    constructor(usePower) {
        this.usePower = usePower;
        this.jquery = new $(`<div class="power"></div>`);
        this.button = new $(`<button></button>`);
        this.icon = '';
        this.descriptionBox = new $(`<div class="description"></div>`);
        this.description = '';
        this.titleJquery = new $(`<strong class="title"></strong>`);
        this.title = '';
        this.options = {};
        // this.setup();
    }

    addToScene(parent) {
        parent.append(this.jquery);
    }

    setup() {
        this.jquery
            .append(this.button)
            .append(this.descriptionBox);
        this.button.append(this.icon);

        this.button.on('click', () => {
            let success = this.usePower(this.constructor.name, this.options);
            if (success) {
                this.button.attr('disabled', true);
            }
        })

        this.titleJquery.text(this.title);
        this.descriptionBox
            .append(this.titleJquery)
            .append(`<div>${this.description}</div>`);
    }
}

class PowerFreeze extends Power { // Don't change class name
    constructor(usePower) {
        super(usePower);
        this.icon = new $(`<i class="fas fa-prescription-bottle-alt"></i>`);
        this.title = 'Medication';
        this.options = {
            waitTime: 3000
        }
        this.description = `Freezes all enemies on-screen for ${this.options.waitTime/1000} seconds.`;
        this.setup();
    }
}

