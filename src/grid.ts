interface GridOptions {
  width: number;
  height: number;
  block_size: number;
  color?: string;
}

export class Grid {
  width: number;
  height: number;
  block_size: number;
  color: string;

  constructor({ width, height, block_size, color = "#333" }: GridOptions) {
    this.width = width;
    this.height = height;
    this.block_size = block_size;
    this.color = color;
  }

  draw(ctx: CanvasRenderingContext2D) {
    // horizontal lines
    for (let i = 0; i < this.height; i += this.block_size) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(this.width, i);
      ctx.stroke();
    }

    // vertical lines
    for (let i = 0; i < this.width; i += this.block_size) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, this.height);
      ctx.stroke();
    }
  }
}
