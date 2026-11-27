// The Django backend only serves routes under /api/v1/, with no unversioned fallback.
export const BACKEND_API_BASE = `${process.env.BACKEND_URL}/api/v1`;
