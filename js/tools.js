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
    addSpriteAnimation: function (jquery, numberOfSprites, speed, extras) {
        extras = extras || "infinite normal forwards";
        jquery.css({
            backgroundSize: `${numberOfSprites*100}% auto`,
            animation: `sprite-animation ${speed}s steps(${numberOfSprites-1}) ${extras}`
        })
        return {
            stop: function() {
                jquery.css({
                    animation: "none"
                });
            }
        };
    },
    addRotationLoop: function (jquery, speed, direction) {
        
        jquery.css({
            animation: `rotation-animation ${speed}s linear infinite`,
            animationDirection: direction || "normal"
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