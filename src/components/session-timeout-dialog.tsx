import { Clock } from "lucide-react";
import { Btn } from "@/components/btn";
import { Modal } from "@/components/modal";
import { tintClass } from "@/lib/colors";

/** Warns of an approaching idle-session timeout with a live countdown, offering to
 * stay signed in or log out immediately. Rendered by `IdleSessionGuard`. */
export const SessionTimeoutDialog = ({
  open, secondsRemaining, onStayLoggedIn, onLogout, staying,
}: {
  open: boolean;
  secondsRemaining: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
  staying: boolean;
}) => (
  <Modal open={open} onClose={onLogout} className="max-w-sm p-6">
    <div className="flex items-center gap-3 mb-3">
      <span className={`p-2 rounded-full ${tintClass("amber")}`}>
        <Clock size={18} />
      </span>
      <h3 className="font-semibold text-foreground">Still there?</h3>
    </div>
    <p className="text-sm text-muted-foreground mb-1">
      You&apos;ve been inactive for a while. For your security, you&apos;ll be signed out in:
    </p>
    <p className="text-3xl font-bold text-foreground tabular-nums my-4 text-center">
      {String(Math.max(secondsRemaining, 0)).padStart(2, "0")}s
    </p>
    <div className="flex gap-2 justify-end">
      <Btn variant="secondary" onClick={onLogout} disabled={staying}>Log out</Btn>
      <Btn variant="primary" onClick={onStayLoggedIn} disabled={staying}>Stay signed in</Btn>
    </div>
  </Modal>
);
