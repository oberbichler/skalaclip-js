"use strict";

class Particle {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
    }

    static random() {
        var random = function(min, max) {
            return Math.floor(min + Math.random() * (max - min));
        }

        var x = random(0.0, window.innerWidth);
        var y = random(0.0, window.innerHeight);

        var vx = random(-5.0, 5.0);
        var vy = random(-5.0, 5.0);

        return new Particle(x, y, vx, vy);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) {
            this.vx *= -1;
        }
        if (this.y < 0) {
            this.vy *= -1;
        }
        if (this.x > window.innerWidth) {
            this.vx *= -1;
        }
        if (this.y > window.innerHeight) {
            this.vy *= -1;
        }
    }
}

function getFactor() {
    var isRetina = (window.devicePixelRatio > 1);

    var isIOS = ((ctx.webkitBackingStorePixelRatio < 2) || (ctx.webkitBackingStorePixelRatio == undefined));

    if (isRetina && isIOS) {
        return 2;	
    } else {
        return 1;
    }
}

function createRandomLines(numberOfLines) {
    var lines = [];

    for(var i = 0; i < numberOfLines; i++) {
        var a = Particle.random();
        var b = Particle.random();

        lines.push([a, b]);
    }

    return lines;
}

var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");

var factor = getFactor();

var lines = createRandomLines(10);

var frameWidth = 500.;
var frameHeight = 500.;

function loop() {
    clear();
    draw();
    update();
    queue();
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
    canvas.width = window.innerWidth * factor;
    canvas.height = window.innerHeight * factor;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(factor, factor);

    var frameLeft = (window.innerWidth - frameWidth) * 0.5;
    var frameRight = (window.innerWidth + frameWidth) * 0.5;
    var frameTop = (window.innerHeight - frameHeight) * 0.5;
    var frameBottom = (window.innerHeight + frameHeight) * 0.5;

    ctx.save();
    ctx.shadowBlur=30;
    ctx.shadowColor="rgb(210,210,210)";
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.rect(frameLeft, frameTop, frameWidth, frameHeight);
    ctx.fill();
    ctx.restore();

    var clipper = new Clipper(new Point(frameLeft, frameTop),
        new Point(frameRight, frameBottom));

    for (var i = 0; i < lines.length; i++) {
        var [a, b] = lines[i]

        ctx.save();
        ctx.strokeStyle="rgb(210,210,210)";
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.restore();

        var [result, a, b] = clipper.clipLine(a, b);

        if (result < 0) {
            continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.restore();
    }
}

function update() {
    for (var i = 0; i < lines.length; i++) {
        var [a, b] = lines[i]
        a.update();
        b.update();
    }
}

function queue() {
    window.requestAnimationFrame(loop);
}

loop();
