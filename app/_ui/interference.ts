export const fieldWidth = 800;
export const fieldHeight = 490;
export const waveInk = "#b4c8a2";

const rows = 69;
const steps = 177;
const stride = 6;
const samples = new Float32Array(rows * steps * stride);
const brightness = new Float32Array(rows);

for (let row = 0; row < rows; row++) {
  const depth = row / (rows - 1) * 2.24 - 1.12;
  const edge = Math.sin(Math.PI * (row + .7) / (rows + .4));
  brightness[row] = .13 + edge * .59;
  for (let step = 0; step < steps; step++) {
    const x = step / (steps - 1) * 2.96 - 1.48;
    const first = Math.hypot(x + .41, depth + .10);
    const second = Math.hypot(x - .41, depth - .10);
    const envelope = 108 * Math.max(0, 1 - (x / 1.49) ** 2) * Math.exp(-depth * depth * .92);
    const firstGain = envelope / (1 + first * 1.22);
    const secondGain = envelope / (1 + second * 1.22);
    const at = (row * steps + step) * stride;
    samples[at] = 400 + x * 196 + depth * 93;
    samples[at + 1] = 247 + depth * 150 + x * 29;
    samples[at + 2] = Math.sin(first * 17) * firstGain;
    samples[at + 3] = Math.cos(first * 17) * firstGain;
    samples[at + 4] = Math.sin(second * 17) * secondGain;
    samples[at + 5] = Math.cos(second * 17) * secondGain;
  }
}

export function traceInterference(
  time: number,
  phase: number,
  startLine: (opacity: number) => void,
  drawPoint: (x: number, y: number, first: boolean) => void,
  endLine: () => void,
) {
  const offset = time - phase * Math.PI / 180;
  const firstCos = Math.cos(time);
  const firstSin = Math.sin(time);
  const secondCos = Math.cos(offset);
  const secondSin = Math.sin(offset);
  let at = 0;
  for (let row = 0; row < rows; row++) {
    startLine(brightness[row]);
    for (let step = 0; step < steps; step++) {
      const height = samples[at + 2] * firstCos - samples[at + 3] * firstSin
        + samples[at + 4] * secondCos - samples[at + 5] * secondSin;
      drawPoint(samples[at], samples[at + 1] - height, step === 0);
      at += stride;
    }
    endLine();
  }
}
