declare module 'html2canvas' {
  export interface Html2CanvasOptions {
    scale?: number;
    useCORS?: boolean;
    logging?: boolean;
    backgroundColor?: string | null;
    [key: string]: any;
  }
  export default function html2canvas(
    element: HTMLElement,
    options?: Html2CanvasOptions
  ): Promise<HTMLCanvasElement>;
}

declare module 'jspdf' {
  export class jsPDF {
    constructor(orientation?: string, unit?: string, format?: string);
    addImage(
      imageData: string | HTMLCanvasElement | Uint8Array,
      format: string,
      x: number,
      y: number,
      w: number,
      h: number,
      alias?: string,
      compression?: string,
      rotation?: number
    ): this;
    addPage(format?: string | number[], orientation?: string): this;
    save(filename?: string, options?: { returnPromise?: boolean }): void | Promise<void>;
    setFillColor(r: number, g: number, b: number): this;
    rect(x: number, y: number, w: number, h: number, style?: string): this;
    setTextColor(r: number, g: number, b: number): this;
    setFontSize(size: number): this;
    setFont(fontName: string, fontStyle?: string): this;
    text(
      text: string | string[],
      x: number,
      y: number,
      options?: { align?: 'left' | 'center' | 'right' | 'justify'; [key: string]: any }
    ): this;
    splitTextToSize(text: string, maxW: number, options?: any): string[];
  }
}
