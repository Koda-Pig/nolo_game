import { Grid } from "./grid";
import { GameOfLife } from "./game";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

// Match the Ruby defaults for easier parity
const GAME_WIDTH = 1440;
const GAME_HEIGHT = 810;
const BLOCK_SIZE = 20;

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

const grid = new Grid({
  width: canvas.width,
  height: canvas.height,
  block_size: BLOCK_SIZE
});

const start_btn = document.getElementById("start-btn") as HTMLButtonElement;
const start_btn_text = document.getElementById(
  "start-btn-text"
) as HTMLSpanElement;
const speed_down_btn = document.getElementById(
  "speed-down-btn"
) as HTMLButtonElement;
const speed_up_btn = document.getElementById(
  "speed-up-btn"
) as HTMLButtonElement;
const alert_el = document.getElementById("alert-message") as HTMLDivElement;

// center alert message based on canvas dimensions
alert_el.style.left = `${GAME_WIDTH / 2 - 50 * 8}px`;
alert_el.style.top = `${GAME_HEIGHT / 2 - 50}px`;

const game = new GameOfLife({
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  block_size: BLOCK_SIZE,
  callbacks: {
    onAddSquare: (_x, _y) => {
      // drawing handled in render step; kept for parity hook
    },
    onRemoveSquare: (_x, _y) => {
      // drawing handled in render step; kept for parity hook
    },
    onShowAlert: () => {
      alert_el.hidden = false;
    },
    onHideAlert: () => {
      alert_el.hidden = true;
    },
    onSetButtonText: (text) => {
      start_btn_text.textContent = text;
    },
    onSetStartButtonColor: (color) => {
      start_btn.style.backgroundColor = color;
    },
    onSetSpeedDownColor: (color) => {
      speed_down_btn.style.backgroundColor = color;
    },
    onSetSpeedUpColor: (color) => {
      speed_up_btn.style.backgroundColor = color;
    },
    onResetButtonColors: () => {
      speed_down_btn.style.backgroundColor = "";
      speed_up_btn.style.backgroundColor = "";
      start_btn.style.backgroundColor = "";
    }
  }
});

// Input wiring
start_btn.addEventListener("click", () => {
  game.handle_mouse_down({ x: -1, y: -1, hitStartButton: true });
});
speed_down_btn.addEventListener("click", () => {
  game.handle_mouse_down({ x: -1, y: -1, hitSpeedDown: true });
});
speed_up_btn.addEventListener("click", () => {
  game.handle_mouse_down({ x: -1, y: -1, hitSpeedUp: true });
});

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  game.handle_mouse_down({ x, y });
});
canvas.addEventListener("mouseup", () => game.handle_mouse_up());
window.addEventListener("mouseup", () => game.handle_mouse_up());
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  game.handle_mouse_move({ x, y });
});

// Render helpers
function draw_active_squares(): void {
  ctx.fillStyle = "rgba(0, 255, 0, 1)";
  for (const { x, y } of game.get_alive_squares()) {
    ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
  }
}

// Frame-based loop similar to Ruby's Window.frames % speed
const TARGET_FPS = 60;
const STEP = 1000 / TARGET_FPS; // ms per redraw
let last_time = performance.now();
let accumulator = 0;
let frame_counter = 0;

function animate(time_stamp: number) {
  const delta_time = time_stamp - last_time;
  last_time = time_stamp;
  accumulator += delta_time;

  while (accumulator >= STEP) {
    accumulator -= STEP;
    frame_counter += 1;

    if (game.game_started && frame_counter % game.speed === 0) {
      game.update();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid.draw(ctx);
    draw_active_squares();
  }

  requestAnimationFrame(animate);
}
animate(0);
