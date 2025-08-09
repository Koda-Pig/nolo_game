import { Grid } from "./grid";
import { GameOfLife } from "./game";
import { UI } from "./ui";

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

const ui = new UI({ width: GAME_WIDTH, height: GAME_HEIGHT });

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
      ui.alert_message.style.display = "block";
    },
    onHideAlert: () => {
      ui.alert_message.style.display = "none";
    },
    onSetButtonText: (text) => {
      ui.button_text.textContent = text;
    },
    onSetStartButtonColor: (color) => {
      ui.start_button.style.backgroundColor = color;
    },
    onSetSpeedDownColor: (color) => {
      ui.speed_down_btn.style.backgroundColor = color;
    },
    onSetSpeedUpColor: (color) => {
      ui.speed_up_btn.style.backgroundColor = color;
    },
    onResetButtonColors: () => ui.reset_btn_colors()
  }
});

// Input wiring
ui.start_button.addEventListener("click", () => {
  game.handle_mouse_down({ x: -1, y: -1, hitStartButton: true });
});
ui.speed_down_btn.addEventListener("click", () => {
  game.handle_mouse_down({ x: -1, y: -1, hitSpeedDown: true });
});
ui.speed_up_btn.addEventListener("click", () => {
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
