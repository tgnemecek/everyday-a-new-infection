let gameState;

const env = window.location.href.search('http') === -1 ?
                'development' : 'production';

const debugOptions = {
    startLevel: 4,
    skipIntro: true,
    loadAudio: false
}

let audioManager;
let windowSize = {};

const mainMenu = $('.main-menu');
const game = $('.game');

function a() {
    gameState.enemies.forEach((enemy) => {
        if (!enemy.isAlive) debugger;
    })
}