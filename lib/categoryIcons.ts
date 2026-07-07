/**
 * Emoji icons per category slug, used until a real image is uploaded via
 * /admin/categories. Once a category has an imageUrl, that always wins —
 * this is purely a presentable fallback.
 *
 * Add more slugs here as you add categories.
 */
const CATEGORY_ICONS: Record<string, string> = {
  "dairy-eggs": "🥛",
  "fruits-vegetables": "🥦",
  bakery: "🍞",
  snacks: "🍪",
  beverages: "🥤",
  household: "🧹",
  "meat-fish": "🍗",
  "personal-care": "🧴",
  "baby-care": "🍼",
  "frozen-food": "🧊",
  "atta-rice-oil": "🌾",
  "masala-spices": "🌶️",
  "tea-coffee": "☕",
  "cleaning-essentials": "🧼",
};

export function getCategoryIcon(slug: string): string {
  return CATEGORY_ICONS[slug] ?? "🛒";
}
