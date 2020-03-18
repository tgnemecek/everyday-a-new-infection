let tools = {
    randomize: function (input, range) {
        input = Number(input);
        let random = (Math.random() * range) - range / 2;
        return input + random;
    },
    getRandomizedColor: function (r, g, b) {
        r = tools.randomize(r, 80);
        g = tools.randomize(g, 80);
        b = tools.randomize(b, 80);
        return `rgb(${r}, ${g}, ${b})`
    },
    distanceTo: function (x1, y1, x2, y2) {
        let disX = x1 - x2;
        let disY = y1 - y2;
        return Math.sqrt(disX * disX + disY * disY);
    },
    addSpriteAnimation: function (jquery, spriteSheet, numberOfSprites, speed) {
        jquery.css({
            backgroundImage: `url(${spriteSheet})`,
            backgroundPosition: 0,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${numberOfSprites*100}% auto`,
            animation: `sprite-animation ${speed}s steps(${numberOfSprites-1}) infinite`
        })
        return {
            stop: function() {
                jquery.css({
                    animation: "none"
                });
            }
        };
    },
    addRotationLoop: function (jquery, image, speed) {
        jquery.css({
            backgroundImage: `url(${image})`,
            backgroundPosition: 0,
            backgroundRepeat: "no-repeat",
            backgroundSize: `100%`,
            animation: `rotation-animation ${speed}s linear infinite`
        })
        return {
            stop: function() {
                jquery.css({
                    animation: "none"
                });
            }
        };
    }
}