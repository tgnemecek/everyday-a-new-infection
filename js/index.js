function enemySpawner(numberOfEnemies) {
    for (let i = 0; i < numberOfEnemies; i++) {
        let enemy = new Enemy(path);
        gameState.enemies.push(enemy);
    }
}

function setupNodes() {
    let nodePositions = [
        { left: "10%", top: "10%"}
    ]
    nodePositions.forEach((position) => {
        let node = new Node(position);
        gameState.nodes.push(node);
    })
    // let nodes = $('.node');
    // nodes.on('click', function() {
    //     // Create Tower
    //     if (!$(this).children().length) {
    //         let tower = new Tower($(this));
    //         $(this).append(tower.jquery);
    //         gameState.towers.push(tower);
    //     }
    // })
}

// function update(rate) {
//     setInterval(() => {
//         gameState.towers.forEach((tower) => {
//             tower.update();
//         })
//     }, rate)
// }

function start() {
    gameState.modifyHp(100);
    gameState.modifyMoney(300);
    setupNodes();
    enemySpawner(10);
}

start();