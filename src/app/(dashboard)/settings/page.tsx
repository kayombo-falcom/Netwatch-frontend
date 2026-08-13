"use client";

import { useState } from "react";
import { CheckCircle, Save } from "lucide-react";
import { Card } from "@/components/card";
import { CardHeader } from "@/components/card-header";
import { Btn } from "@/components/btn";
import { Skeleton, SkeletonText } from "@/components/skeleton";
import { SegmentedToggle } from "@/components/segmented-toggle";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";

type Toggle = { label: string; desc: string; on: boolean };

const TOGGLE_SECTIONS: { title: string; toggles: Toggle[] }[] = [
  {
    title: "Alerts & Notifications Preferences",
    toggles: [
      { label: "Email alerts", desc: "Receive alerts via email", on: true },
      { label: "Push notifications", desc: "Receive real-time push notifications for critical events", on: true },
      { label: "Critical alerts only", desc: "Only notify for high and critical severity events", on: false },
      { label: "Weekly summary report", desc: "Send a weekly digest of network activity", on: true },
    ],
  },
];

const ALL_TOGGLES = TOGGLE_SECTIONS.flatMap(s => s.toggles);

export default function SettingsPage() {
  const loading = useSimulatedLoading();
  const [saved, setSaved] = useState(false);
  const [toggleValues, setToggleValues] = useState<Record<string, boolean>>(
    Object.fromEntries(ALL_TOGGLES.map(t => [t.label, t.on]))
  );

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDiscard = () => {
    setToggleValues(Object.fromEntries(ALL_TOGGLES.map(t => [t.label, t.on])));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {TOGGLE_SECTIONS.map(section => (
        <Card key={section.title}>
          <CardHeader title={section.title} />
          <div className="p-5 space-y-3">
            {loading ? Array.from({ length: section.toggles.length }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="space-y-1.5">
                  <SkeletonText width="180px" />
                  <SkeletonText width="240px" />
                </div>
                <Skeleton className="w-16 h-6.5 rounded-lg" />
              </div>
            )) : section.toggles.map(t => (
              <div key={t.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground/60">{t.desc}</p>
                </div>
                <SegmentedToggle
                  on={toggleValues[t.label]}
                  label={t.label}
                  onChange={() => setToggleValues(v => ({ ...v, [t.label]: !v[t.label] }))}
                />
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div className="flex gap-2">
        <Btn variant="primary" size="md" onClick={handleSave}>
          {saved ? <><CheckCircle size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
        </Btn>
        <Btn variant="secondary" size="md" onClick={handleDiscard}>Discard</Btn>
      </div>
    </div>
  );
}
