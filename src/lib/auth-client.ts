/** Hard-navigates to the login page (optionally flagging why), tearing down every
 * client-held cache/store with it — required for a real logout, not just an in-app
 * screen change. */
const redirectToLogin = (reason?: string) => {
  window.location.href = reason ? `/login?reason=${reason}` : "/login";
};

/** Clears the session cookies and sends the user back to the login page. */
export const logout = async () => {
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
  redirectToLogin();
};

/** Redirects to login after a password change that already cleared the session
 * cookies server-side (see /api/auth/change-password). */
export const logoutForPasswordChange = () => redirectToLogin("password-changed");

/** Renews the access token and resets the backend's idle-session clock.
 * Returns whether the session is still valid. */
export const refreshSession = async (): Promise<boolean> => {
  const res = await fetch("/api/auth/refresh", { method: "POST" }).catch(() => null);
  return !!res && res.ok;
};
