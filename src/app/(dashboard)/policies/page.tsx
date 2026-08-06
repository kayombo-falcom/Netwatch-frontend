"use client";

import { useState } from "react";
import { Plus, ChevronRight, Users, CheckCircle, XCircle, Clock, Save, Play } from "lucide-react";
import { Card, CardHeader, Btn } from "@/app/_components/dashboard-ui";

export default function PoliciesPage() {
  const [simResult, setSimResult] = useState<"idle" | "allowed" | "blocked">("idle");
  const [simUser, setSimUser] = useState("Staff");
  const [simTime, setSimTime] = useState("14:00");

  const runSim = () => {
    const hour = parseInt(simTime.split(":")[0]);
    const blocked = simUser === "Guests" && (hour < 8 || hour > 20);
    setSimResult(blocked ? "blocked" : "allowed");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Policy List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-foreground/80">Policies</h3>
          <Btn variant="primary" size="xs"><Plus size={11} /> New</Btn>
        </div>
        {[
          { name: "Guest Wi-Fi", group: "Guests", color: "bg-muted text-muted-foreground border-border" },
          { name: "Staff Default", group: "Staff", color: "bg-blue-50 text-blue-700 border-blue-200" },
          { name: "Admin Full Access", group: "Admins", color: "bg-purple-50 text-purple-700 border-purple-200" },
          { name: "Student Tier", group: "Students", color: "bg-green-50 text-green-700 border-green-200" },
          { name: "IoT Isolated", group: "IoT", color: "bg-amber-50 text-amber-700 border-amber-200" },
        ].map((p, i) => (
          <Card key={p.name} className={`p-4 cursor-pointer hover:border-blue-300 transition-all ${i === 0 ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded border mt-1 inline-block ${p.color}`}>{p.group}</span>
              </div>
              <ChevronRight size={14} className="text-muted-foreground/60" />
            </div>
          </Card>
        ))}
      </div>

      {/* Policy Builder */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader title="Guest Wi-Fi" subtitle="Applied to Guests group · Active" />
          <div className="p-5 space-y-4">
            {/* Who */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Who</label>
              <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2 text-sm">
                <Users size={14} className="text-muted-foreground" />
                <span className="text-foreground/80">Group: <strong>Guests</strong></span>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">When</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Days", value: "Mon – Sun" },
                  { label: "Hours", value: "08:00 – 20:00" },
                ].map(f => (
                  <div key={f.label} className="bg-muted/50 rounded-lg px-3 py-2">
                    <p className="text-xs text-muted-foreground/60">{f.label}</p>
                    <p className="text-sm font-medium text-foreground/80">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Allow / Block */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Allow</label>
                <div className="space-y-1.5">
                  {["Web Browsing", "Email", "Video Calls (HD)"].map(i => (
                    <div key={i} className="flex items-center gap-2 text-xs text-foreground/80">
                      <CheckCircle size={12} className="text-green-500 shrink-0" /> {i}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Block</label>
                <div className="space-y-1.5">
                  {["P2P / Torrents", "Gaming Servers", "Adult Content"].map(i => (
                    <div key={i} className="flex items-center gap-2 text-xs text-foreground/80">
                      <XCircle size={12} className="text-red-500 shrink-0" /> {i}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Limits */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Limits</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Down", value: "10 Mbps" },
                  { label: "Up", value: "5 Mbps" },
                  { label: "Session", value: "8 hours" },
                ].map(f => (
                  <div key={f.label} className="bg-muted/50 rounded-lg px-3 py-2">
                    <p className="text-xs text-muted-foreground/60">{f.label}</p>
                    <p className="text-sm font-medium text-foreground/80">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Expiry */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              <Clock size={13} className="text-muted-foreground/60" />
              Sessions expire after 8 hours · Re-authentication required
            </div>

            <div className="flex gap-2 pt-2">
              <Btn variant="primary" size="sm"><Save size={13} /> Save Policy</Btn>
              <Btn variant="secondary" size="sm">Cancel</Btn>
            </div>
          </div>
        </Card>

        {/* Simulator */}
        <Card>
          <CardHeader title="Policy Simulator" subtitle="Test how a policy applies to a specific scenario" />
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">User Group</label>
                <select
                  value={simUser}
                  onChange={e => { setSimUser(e.target.value); setSimResult("idle"); }}
                  className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-card focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {["Admins", "Staff", "Students", "Guests", "IoT"].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Time of Day</label>
                <input
                  type="time"
                  value={simTime}
                  onChange={e => { setSimTime(e.target.value); setSimResult("idle"); }}
                  className="w-full text-sm border border-border rounded-lg px-3 py-1.5 bg-card focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <Btn variant="primary" size="sm" onClick={runSim} className="w-full justify-center">
                  <Play size={13} /> Run Simulation
                </Btn>
              </div>
            </div>

            {simResult !== "idle" && (
              <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                simResult === "allowed"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}>
                {simResult === "allowed"
                  ? <CheckCircle size={18} className="text-green-600 shrink-0" />
                  : <XCircle size={18} className="text-red-600 shrink-0" />
                }
                <div>
                  <p className="font-semibold text-sm">
                    {simResult === "allowed" ? "ACCESS ALLOWED" : "ACCESS BLOCKED"}
                  </p>
                  <p className="text-xs mt-0.5 opacity-75">
                    {simResult === "allowed"
                      ? `${simUser} group is permitted at ${simTime}. Limits: 10↓ / 5↑ Mbps.`
                      : `Guest access is restricted outside 08:00–20:00. Current time (${simTime}) is outside the allowed window.`
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
