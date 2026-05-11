import { Document, NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, prune, textureResize, flatten, join } from '@gltf-transform/functions'
import sharp from 'sharp'

const MAX_TEXTURE_SIZE = 1024

export async function compressGlb(inputBuffer: Buffer): Promise<Buffer> {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)

  const doc = await io.readBinary(new Uint8Array(inputBuffer))

  await doc.transform(
    dedup(),
    prune(),
    flatten(),
    join(),
    textureResize({ size: [MAX_TEXTURE_SIZE, MAX_TEXTURE_SIZE] }),
    compressTexturesToWebP(),
  )

  const outputArray = await io.writeBinary(doc)
  return Buffer.from(outputArray)
}

function compressTexturesToWebP() {
  return async (doc: Document) => {
    const textures = doc.getRoot().listTextures()
    for (const texture of textures) {
      const image = texture.getImage()
      if (!image) continue

      try {
        const webpBuffer = await sharp(Buffer.from(image))
          .webp({ quality: 80 })
          .toBuffer()

        texture.setImage(new Uint8Array(webpBuffer))
        texture.setMimeType('image/webp')
      } catch {
        // Keep original if conversion fails
      }
    }
  }
}
