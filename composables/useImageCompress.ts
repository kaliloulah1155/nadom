/** Réduit les images avant envoi API (évite 413 / timeout sur VPS). */
export function useImageCompress() {
  async function fileToDataUrl(file: File, maxSide = 1200, quality = 0.72): Promise<string> {
    if (typeof window === 'undefined') return ''
    const url = URL.createObjectURL(file)
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image()
        el.onload = () => resolve(el)
        el.onerror = reject
        el.src = url
      })
      let w = img.width
      let h = img.height
      if (w > maxSide || h > maxSide) {
        if (w >= h) {
          h = Math.round((h * maxSide) / w)
          w = maxSide
        } else {
          w = Math.round((w * maxSide) / h)
          h = maxSide
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return ''
      ctx.drawImage(img, 0, 0, w, h)
      return canvas.toDataURL('image/jpeg', quality)
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  async function compressMany(files: File[]): Promise<string[]> {
    const out: string[] = []
    for (const f of files) {
      try {
        const data = await fileToDataUrl(f)
        if (data) out.push(data)
      } catch {
        /* ignore single file failure */
      }
    }
    return out
  }

  return { fileToDataUrl, compressMany }
}
