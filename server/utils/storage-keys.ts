/**
 * S3 key helpers — follow the architecture's storage key structure:
 *
 *   restaurants/{restaurantId}/dishes/{dishId}/source/{filename}
 *   restaurants/{restaurantId}/dishes/{dishId}/generated/{filename}
 *   restaurants/{restaurantId}/dishes/{dishId}/qr/{filename}
 */

export function sourceImageKey(
  restaurantId: string,
  dishId: string,
  filename: string,
): string {
  return `restaurants/${restaurantId}/dishes/${dishId}/source/${filename}`
}

export function generatedAssetKey(
  restaurantId: string,
  dishId: string,
  filename: string,
): string {
  return `restaurants/${restaurantId}/dishes/${dishId}/generated/${filename}`
}

export function qrImageKey(
  restaurantId: string,
  dishId: string,
  filename: string,
): string {
  return `restaurants/${restaurantId}/dishes/${dishId}/qr/${filename}`
}
