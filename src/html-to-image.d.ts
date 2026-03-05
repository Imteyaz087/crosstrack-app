declare module 'html-to-image' {
  export function toPng(node: HTMLElement, options?: Record<string, unknown>): Promise<string>
  export function toJpeg(node: HTMLElement, options?: Record<string, unknown>): Promise<string>
}
