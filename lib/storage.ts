export function productImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${imagePath}`
}
