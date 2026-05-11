export function toDataUrl(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`
}

export function isInlineAsset(storageKey: string | null | undefined): boolean {
  return typeof storageKey === 'string' && storageKey.startsWith('inline:')
}
