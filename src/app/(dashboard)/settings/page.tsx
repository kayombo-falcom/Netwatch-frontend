"use client";

import { useState } from "react";
import { CheckCircle, Save } from "lucide-react";
import { Card } from "@/components/card";
import { CardHeader } from "@/components/card-header";
import { Btn } from "@/components/btn";
import { FieldError } from "@/components/field-error";
import { RequiredMark } from "@/components/required-mark";
import { Skeleton, SkeletonText } from "@/components/skeleton";
import { isValidEmail, isValidIPv4, isInRange } from "@/lib/validation";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";

type Field = {
  key: string;
  label: string;
  value: string;
  type: "text" | "email" | "number";
  validate: (v: string) => string | null;
};

const required = (v: string) => (v.trim() ? null : "This field is required.");
const email = (v: string) => (!v.trim() ? "This field is required." : isValidEmail(v) ? null : "Enter a valid email address.");
const ip = (v: string) => (!v.trim() ? "This field is required." : isValidIPv4(v) ? null : "Enter a valid IPv4 address.");
const percent = (v: string) => (isInRange(v, 0, 100) ? null : "Enter a number between 0 and 100.");

const SECTIONS: { title: string; fields: Field[] }[] = [
  {
    title: "Network Configuration",
    fields: [
      { key: "ssid", label: "Network Name (SSID)", value: "NetWatch-Main", type: "text", validate: required },
      { key: "adminEmail", label: "Admin Email", value: "admin@netwatch.local", type: "email", validate: email },
      { key: "dnsPrimary", label: "DNS Primary", value: "8.8.8.8", type: "text", validate: ip },
      { key: "dnsSecondary", label: "DNS Secondary", value: "1.1.1.1", type: "text", validate: ip },
    ],
  },
  {
    title: "Alerts & Notifications",
    fields: [
      { key: "alertEmail", label: "Alert Email", value: "alerts@netwatch.local", type: "email", validate: email },
      { key: "highLoadThreshold", label: "High Load Threshold (%)", value: "75", type: "number", validate: percent },
    ],
  },
];

const ALL_FIELDS = SECTIONS.flatMap(s => s.fields);

export default function SettingsPage() {
  const loading = useSimulatedLoading();
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(ALL_FIELDS.map(f => [f.key, f.value]))
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attempted, setAttempted] = useState(false);

  const errors = Object.fromEntries(ALL_FIELDS.map(f => [f.key, f.validate(values[f.key])]));
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSave = () => {
    setAttempted(true);
    if (hasErrors) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDiscard = () => {
    setValues(Object.fromEntries(ALL_FIELDS.map(f => [f.key, f.value])));
    setTouched({});
    setAttempted(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {SECTIONS.map(section => (
        <Card key={section.title}>
          <CardHeader title={section.title} />
          <div className="p-5 space-y-4">
            {loading ? section.fields.map(f => (
              <div key={f.key} className="space-y-1.5">
                <SkeletonText width="90px" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            )) : section.fields.map(f => {
              const showError = touched[f.key] || attempted;
              const fieldErr = errors[f.key];
              return (
                <div key={f.key}>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">{f.label}<RequiredMark /></label>
                  <input
                    type={f.type}
                    value={values[f.key]}
                    onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                    onBlur={() => setTouched(t => ({ ...t, [f.key]: true }))}
                    aria-invalid={showError && !!fieldErr}
                    className={`w-full text-sm border rounded-lg px-3 py-2 bg-muted/50 focus:outline-none focus:ring-2 focus:bg-card transition-colors ${showError && fieldErr ? "border-destructive focus:ring-destructive" : "border-border focus:ring-ring"}`}
                  />
                  {showError && <FieldError message={fieldErr ?? undefined} />}
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      <Card>
        <CardHeader title="Toggles" />
        <div className="p-5 space-y-3">
          {loading ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="space-y-1.5">
                <SkeletonText width="180px" />
                <SkeletonText width="240px" />
              </div>
              <Skeleton className="w-10 h-5.5 rounded-full" />
            </div>
          )) : [
            { label: "Auto-block unknown devices", desc: "Automatically block devices not in the allowlist", on: true },
            { label: "Guest network isolation", desc: "Guests cannot reach internal network segments", on: true },
            { label: "Firmware auto-update", desc: "Install AP firmware updates during off-hours", on: false },
            { label: "Audit logging", desc: "Log all admin actions to the audit trail", on: true },
          ].map(t => (
            <div key={t.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{t.label}</p>
                <p className="text-xs text-muted-foreground/60">{t.desc}</p>
              </div>
              <button className={`relative w-10 h-5.5 rounded-full transition-colors ${t.on ? "bg-primary" : "bg-muted"}`}
                style={{ height: 22 }}>
                <span className={`absolute top-0.5 w-4.5 h-4.5 bg-card rounded-full shadow transition-transform ${t.on ? "translate-x-5" : "translate-x-0.5"}`}
                  style={{ width: 18, height: 18, transform: t.on ? "translateX(20px)" : "translateX(2px)" }} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-2">
        <Btn variant="primary" size="md" onClick={handleSave}>
          {saved ? <><CheckCircle size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
        </Btn>
        <Btn variant="secondary" size="md" onClick={handleDiscard}>Discard</Btn>
      </div>
    </div>
  );
}
