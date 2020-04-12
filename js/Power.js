class Power {
    constructor(usePower, isNew) {
        this.usePower = usePower;
        this.isNew = isNew;
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

        if (this.isNew) {
            this.jquery.append(`<label class="new">new!</label>`)
        }

        this.button.on('click', () => {
            this.usePower(this.constructor.name, this.options);
        })

        this.titleJquery.text(this.title);
        this.descriptionBox
            .append(this.titleJquery)
            .append(`<div>${this.description}</div>`);
    }
}

class PowerFreeze extends Power {
    constructor(usePower, isNew) {
        super(usePower, isNew);
        this.icon = new $(`<i class="fas fa-prescription-bottle-alt"></i>`);
        this.title = 'Medication';
        this.options = {
            waitTime: 4000
        }
        this.description = `Freezes all enemies on-screen for ${this.options.waitTime/1000} seconds.`;
        this.setup();
    }
}

class PowerNothing extends Power {
    constructor(usePower, isNew) {
        super(usePower, isNew);
        this.icon = new $(`<i class="fas fa-leaf"></i>`);
        this.title = 'Essential Oils';
        this.description = `Does literally nothing. You can still use it though.`;
        this.setup();
    }
}

class PowerSpawnDelay extends Power {
    constructor(usePower, isNew) {
        super(usePower, isNew);
        this.icon = new $(`<i class="fas fa-street-view"></i>`);
        this.title = 'Social Distancing';
        this.options = {
            waitTime: 10000
        }
        this.description = `Stops the rate of new infections for ${this.options.waitTime/1000} seconds.`;
        this.setup();
    }
}
