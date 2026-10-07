import {Shape, ShapeProps} from '@motion-canvas/2d';
import {BBox, SignalValue, createSignal, SimpleSignal} from '@motion-canvas/core';
import {FONT} from '../config';
import {measure} from '../lib';

export interface WordProps extends ShapeProps {
  content: SignalValue<string>;
  size: number;
  weight?: number;
}

/**
 * A single run of text drawn with fillText at its alphabetic baseline.
 * Local origin = left edge of the baseline, so gradients use x ∈ [0, width].
 * Much lighter than Txt (no DOM layout per frame) and pixel-exact to place.
 */
export class Word extends Shape {
  public readonly content: SimpleSignal<string>;
  public readonly fontPx: number;
  public readonly weight: number;

  public constructor(props: WordProps) {
    super(props);
    this.content = createSignal(props.content);
    this.fontPx = props.size;
    this.weight = props.weight ?? FONT.bold;
  }

  public textWidth() {
    return measure(this.content(), this.fontPx, this.weight);
  }

  protected override getCacheBBox(): BBox {
    const s = this.fontPx;
    const pad = this.lineWidth() + 4;
    return new BBox(-pad, -s * 1.1 - pad, this.textWidth() + pad * 2, s * 1.5 + pad * 2);
  }

  protected override drawShape(context: CanvasRenderingContext2D) {
    const text = this.content();
    if (!text) return;
    context.save();
    this.applyStyle(context);
    context.font = `${this.weight} ${this.fontPx}px ${FONT.family}`;
    (context as any).letterSpacing = `${this.fontPx * FONT.tracking}px`;
    context.textBaseline = 'alphabetic';
    context.textAlign = 'left';
    if (this.fill() !== null) context.fillText(text, 0, 0);
    if (this.lineWidth() > 0 && this.stroke() !== null) {
      context.lineJoin = 'round';
      context.strokeText(text, 0, 0);
    }
    context.restore();
  }
}
