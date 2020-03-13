function randomize(input, range) {
    let random = Math.floor(Math.random() * range) - range / 2;
    return input + random;
}

function getRandomizedColor(r, g, b) {
    r = randomize(r, 80);
    g = randomize(g, 80);
    b = randomize(b, 80);
    return `rgb(${r}, ${g}, ${b})`
}

function distanceTo(x1, y1, x2, y2) {
    let disX = x1 - x2;
    let disY = y1 - y2;
    return Math.sqrt(disX * disX + disY * disY);
}