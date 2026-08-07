"use client";

import { useState } from "react";
import { CheckCircle, Save } from "lucide-react";
import { Card } from "@/components/card";
import { CardHeader } from "@/components/card-header";
import { Btn } from "@/components/btn";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {[
        {
          title: "Network Configuration",
          fields: [
            { label: "Network Name (SSID)", value: "NetWatch-Main", type: "text" },
            { label: "Admin Email", value: "admin@netwatch.local", type: "email" },
            { label: "DNS Primary", value: "8.8.8.8", type: "text" },
            { label: "DNS Secondary", value: "1.1.1.1", type: "text" },
          ]
        },
        {
          title: "Alerts & Notifications",
          fields: [
            { label: "Alert Email", value: "alerts@netwatch.local", type: "email" },
            { label: "High Load Threshold (%)", value: "75", type: "number" },
          ]
        },
      ].map(section => (
        <Card key={section.title}>
          <CardHeader title={section.title} />
          <div className="p-5 space-y-4">
            {section.fields.map(f => (
              <div key={f.label}>
                <label className="text-xs font-medium text-muted-foreground block mb-1">{f.label}</label>
                <input
                  type={f.type}
                  defaultValue={f.value}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:bg-card transition-colors"
                />
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Card>
        <CardHeader title="Toggles" />
        <div className="p-5 space-y-3">
          {[
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
        <Btn variant="secondary" size="md">Discard</Btn>
      </div>
    </div>
  );
}
