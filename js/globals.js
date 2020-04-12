const version = '0.9.0';

let gameState;

const env = window.location.href.search('http') === -1 ?
                'development' : 'production';

const debugOptions = {
    startLevel: 3,
    skipIntro: true,
    loadAudio: true
}

let audioManager;
let windowSize = {};

const mainMenu = $('.main-menu');
const game = $('.game');