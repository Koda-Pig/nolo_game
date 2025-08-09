import { Grid } from "./grid";
const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const grid = new Grid({
  width: canvas.width,
  height: canvas.height,
  block_size: 10
});

const TARGET_FPS = 30;
const STEP = 1000 / TARGET_FPS; // ms per redraw
let lastTime = performance.now();
let accumulator = 0;

function animate(timeStamp: number) {
  const deltaTime = timeStamp - lastTime;
  lastTime = timeStamp;
  accumulator += deltaTime;

  if (accumulator >= STEP) {
    accumulator %= STEP;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid.draw(ctx);
  }

  requestAnimationFrame(animate);
}
animate(0);
