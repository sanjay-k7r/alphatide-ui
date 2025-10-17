const ADMIN_USER_IDS = new Set([
  "fbfd40fa-c682-4288-a521-1b24a92d0237",
  "ab344949-8f67-4b23-a1ee-472d3413f92a",
])

export function isAdminUser(userId: string | undefined | null): boolean {
  return Boolean(userId && ADMIN_USER_IDS.has(userId))
}
