import { Document, NodeIO, type Node, type Mesh } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, prune, flatten, join } from '@gltf-transform/functions'
import sharp from 'sharp'

const MAX_TEXTURE_SIZE = 512
const WEBP_QUALITY = 62

export async function compressGlb(inputBuffer: Buffer): Promise<Buffer> {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)

  const doc = await io.readBinary(new Uint8Array(inputBuffer))

  await doc.transform(
    dedup(),
    prune(),
    flatten(),
    join(),
    compressTexturesToWebP(),
    normalizeToUnitWidth(),
  )

  const outputArray = await io.writeBinary(doc)
  return Buffer.from(outputArray)
}

type Mat4 = number[]

function trsToMatrix(t: [number, number, number], r: [number, number, number, number], s: [number, number, number]): Mat4 {
  const [tx, ty, tz] = t
  const [x, y, z, w] = r
  const [sx, sy, sz] = s
  const xx = x * x, xy = x * y, xz = x * z, xw = x * w
  const yy = y * y, yz = y * z, yw = y * w
  const zz = z * z, zw = z * w
  // Column-major 4x4
  return [
    (1 - 2 * (yy + zz)) * sx, (2 * (xy + zw)) * sx,     (2 * (xz - yw)) * sx,     0,
    (2 * (xy - zw)) * sy,     (1 - 2 * (xx + zz)) * sy,  (2 * (yz + xw)) * sy,     0,
    (2 * (xz + yw)) * sz,     (2 * (yz - xw)) * sz,      (1 - 2 * (xx + yy)) * sz, 0,
    tx,                        ty,                         tz,                        1,
  ]
}

function multiplyMatrices(a: Mat4, b: Mat4): Mat4 {
  const out: Mat4 = new Array(16).fill(0)
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      out[col * 4 + row] =
        a[0 * 4 + row] * b[col * 4 + 0] +
        a[1 * 4 + row] * b[col * 4 + 1] +
        a[2 * 4 + row] * b[col * 4 + 2] +
        a[3 * 4 + row] * b[col * 4 + 3]
    }
  }
  return out
}

function traverseNodes(node: Node, parentMatrix: Mat4, callback: (node: Node, worldMatrix: Mat4) => void): void {
  const t = node.getTranslation() as [number, number, number]
  const r = node.getRotation() as [number, number, number, number]
  const s = node.getScale() as [number, number, number]
  const localMatrix = trsToMatrix(t, r, s)
  const worldMatrix = multiplyMatrices(parentMatrix, localMatrix)
  callback(node, worldMatrix)
  for (const child of node.listChildren()) {
    traverseNodes(child, worldMatrix, callback)
  }
}

const IDENTITY: Mat4 = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
]

function normalizeToUnitWidth() {
  return (doc: Document) => {
    try {
      const scene = doc.getRoot().listScenes()[0]
      if (!scene) {
        console.warn('[compress-glb] No scene found, skipping normalization')
        return
      }

      let minX = Infinity, maxX = -Infinity
      let minZ = Infinity, maxZ = -Infinity

      for (const rootNode of scene.listChildren()) {
        traverseNodes(rootNode, IDENTITY, (node: Node, worldMatrix: Mat4) => {
          const mesh: Mesh | null = node.getMesh()
          if (!mesh) return

          for (const primitive of mesh.listPrimitives()) {
            const posAccessor = primitive.getAttribute('POSITION')
            if (!posAccessor) continue

            const arr = posAccessor.getArray()
            if (!arr) continue
            for (let i = 0; i < arr.length; i += 3) {
              const wx = worldMatrix[0] * arr[i] + worldMatrix[4] * arr[i + 1] + worldMatrix[8] * arr[i + 2] + worldMatrix[12]
              const wz = worldMatrix[2] * arr[i] + worldMatrix[6] * arr[i + 1] + worldMatrix[10] * arr[i + 2] + worldMatrix[14]
              // update min/max...
              if (wx < minX) minX = wx
              if (wx > maxX) maxX = wx
              if (wz < minZ) minZ = wz
              if (wz > maxZ) maxZ = wz
            }
          }
        })
      }

      const xExtent = maxX - minX
      const zExtent = maxZ - minZ
      const maxHorizontalDim = Math.max(xExtent, zExtent)

      if (!isFinite(maxHorizontalDim) || maxHorizontalDim <= 0) {
        console.warn('[compress-glb] Could not measure model dimensions, skipping normalization')
        return
      }

      const scaleFactor = 1.0 / maxHorizontalDim

      for (const rootNode of scene.listChildren()) {
        const currentScale = rootNode.getScale() as [number, number, number]
        rootNode.setScale([
          currentScale[0] * scaleFactor,
          currentScale[1] * scaleFactor,
          currentScale[2] * scaleFactor,
        ])
      }

      console.log(`[compress-glb] Normalized model: ${maxHorizontalDim.toFixed(3)} -> 1.0m (scale factor: ${scaleFactor.toFixed(4)})`)
    } catch (err) {
      console.warn('[compress-glb] Normalization failed, skipping:', err)
    }
  }
}

function compressTexturesToWebP() {
  return async (doc: Document) => {
    const textures = doc.getRoot().listTextures()
    for (const texture of textures) {
      const image = texture.getImage()
      if (!image) continue

      try {
        const webpBuffer = await sharp(Buffer.from(image))
          .resize({
            width: MAX_TEXTURE_SIZE,
            height: MAX_TEXTURE_SIZE,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: WEBP_QUALITY })
          .toBuffer()

        texture.setImage(new Uint8Array(webpBuffer))
        texture.setMimeType('image/webp')
      } catch (err) {
        console.warn(`[compress-glb] WebP conversion failed for texture, keeping original:`, err)
      }
    }
  }
}
