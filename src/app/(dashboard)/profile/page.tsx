"use client";

import { useState } from "react";
import { Pencil, Save, Lock, Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/card";
import { CardHeader } from "@/components/card-header";
import { Btn } from "@/components/btn";
import { Tag } from "@/components/tag";
import { UserStatusBadge } from "@/components/user-status-badge";
import { FieldError } from "@/components/field-error";
import { RequiredMark } from "@/components/required-mark";
import { userToDraft, type UserFormDraft } from "@/components/user-form-dialog";
import { Skeleton, SkeletonCircle, SkeletonText } from "@/components/skeleton";
import { useUsersStore, type StoreUser } from "@/hooks/use-users-store";
import { tintContrastText, USER_ROLE_TINT } from "@/lib/colors";
import { isValidEmail } from "@/lib/validation";
import { logoutForPasswordChange } from "@/lib/auth-client";
import { toast } from "@/lib/toast-store";

/** There's no real auth session yet, so this stands in for the signed-in user — same account the header avatar and profile menu represent. */
const CURRENT_USER_ID = 1;

/** Placeholder so hooks below always have a shape to work with while the real user list is still loading. */
const EMPTY_USER: StoreUser = { id: 0, name: "", email: "", initials: "", role: "", status: "active", lastSeen: "", color: "var(--chart-1)" };

const fieldClass = "w-full px-3 py-2 text-sm border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary";
const labelClass = "text-xs font-medium text-muted-foreground mb-1 block";

export default function ProfilePage() {
  const { users, loading, updateUser } = useUsersStore();
  const currentUser = users.find(u => u.id === CURRENT_USER_ID) ?? users[0] ?? EMPTY_USER;
  const { firstName, lastName } = userToDraft(currentUser);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserFormDraft>(() => userToDraft(currentUser));
  const [touched, setTouched] = useState<{ firstName?: boolean; lastName?: boolean; email?: boolean }>({});
  const [attempted, setAttempted] = useState(false);

  const patch = (changes: Partial<UserFormDraft>) => setDraft(d => ({ ...d, ...changes }));

  const firstNameError = !draft.firstName.trim() ? "First name is required." : null;
  const lastNameError = !draft.lastName.trim() ? "Last name is required." : null;
  const emailError = !draft.email.trim() ? "Email is required." : !isValidEmail(draft.email) ? "Enter a valid email address." : null;
  const hasErrors = !!(firstNameError || lastNameError || emailError);

  const startEditing = () => {
    setDraft(userToDraft(currentUser));
    setTouched({});
    setAttempted(false);
    setEditing(true);
  };

  const handleSave = () => {
    setAttempted(true);
    if (hasErrors) return;
    updateUser(currentUser.id, {
      name: `${draft.firstName.trim()} ${draft.lastName.trim()}`,
      email: draft.email.trim(),
      role: currentUser.role,
      status: currentUser.status,
      password: "",
    });
    setEditing(false);
  };

  const handleCancel = () => setEditing(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwTouched, setPwTouched] = useState<{ current?: boolean; next?: boolean; confirm?: boolean }>({});
  const [pwAttempted, setPwAttempted] = useState(false);
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwServerError, setPwServerError] = useState<string | null>(null);

  const currentPasswordError = !currentPassword ? "Current password is required." : pwServerError;
  const newPasswordError = !newPassword ? "New password is required." : newPassword.length < 8 ? "Password must be at least 8 characters." : null;
  const confirmPasswordError = !confirmPassword ? "Please confirm your new password." : confirmPassword !== newPassword ? "Passwords do not match." : null;
  const pwHasErrors = !!(currentPasswordError || newPasswordError || confirmPasswordError);

  const startChangingPassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwTouched({});
    setPwAttempted(false);
    setPwServerError(null);
    setChangingPassword(true);
  };

  const handleUpdatePassword = async () => {
    setPwAttempted(true);
    setPwServerError(null);
    if (pwHasErrors) return;

    setPwSubmitting(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = body.current_password?.[0] ?? body.new_password?.[0] ?? body.detail ?? "Couldn't update your password. Please try again.";
        setPwServerError(message);
        return;
      }
      // Changing your password invalidates the current session too — force a fresh login.
      logoutForPasswordChange();
    } catch {
      toast.error("Couldn't update your password", "Couldn't reach the server. Please try again.");
    } finally {
      setPwSubmitting(false);
    }
  };

  const handleCancelPassword = () => setChangingPassword(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6 self-start">
        <Card className="lg:sticky lg:top-4">
          <div className="p-5 flex flex-col items-center text-center">
            {loading ? (
              <>
                <SkeletonCircle size={64} />
                <SkeletonText width="120px" className="mt-3" />
                <SkeletonText width="160px" className="mt-1.5" />
              </>
            ) : (
              <>
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0 ${tintContrastText(USER_ROLE_TINT[currentUser.role] ?? "muted")}`}
                  style={{ backgroundColor: currentUser.color }}
                >
                  {currentUser.initials}
                </div>
                <h2 className="font-semibold text-foreground text-lg mt-3 truncate max-w-full">{currentUser.name}</h2>
                <p className="text-sm text-muted-foreground truncate max-w-full">{currentUser.email}</p>
              </>
            )}
          </div>

          <CardHeader title="Account Info" subtitle="Managed by your administrator" />
          <div className="p-5 space-y-4 text-sm">
            {loading ? (
              <>
                <div><SkeletonText width="30px" className="mb-1.5" /><Skeleton className="h-5 w-20 rounded-md" /></div>
                <div><SkeletonText width="35px" className="mb-1.5" /><Skeleton className="h-5 w-16 rounded-md" /></div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-xs text-muted-foreground/60 mb-0.5">Role</p>
                  <Tag color={USER_ROLE_TINT[currentUser.role] ?? "muted"}>{currentUser.role}</Tag>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground/60 mb-0.5">Status</p>
                  <UserStatusBadge status={currentUser.status} />
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader
            title="Personal Details"
            subtitle={editing ? "Update your name and email address" : "Your basic account information"}
            action={!editing && !loading && <Btn variant="secondary" size="xs" onClick={startEditing}><Pencil size={12} /> Edit</Btn>}
          />
          <div className="p-5">
            {loading ? (
              <div className="grid grid-cols-2 gap-4">
                <div><SkeletonText width="70px" className="mb-1.5" /><SkeletonText width="100px" /></div>
                <div><SkeletonText width="70px" className="mb-1.5" /><SkeletonText width="100px" /></div>
                <div className="col-span-2"><SkeletonText width="40px" className="mb-1.5" /><SkeletonText width="180px" /></div>
              </div>
            ) : editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>First Name<RequiredMark /></label>
                    <input
                      className={`${fieldClass} ${(touched.firstName || attempted) && firstNameError ? "border-destructive focus:ring-destructive" : ""}`}
                      value={draft.firstName}
                      onChange={e => patch({ firstName: e.target.value })}
                      onBlur={() => setTouched(t => ({ ...t, firstName: true }))}
                      autoFocus
                    />
                    {(touched.firstName || attempted) && <FieldError message={firstNameError ?? undefined} />}
                  </div>
                  <div>
                    <label className={labelClass}>Last Name<RequiredMark /></label>
                    <input
                      className={`${fieldClass} ${(touched.lastName || attempted) && lastNameError ? "border-destructive focus:ring-destructive" : ""}`}
                      value={draft.lastName}
                      onChange={e => patch({ lastName: e.target.value })}
                      onBlur={() => setTouched(t => ({ ...t, lastName: true }))}
                    />
                    {(touched.lastName || attempted) && <FieldError message={lastNameError ?? undefined} />}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Email<RequiredMark /></label>
                  <input
                    type="email"
                    className={`${fieldClass} ${(touched.email || attempted) && emailError ? "border-destructive focus:ring-destructive" : ""}`}
                    value={draft.email}
                    onChange={e => patch({ email: e.target.value })}
                    onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  />
                  {(touched.email || attempted) && <FieldError message={emailError ?? undefined} />}
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Btn variant="secondary" onClick={handleCancel}>Cancel</Btn>
                  <Btn variant="primary" onClick={handleSave}><Save size={13} /> Save Changes</Btn>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground/60 mb-0.5">First Name</p>
                  <p className="font-medium text-foreground">{firstName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground/60 mb-0.5">Last Name</p>
                  <p className="font-medium text-foreground">{lastName || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground/60 mb-0.5">Email</p>
                  <p className="font-medium text-foreground">{currentUser.email}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Security"
            subtitle={changingPassword ? "Choose a new password" : "Change your account password"}
            action={!changingPassword && !loading && <Btn variant="secondary" size="xs" onClick={startChangingPassword}><Lock size={12} /> Change Password</Btn>}
            divider={changingPassword}
          />
          {changingPassword && (
            <div className="p-5 space-y-4">
              <div>
                <label htmlFor="current-password" className={labelClass}>Current Password<RequiredMark /></label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    id="current-password"
                    name="current-password"
                    autoComplete="current-password"
                    className={`${fieldClass} pr-9 ${(pwTouched.current || pwAttempted) && currentPasswordError ? "border-destructive focus:ring-destructive" : ""}`}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    onBlur={() => setPwTouched(t => ({ ...t, current: true }))}
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowCurrent(s => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {(pwTouched.current || pwAttempted) && <FieldError message={currentPasswordError ?? undefined} />}
              </div>
              <div>
                <label htmlFor="new-password" className={labelClass}>New Password<RequiredMark /></label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    id="new-password"
                    name="new-password"
                    autoComplete="new-password"
                    className={`${fieldClass} pr-9 ${(pwTouched.next || pwAttempted) && newPasswordError ? "border-destructive focus:ring-destructive" : ""}`}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    onBlur={() => setPwTouched(t => ({ ...t, next: true }))}
                  />
                  <button type="button" onClick={() => setShowNew(s => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {(pwTouched.next || pwAttempted) && <FieldError message={newPasswordError ?? undefined} />}
              </div>
              <div>
                <label htmlFor="confirm-new-password" className={labelClass}>Confirm New Password<RequiredMark /></label>
                <input
                  type={showNew ? "text" : "password"}
                  id="confirm-new-password"
                  name="confirm-new-password"
                  autoComplete="new-password"
                  className={`${fieldClass} ${(pwTouched.confirm || pwAttempted) && confirmPasswordError ? "border-destructive focus:ring-destructive" : ""}`}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onBlur={() => setPwTouched(t => ({ ...t, confirm: true }))}
                />
                {(pwTouched.confirm || pwAttempted) && <FieldError message={confirmPasswordError ?? undefined} />}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Btn variant="secondary" onClick={handleCancelPassword} disabled={pwSubmitting}>Cancel</Btn>
                <Btn variant="primary" onClick={handleUpdatePassword} disabled={pwSubmitting}>
                  <Lock size={13} /> {pwSubmitting ? "Updating…" : "Update Password"}
                </Btn>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
