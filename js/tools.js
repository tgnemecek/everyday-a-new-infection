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
    },
    findCircleLineIntersections: function(x1, y1, x2, y2, r, h, k) {
        function getSlope(x1, y1, x2, y2) {
            let slope = (y2 - y1) / (x2 - x1);
            return slope;
        }
        
        function getYIntercept(x1, y1, slope) {
            let yIntercept = y1 - (slope * x1);
            return yIntercept;
        }
    
        let m = getSlope(x1, y1, x2, y2);
        let n = getYIntercept(x1, y1, m);
    
    
        // circle: (x - h)^2 + (y - k)^2 = r^2
        // line: y = m * x + n
        // r: circle radius
        // h: x value of circle centre
        // k: y value of circle centre
        // m: slope
        // n: y-intercept
    
        // get a, b, c values
        var a = 1 + m*m;
        var b = -h * 2 + (m * (n - k)) * 2;
        var c = h*h + (n - k)*(n - k) - r*r;
    
        // get discriminant
        var d = b*b - 4 * a * c;
        if (d >= 0) {
            // insert into quadratic formula
            var intersections = [
                (-b + Math.sqrt(b*b - 4 * a * c)) / (2 * a),
                (-b - Math.sqrt(b*b - 4 * a * c)) / (2 * a)
            ];
            if (d == 0) {
                // only 1 intersection
                return [intersections[0]];
            }
            return intersections;
        }
        // no intersection
        return [];
    }
}