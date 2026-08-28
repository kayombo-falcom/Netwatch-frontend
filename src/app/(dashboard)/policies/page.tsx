"use client";

import { useState } from "react";
import { ChevronRight, Plus, Clock, Save } from "lucide-react";
import { Card } from "@/components/card";
import { CardHeader } from "@/components/card-header";
import { Btn } from "@/components/btn";
import { Tag } from "@/components/tag";
import { Dropdown } from "@/components/dropdown";
import { Skeleton, SkeletonText } from "@/components/skeleton";
import { policyCategories as CATEGORIES, policiesData } from "@/app/_lib/dashboard-data";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { toast } from "@/lib/toast-store";

type Group = "Admins" | "Staff" | "Students" | "Guests" | "IoT";

type Policy = {
  name: string;
  category: string;
  group: Group;
  hoursStart: string;
  hoursEnd: string;
  allow: string[];
  block: string[];
  down: number;
  up: number;
  session: number;
};

const GROUP_OPTIONS = ["Admins", "Staff", "Students", "Guests", "IoT"].map(g => ({ label: g, value: g }));
const ALLOW_OPTIONS = ["Web Browsing", "Email", "Video Calls (HD)"];
const BLOCK_OPTIONS = ["P2P / Torrents", "Gaming Servers", "Adult Content"];

/** Builder-only defaults for the fields not tracked in the shared `policiesData` summary. */
const POLICY_DEFAULTS: Record<string, Pick<Policy, "hoursStart" | "hoursEnd" | "allow" | "block" | "down" | "up" | "session">> = {
  "Admin Full Access": { hoursStart: "00:00", hoursEnd: "23:59", allow: ALLOW_OPTIONS, block: [], down: 100, up: 100, session: 24 },
  "Guest Wi-Fi": { hoursStart: "08:00", hoursEnd: "20:00", allow: ["Web Browsing", "Email"], block: BLOCK_OPTIONS, down: 10, up: 5, session: 8 },
  "IoT Isolated": { hoursStart: "00:00", hoursEnd: "23:59", allow: [], block: BLOCK_OPTIONS, down: 2, up: 1, session: 24 },
  "Bandwidth Threshold": { hoursStart: "06:00", hoursEnd: "22:00", allow: ALLOW_OPTIONS, block: ["Gaming Servers"], down: 20, up: 10, session: 12 },
  "Alert Escalation": { hoursStart: "00:00", hoursEnd: "23:59", allow: ALLOW_OPTIONS, block: [], down: 50, up: 50, session: 24 },
  "Report Retention": { hoursStart: "00:00", hoursEnd: "23:59", allow: ALLOW_OPTIONS, block: [], down: 20, up: 10, session: 12 },
};

const INITIAL_POLICIES: Policy[] = policiesData.map(p => ({
  ...p,
  group: p.group as Group,
  ...POLICY_DEFAULTS[p.name],
}));

const fieldClass = "w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-card focus:outline-none focus:ring-2 focus:ring-ring";

export default function PoliciesPage() {
  const loading = useSimulatedLoading();
  const [policies, setPolicies] = useState(INITIAL_POLICIES);
  const [selectedName, setSelectedName] = useState("Guest Wi-Fi");
  const selected = policies.find(p => p.name === selectedName)!;
  const [draft, setDraft] = useState(selected);

  if (draft.name !== selected.name) setDraft(selected);

  const toggleItem = (list: "allow" | "block", item: string) => {
    setDraft(d => ({
      ...d,
      [list]: d[list].includes(item) ? d[list].filter(i => i !== item) : [...d[list], item],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Policies</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage access rules by category</p>
        </div>
        <Btn variant="primary" size="sm"><Plus size={13} /> New Policy</Btn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 items-start">
        {/* Category Nav */}
        <Card className="p-3 space-y-4">
          {loading ? Array.from({ length: 3 }).map((_, g) => (
            <div key={g} className="space-y-1.5">
              <div className="flex items-center gap-2 px-1">
                <Skeleton className="w-6 h-6 rounded-lg" />
                <SkeletonText width="70px" />
              </div>
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-8 rounded-lg" />
              ))}
            </div>
          )) : CATEGORIES.map((cat, ci) => {
            const items = policies.filter(p => p.category === cat.name);
            if (!items.length) return null;
            const Icon = cat.icon;
            return (
              <div key={cat.name} className={ci > 0 ? "pt-4 border-t border-border" : ""}>
                <div className="flex items-center gap-1.5 px-1 mb-2 opacity-50">
                  <Icon size={11} className="text-muted-foreground" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{cat.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{items.length}</span>
                </div>
                <div className="space-y-1 pl-1">
                  {items.map(p => (
                    <button
                      key={p.name}
                      onClick={() => setSelectedName(p.name)}
                      className={`w-full flex items-center justify-between gap-2 pl-2.5 pr-2 py-2 rounded-lg text-sm border-l-2 transition-colors ${
                        p.name === selectedName
                          ? "border-l-primary bg-primary/10 text-primary font-medium"
                          : "border-l-transparent text-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="truncate min-w-0">{p.name}</span>
                      <ChevronRight size={13} className={p.name === selectedName ? "opacity-70 shrink-0" : "text-muted-foreground/50 shrink-0"} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </Card>

        {/* Policy Builder */}
        <Card>
          <CardHeader
            title={selected.name}
            subtitle={`Applied to ${selected.group} group · Active`}
            action={<Tag color={CATEGORIES.find(c => c.name === selected.category)?.color ?? "muted"}>{selected.category}</Tag>}
          />
          {loading ? (
            <div className="p-5 space-y-4">
              <div>
                <SkeletonText width="30px" className="mb-2" />
                <Skeleton className="h-10 rounded-lg" />
              </div>
              <div>
                <SkeletonText width="35px" className="mb-2" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-11 rounded-lg" />
                  <Skeleton className="h-11 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <SkeletonText width="40px" className="mb-2" />
                  <div className="space-y-1.5">
                    <SkeletonText width="70%" /><SkeletonText width="50%" /><SkeletonText width="60%" />
                  </div>
                </div>
                <div>
                  <SkeletonText width="40px" className="mb-2" />
                  <div className="space-y-1.5">
                    <SkeletonText width="70%" /><SkeletonText width="50%" /><SkeletonText width="60%" />
                  </div>
                </div>
              </div>
              <div>
                <SkeletonText width="45px" className="mb-2" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Skeleton className="h-11 rounded-lg" />
                  <Skeleton className="h-11 rounded-lg" />
                  <Skeleton className="h-11 rounded-lg" />
                </div>
              </div>
              <Skeleton className="h-9 rounded-lg" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-28 rounded-lg" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {/* Who */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Who</label>
                <Dropdown
                  options={GROUP_OPTIONS}
                  value={draft.group}
                  onChange={v => setDraft(d => ({ ...d, group: v as Group }))}
                />
              </div>

              {/* Schedule */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">When</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground/60 mb-1">Start</p>
                    <input
                      type="time"
                      value={draft.hoursStart}
                      onChange={e => setDraft(d => ({ ...d, hoursStart: e.target.value }))}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground/60 mb-1">End</p>
                    <input
                      type="time"
                      value={draft.hoursEnd}
                      onChange={e => setDraft(d => ({ ...d, hoursEnd: e.target.value }))}
                      className={fieldClass}
                    />
                  </div>
                </div>
              </div>

              {/* Allow / Block */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Allow</label>
                  <div className="space-y-1.5">
                    {ALLOW_OPTIONS.map(item => (
                      <label key={item} className="flex items-center gap-2 text-xs text-foreground/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={draft.allow.includes(item)}
                          onChange={() => toggleItem("allow", item)}
                          className="accent-status-online"
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Block</label>
                  <div className="space-y-1.5">
                    {BLOCK_OPTIONS.map(item => (
                      <label key={item} className="flex items-center gap-2 text-xs text-foreground/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={draft.block.includes(item)}
                          onChange={() => toggleItem("block", item)}
                          className="accent-status-critical"
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Limits */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Limits</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground/60 mb-1">Down (Mbps)</p>
                    <input
                      type="number"
                      min={0}
                      value={draft.down}
                      onChange={e => setDraft(d => ({ ...d, down: Number(e.target.value) }))}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground/60 mb-1">Up (Mbps)</p>
                    <input
                      type="number"
                      min={0}
                      value={draft.up}
                      onChange={e => setDraft(d => ({ ...d, up: Number(e.target.value) }))}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground/60 mb-1">Session (hrs)</p>
                    <input
                      type="number"
                      min={0}
                      value={draft.session}
                      onChange={e => setDraft(d => ({ ...d, session: Number(e.target.value) }))}
                      className={fieldClass}
                    />
                  </div>
                </div>
              </div>

              {/* Expiry */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                <Clock size={13} className="text-muted-foreground/60" />
                Sessions expire after {draft.session} hours · Re-authentication required
              </div>

              <div className="flex gap-2 pt-2">
                <Btn
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setPolicies(prev => prev.map(p => (p.name === draft.name ? draft : p)));
                    toast.success("Policy saved", `${draft.name} has been updated.`);
                  }}
                >
                  <Save size={13} /> Save Policy
                </Btn>
                <Btn variant="secondary" size="sm" onClick={() => setDraft(selected)}>Cancel</Btn>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
