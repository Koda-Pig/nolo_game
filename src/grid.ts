interface GridOptions {
  width: number;
  height: number;
  block_size: number;
  color?: string;
  line_width?: number;
}

export class Grid {
  width: number;
  height: number;
  block_size: number;
  color: string;
  line_width: number;

  constructor({
    width,
    height,
    block_size,
    color = "#333",
    line_width = 1
  }: GridOptions) {
    this.width = width;
    this.height = height;
    this.block_size = block_size;
    this.color = color;
    this.line_width = line_width;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.line_width;

    // Offset by 0.5px for odd line widths to align to device pixels
    const half = (ctx.lineWidth % 2) / 2;
    const minX = half;
    const minY = half;
    const maxX = this.width - half;
    const maxY = this.height - half;

    // horizontal lines
    for (let y = 0; y < this.height; y += this.block_size) {
      const yy = Math.min(y + half, maxY);
      ctx.beginPath();
      ctx.moveTo(minX, yy);
      ctx.lineTo(maxX, yy);
      ctx.stroke();
    }

    // vertical lines
    for (let x = 0; x < this.width; x += this.block_size) {
      const xx = Math.min(x + half, maxX);
      ctx.beginPath();
      ctx.moveTo(xx, minY);
      ctx.lineTo(xx, maxY);
      ctx.stroke();
    }
  }
}
