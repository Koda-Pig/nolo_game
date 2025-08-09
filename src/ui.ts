export interface UIOptions {
  width: number;
  height: number;
}

export class UI {
  readonly width: number;
  readonly height: number;

  // Minimal DOM-based UI elements to mimic Ruby2D UI
  start_button: HTMLButtonElement;
  speed_down_btn: HTMLButtonElement;
  speed_up_btn: HTMLButtonElement;
  button_text: HTMLSpanElement;
  alert_message: HTMLDivElement;

  constructor({ width, height }: UIOptions) {
    this.width = width;
    this.height = height;

    // Container
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "10px";
    container.style.left = "10px";
    container.style.display = "flex";
    container.style.gap = "12px";
    document.body.appendChild(container);

    // Start/Restart button
    this.start_button = document.createElement("button");
    this.button_text = document.createElement("span");
    this.button_text.textContent = "BEGIN";
    this.start_button.appendChild(this.button_text);
    container.appendChild(this.start_button);

    // Speed controls
    this.speed_down_btn = document.createElement("button");
    this.speed_down_btn.textContent = "-";
    container.appendChild(this.speed_down_btn);

    this.speed_up_btn = document.createElement("button");
    this.speed_up_btn.textContent = "+";
    container.appendChild(this.speed_up_btn);

    // Alert message
    this.alert_message = document.createElement("div");
    this.alert_message.textContent = "DRAW SOME SQUARES FIRST!";
    this.alert_message.style.position = "absolute";
    this.alert_message.style.left = `${width / 2 - 50 * 8}px`;
    this.alert_message.style.top = `${height / 2 - 50}px`;
    this.alert_message.style.color = "white";
    this.alert_message.style.fontSize = "50px";
    this.alert_message.style.display = "none";
    document.body.appendChild(this.alert_message);
  }

  reset_btn_colors(): void {
    this.speed_down_btn.style.backgroundColor = "";
    this.speed_up_btn.style.backgroundColor = "";
    this.start_button.style.backgroundColor = "";
  }
}
