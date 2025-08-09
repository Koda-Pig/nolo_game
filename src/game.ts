interface GameOptions {
  width: number;
  height: number;
  block_size: number;
  callbacks?: Partial<GameCallbacks>;
}

interface GameCallbacks {
  onAddSquare(x: number, y: number): void;
  onRemoveSquare(x: number, y: number): void;
  onShowAlert(): void;
  onHideAlert(): void;
  onSetButtonText(text: string): void;
  onSetStartButtonColor(color: string): void;
  onSetSpeedDownColor(color: string): void;
  onSetSpeedUpColor(color: string): void;
  onResetButtonColors(): void;
}

type DragMode = "add" | "remove" | null;

export function round_block(n: number, size: number): number {
  return Math.floor(n / size) * size;
}

export class GameOfLife {
  readonly width: number;
  readonly height: number;
  readonly block_size: number;

  game_started: boolean;
  speed: number; // lower is faster; intended range approx 2..60

  private active_squares: Map<string, { x: number; y: number }>;
  private mouse_is_clicked: boolean;
  private drag_mode: DragMode;
  private squares_to_add: Array<[number, number]>;
  private squares_to_remove: Array<[number, number]>;
  private callbacks: GameCallbacks;

  constructor({ width, height, block_size, callbacks }: GameOptions) {
    this.width = width;
    this.height = height;
    this.block_size = block_size;

    this.game_started = false;
    this.active_squares = new Map();
    this.mouse_is_clicked = false;
    this.drag_mode = null;
    this.squares_to_add = [];
    this.squares_to_remove = [];
    this.speed = 10;

    // Default no-op callbacks
    const noop = () => {};
    this.callbacks = {
      onAddSquare: noop,
      onRemoveSquare: noop,
      onShowAlert: noop,
      onHideAlert: noop,
      onSetButtonText: noop,
      onSetStartButtonColor: noop,
      onSetSpeedDownColor: noop,
      onSetSpeedUpColor: noop,
      onResetButtonColors: noop,
      ...(callbacks ?? {})
    } as GameCallbacks;
  }

  private key_for(x: number, y: number): string {
    return `${x},${y}`;
  }

  add_square(x: number, y: number): void {
    const key = this.key_for(x, y);
    this.active_squares.set(key, { x, y });
    this.callbacks.onHideAlert();
    this.callbacks.onAddSquare(x, y);
  }

  remove_square(x: number, y: number): void {
    const key = this.key_for(x, y);
    if (!this.active_squares.has(key)) return;
    this.active_squares.delete(key);
    this.callbacks.onRemoveSquare(x, y);
  }

  click_start(): void {
    if (!this.game_started) {
      if (this.active_squares.size === 0) {
        this.callbacks.onShowAlert();
      } else {
        this.callbacks.onHideAlert();
        this.callbacks.onSetButtonText("RESET");
        this.game_started = true;
      }
    } else {
      this.callbacks.onSetButtonText("BEGIN");
      // Clear all squares
      for (const { x, y } of this.active_squares.values()) {
        this.callbacks.onRemoveSquare(x, y);
      }
      this.active_squares.clear();
      this.squares_to_add = [];
      this.squares_to_remove = [];
      this.game_started = false;
    }
  }

  count_neighbors(x: number, y: number): number {
    const offsets: Array<[number, number]> = [
      [this.block_size, 0], // right
      [-this.block_size, 0], // left
      [0, -this.block_size], // top
      [0, this.block_size], // bottom
      [this.block_size, -this.block_size], // top-right
      [this.block_size, this.block_size], // bottom-right
      [-this.block_size, -this.block_size], // top-left
      [-this.block_size, this.block_size] // bottom-left
    ];

    let count = 0;
    for (const [dx, dy] of offsets) {
      let nx = x + dx;
      let ny = y + dy;

      // wrap horizontally
      if (nx >= this.width) nx = 0;
      if (nx < 0) nx = this.width - this.block_size;

      // wrap vertically
      if (ny >= this.height) ny = 0;
      if (ny < 0) ny = this.height - this.block_size;

      if (this.active_squares.has(this.key_for(nx, ny))) count += 1;
    }

    return count;
  }

  private get_all_potential_squares(): Array<[number, number]> {
    const potential = new Set<string>();

    for (const { x, y } of this.active_squares.values()) {
      // current alive square
      potential.add(this.key_for(x, y));

      // neighbors (potential births)
      for (const dx of [-this.block_size, 0, this.block_size]) {
        for (const dy of [-this.block_size, 0, this.block_size]) {
          if (dx === 0 && dy === 0) continue;

          let nx = x + dx;
          let ny = y + dy;

          if (nx >= this.width) nx = 0;
          if (nx < 0) nx = this.width - this.block_size;
          if (ny >= this.height) ny = 0;
          if (ny < 0) ny = this.height - this.block_size;

          potential.add(this.key_for(nx, ny));
        }
      }
    }

    const result: Array<[number, number]> = [];
    for (const key of potential) {
      const [sx, sy] = key.split(",");
      result.push([Number(sx), Number(sy)]);
    }
    return result;
  }

  handle_mouse_down(event: {
    x: number;
    y: number;
    hitStartButton?: boolean;
    hitSpeedDown?: boolean;
    hitSpeedUp?: boolean;
  }): void {
    if (event.hitStartButton) {
      this.click_start();
      this.callbacks.onSetStartButtonColor(`rgb(0,${Math.random() * 255},1)`);
      return;
    }

    if (event.hitSpeedDown) {
      if (this.speed < 60) this.speed += 2;
      this.callbacks.onSetSpeedDownColor(`rgb(0,${Math.random() * 255},1)`);
      return;
    }

    if (event.hitSpeedUp) {
      if (this.speed > 2) this.speed -= 2;
      this.callbacks.onSetSpeedUpColor(`rgb(0,${Math.random() * 255},1)`);
      return;
    }

    this.mouse_is_clicked = true;
    const x = round_block(event.x, this.block_size);
    const y = round_block(event.y, this.block_size);
    const key = this.key_for(x, y);

    if (this.active_squares.has(key)) {
      this.drag_mode = "remove";
      this.remove_square(x, y);
    } else {
      this.drag_mode = "add";
      this.add_square(x, y);
    }
  }

  handle_mouse_up(): void {
    this.mouse_is_clicked = false;
    this.drag_mode = null;
    this.callbacks.onResetButtonColors();
  }

  handle_mouse_move(event: { x: number; y: number }): void {
    if (this.mouse_is_clicked && !this.game_started) {
      const x = round_block(event.x, this.block_size);
      const y = round_block(event.y, this.block_size);
      const key = this.key_for(x, y);

      if (this.drag_mode === "add" && !this.active_squares.has(key)) {
        this.add_square(x, y);
      } else if (this.drag_mode === "remove" && this.active_squares.has(key)) {
        this.remove_square(x, y);
      }
    }
  }

  handle_click_start(): void {
    if (this.game_started) {
      this.reset_game();
    } else {
      this.start_game();
    }
  }

  start_game(): void {
    if (this.active_squares.size === 0) {
      this.callbacks.onShowAlert();
    } else {
      this.callbacks.onHideAlert();
      this.callbacks.onSetButtonText("RESET");
      this.game_started = true;
    }
  }

  reset_game(): void {
    this.callbacks.onSetButtonText("BEGIN");
    for (const { x, y } of this.active_squares.values()) {
      this.callbacks.onRemoveSquare(x, y);
    }
    this.active_squares.clear();
    this.squares_to_add = [];
    this.squares_to_remove = [];
    this.game_started = false;
  }

  update(): void {
    const potential_squares = this.get_all_potential_squares();

    for (const [x, y] of potential_squares) {
      const key = this.key_for(x, y);
      const neighbor_count = this.count_neighbors(x, y);
      const is_alive = this.active_squares.has(key);

      if (is_alive) {
        if (neighbor_count !== 2 && neighbor_count !== 3) {
          this.squares_to_remove.push([x, y]);
        }
      } else if (neighbor_count === 3) {
        this.squares_to_add.push([x, y]);
      }
    }

    for (const [x, y] of this.squares_to_remove) this.remove_square(x, y);
    for (const [x, y] of this.squares_to_add) this.add_square(x, y);

    this.squares_to_add = [];
    this.squares_to_remove = [];
  }

  get_alive_squares(): ReadonlyArray<{ x: number; y: number }> {
    return Array.from(this.active_squares.values());
  }
}
