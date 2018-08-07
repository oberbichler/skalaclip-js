class Particle {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }

  static random() {
    function rnd(min, max) {
      return Math.floor(min + Math.random() * (max - min));
    }

    const x = rnd(0.0, window.innerWidth);
    const y = rnd(0.0, window.innerHeight);

    const vx = rnd(-5.0, 5.0);
    const vy = rnd(-5.0, 5.0);

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

function getFactor(ctx) {
  const isRetina = (window.devicePixelRatio > 1);

  const isIOS = ((ctx.webkitBackingStorePixelRatio < 2)
    || (ctx.webkitBackingStorePixelRatio === undefined));

  if (isRetina && isIOS) {
    return 2;
  }

  return 1;
}

function createRandomLines(numberOfLines) {
  const lines = [];

  for (let i = 0; i < numberOfLines; i += 1) {
    const a = Particle.random();
    const b = Particle.random();

    lines.push([a, b]);
  }

  return lines;
}

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const factor = getFactor(ctx);

const lines = createRandomLines(10);

const frameWidth = 500.0;
const frameHeight = 500.0;

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

  const frameLeft = (window.innerWidth - frameWidth) * 0.5;
  const frameRight = (window.innerWidth + frameWidth) * 0.5;
  const frameTop = (window.innerHeight - frameHeight) * 0.5;
  const frameBottom = (window.innerHeight + frameHeight) * 0.5;

  ctx.save();
  ctx.shadowBlur = 30;
  ctx.shadowColor = 'rgb(210,210,210)';
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.rect(frameLeft, frameTop, frameWidth, frameHeight);
  ctx.fill();
  ctx.restore();

  const clipper = new Clipper(new Point(frameLeft, frameTop),
    new Point(frameRight, frameBottom));

  for (let i = 0; i < lines.length; i += 1) {
    let [a, b] = lines[i];

    ctx.save();
    ctx.strokeStyle = 'rgb(210,210,210)';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.restore();

    let result = 0;

    [result, a, b] = clipper.clipLine(a, b);

    if (result > -1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function update() {
  for (let i = 0; i < lines.length; i += 1) {
    const [a, b] = lines[i];
    a.update();
    b.update();
  }
}

function queue() {
  window.requestAnimationFrame(loop);
}

loop();
