export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except whitespace and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/\./g, '') // Remove periods
    .replace(/,/g, ''); // Remove commas
}