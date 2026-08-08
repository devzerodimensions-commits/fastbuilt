// Shared image → WebP helpers (all dashboard uploads are stored as WebP).

export function loadImage(src, crossOrigin = true) {
  return new Promise((resolve, reject) => {
    const im = new Image()
    if (crossOrigin) im.crossOrigin = 'anonymous'
    im.onload = () => resolve(im)
    im.onerror = reject
    im.src = src
  })
}

export async function fileToWebp(file, maxDim = 1600, quality = 0.85) {
  const dataUrl = await new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file)
  })
  const img = await loadImage(dataUrl, false)
  let { width, height } = img
  if (Math.max(width, height) > maxDim) {
    const s = maxDim / Math.max(width, height)
    width = Math.round(width * s); height = Math.round(height * s)
  }
  const canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  canvas.getContext('2d').drawImage(img, 0, 0, width, height)
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/webp', quality))
  if (!blob) throw new Error('WebP conversion not supported by this browser')
  return new File([blob], (file.name.replace(/\.[^.]+$/, '') || 'image') + '.webp', { type: 'image/webp' })
}
