function onPageLoad() {
    function getCookie(key) {
        let value = "; " + document.cookie;
        let parts = value.split("; " + key + "=");
        if (parts.length === 2) {
            return parts.pop().split(";").shift();
        }
    }
    function startGame(levelIndex, options) {
        game.children().remove();
        if (gameState) {
            clearInterval(gameState.inGameTimeId);
        }
        gameState = new GameState(levelIndex, options);
    }
    function startMainMenu() {
        game.children().remove();
        game.hide();
    
        mainMenu.css({display: "flex"});
    }
    function resizeGameArea() {
        let wrapper = $('.wrapper');
        let widthToHeight = 16 / 9;
        let newWidth = window.innerWidth;
        let newHeight = window.innerHeight;
        let newWidthToHeight = newWidth / newHeight;
        
        if (newWidthToHeight > widthToHeight) {
            newWidth = newHeight * widthToHeight;
            wrapper.css({
                width: newWidth,
                height: newHeight
            })
        } else {
            newHeight = newWidth / widthToHeight;
            wrapper.css({
                width: newWidth,
                height: newHeight
            })
        }
    
        wrapper.css({
            marginTop: (-newHeight / 2),
            marginLeft: (-newWidth / 2)
        })
    
        let minFontSize = 10;
        let fontSize = (newWidth / 100) * 1.5;
        if (fontSize < minFontSize) fontSize = minFontSize;
    
        wrapper.css({
            width: newWidth,
            height: newHeight,
            fontSize: fontSize + "px"
        })
    
        if (gameState) {
            gameState.onResize(newWidth, newHeight);
        }
        windowSize = {
            ...windowSize,
            width: newWidth,
            height: newHeight,
        }
    }
    function goFullScreen() {
        let elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
          } else if (elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen();
          } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            elem.webkitRequestFullscreen();
          } else if (elem.msRequestFullscreen) { /* IE/Edge */
            elem.msRequestFullscreen();
          }
    }
    function saveGame(nextLevel) {
        let pair = "loadLevelIndex=" + nextLevel;
        let expiry = "; expires=Thu, 1 Dec 2100 12:00:00 UTC";
        let cookie = pair + expiry;
        document.cookie = cookie;
    }
    
    windowSize = {
        width: window.innerWidth,
        height: window.innerHeight,
        zoom: 1
    }
    $(window).resize(resizeGameArea);

    let startGameButton = $(`.main-menu .start-game`);
    startGameButton.on('click', () => {
        mainMenu.hide();
        game.show();
        if (env === 'production') {
            goFullScreen();
            startGame({
                levelIndex: 0,
                skipIntro: false,
                startGame,
                saveGame,
                startMainMenu
            });
        } else {
            startGame({
                levelIndex: debugOptions.startLevel,
                skipIntro: debugOptions.skipIntro,
                startGame,
                saveGame,
                startMainMenu
            });
        }
    })
    let loadLevelIndex = getCookie("loadLevelIndex");
    if (loadLevelIndex === undefined) {
        $('.load-game').attr('disabled', true);
    }
    $('.load-game').on('click', () => {
        mainMenu.hide();
        game.show();
        startGame({levelIndex: loadLevelIndex});
    })

    $('.about-button').on('click', () => {
        mainMenu.hide();
        $('.about').show();
    })

    $('.back-to-menu-button').on('click', () => {
        $('.about').hide();
        mainMenu.show();
    })

    resizeGameArea();

    audioManager = new AudioManager();
    if (env === 'production' || debugOptions.loadAudio) {
        audioManager.setup().then(() => {
            startMainMenu();
        })
    } else startMainMenu();
}


$(document).ready(onPageLoad);