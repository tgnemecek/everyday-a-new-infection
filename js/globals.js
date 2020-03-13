let game = $('.game');
let mover = $('.mover');
let path = $('.path');
let hpDisplayer = $('.hp');
let moneyDisplayer = $('.money');
let fps = 60;

let gameState = {
    enemies: [],
    nodes: [],
    towers: [],
    projectiles: [],
    hp: 0,
    modifyHp: function (amount) {
        gameState.hp += amount;
        hpDisplayer.text("HP: " + gameState.hp);
    },
    money: 0,
    modifyMoney: function (amount) {
        gameState.money += amount;
        moneyDisplayer.text("MONEY: " + gameState.money)
    }
}