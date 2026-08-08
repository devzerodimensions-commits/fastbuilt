// Apply crop + rotation + flip to an image and return a WebP File.
// Based on the canonical react-easy-crop canvas recipe.
import { loadImage } from './webp'

function rotateSize(width, height, rotation) {
  const rad = (rotation * Math.PI) / 180
  return {
    width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
    height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
  }
}

export async function getEditedWebp(imageSrc, pixelCrop, rotation = 0, flip = { horizontal: false, vertical: false }, name = 'edited', quality = 0.9) {
  const image = await loadImage(imageSrc, true)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const rad = (rotation * Math.PI) / 180
  const { width: bW, height: bH } = rotateSize(image.width, image.height, rotation)

  canvas.width = bW; canvas.height = bH
  ctx.translate(bW / 2, bH / 2)
  ctx.rotate(rad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)
  ctx.drawImage(image, 0, 0)

  const out = document.createElement('canvas')
  const octx = out.getContext('2d')
  const cw = Math.max(1, Math.round(pixelCrop.width))
  const ch = Math.max(1, Math.round(pixelCrop.height))
  out.width = cw; out.height = ch
  octx.drawImage(canvas, Math.round(pixelCrop.x), Math.round(pixelCrop.y), cw, ch, 0, 0, cw, ch)

  const blob = await new Promise((res) => out.toBlob(res, 'image/webp', quality))
  if (!blob) throw new Error('WebP conversion not supported')
  return { file: new File([blob], name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' }), width: cw, height: ch }
}
