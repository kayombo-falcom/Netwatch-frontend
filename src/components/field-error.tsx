export const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive mt-1">{message}</p> : null;
