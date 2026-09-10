// Hard-navigates to login, tearing down all client-held state — needed for a real logout.
const redirectToLogin = (reason?: string) => {
  window.location.href = reason ? `/login?reason=${reason}` : "/login";
};

export const logout = async () => {
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
  redirectToLogin();
};

// Session cookies are already cleared server-side by /api/auth/change-password; this just redirects.
export const logoutForPasswordChange = () => redirectToLogin("password-changed");

// Also resets the backend's idle-session clock, not just the token.
export const refreshSession = async (): Promise<boolean> => {
  const res = await fetch("/api/auth/refresh", { method: "POST" }).catch(() => null);
  return !!res && res.ok;
};
