class GameObject {
    constructor() {
        this.addToScene = this.addToScene.bind(this)
        this.removeFromScene = this.removeFromScene.bind(this)
    }
    addToScene(parent) {
        parent = parent || game;
        parent.append(this.jquery);
    }
    removeFromScene() {
        this.jquery.remove();
    }
}


