/** Base URL for the versioned Django API — see Netwach-backend/netwatch_backend/urls.py,
 * which only serves routes under /api/v1/ (no unversioned fallback). */
export const BACKEND_API_BASE = `${process.env.BACKEND_URL}/api/v1`;
