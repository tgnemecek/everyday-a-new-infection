let gameState;

const env = window.location.href.search('http') === -1 ?
                'development' : 'production';

const debugOptions = {
    startLevel: 2,
    skipIntro: true,
    loadAudio: true
}

let audioManager;
let windowSize = {};

const mainMenu = $('.main-menu');
const game = $('.game');