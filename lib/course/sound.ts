/**
 * One sound for the shell. A later subject does not bring its own audio.
 */

export type SoundCue = "ui" | "correct" | "wrong" | "fail" | "clear";

type Note = {
  at: number;
  freq: number;
  dur: number;
  type: OscillatorType;
  gain: number;
  to?: number;
  noise?: boolean;
};

const POP: Record<SoundCue, Note[]> = {
  ui: [{ at: 0, freq: 620, to: 1180, dur: 0.09, type: "sine", gain: 0.16 }],
  correct: [
    { at: 0, freq: 740, to: 980, dur: 0.08, type: "sine", gain: 0.15 },
    { at: 0.09, freq: 980, to: 1420, dur: 0.12, type: "sine", gain: 0.14 },
  ],
  wrong: [
    { at: 0, freq: 320, to: 140, dur: 0.16, type: "sine", gain: 0.16 },
    { at: 0, freq: 180, dur: 0.08, type: "triangle", gain: 0.08, noise: true },
  ],
  fail: [
    { at: 0, freq: 360, to: 220, dur: 0.12, type: "sine", gain: 0.15 },
    { at: 0.12, freq: 240, to: 140, dur: 0.16, type: "sine", gain: 0.14 },
  ],
  clear: [
    { at: 0, freq: 523, dur: 0.1, type: "sine", gain: 0.13 },
    { at: 0.09, freq: 659, dur: 0.1, type: "sine", gain: 0.13 },
    { at: 0.18, freq: 784, dur: 0.1, type: "sine", gain: 0.13 },
    { at: 0.27, freq: 1046, dur: 0.2, type: "sine", gain: 0.14 },
  ],
};

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new window.AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function beep(context: AudioContext, note: Note) {
  const start = context.currentTime + note.at;
  const end = start + note.dur;
  const amp = context.createGain();
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(Math.max(note.gain, 0.0002), start + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, end);
  amp.connect(context.destination);

  if (note.noise) {
    const frames = Math.max(1, Math.floor(context.sampleRate * note.dur));
    const buffer = context.createBuffer(1, frames, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(amp);
    source.start(start);
    source.stop(end + 0.02);
    return;
  }

  const osc = context.createOscillator();
  osc.type = note.type;
  osc.frequency.setValueAtTime(Math.max(note.freq, 40), start);
  if (note.to) osc.frequency.exponentialRampToValueAtTime(Math.max(note.to, 40), end);
  osc.connect(amp);
  osc.start(start);
  osc.stop(end + 0.02);
}

export function playCue(cue: SoundCue) {
  const context = audio();
  if (!context) return;
  for (const note of POP[cue]) beep(context, note);
}
