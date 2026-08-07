"use client";

import { useState } from "react";
import { Search, Plus, Eye, Shield, Ban } from "lucide-react";
import { Card } from "@/components/card";
import { Btn } from "@/components/btn";
import { usersData } from "@/app/_lib/dashboard-data";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("All");
  const groups = ["All", "Admins", "Staff", "Students", "Guests", "IoT"];

  const filtered = usersData.filter(u => {
    if (groupFilter !== "All" && u.group !== groupFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users…"
            className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-56"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {groups.map(g => (
            <button
              key={g}
              onClick={() => setGroupFilter(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${groupFilter === g ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-muted"}`}
            >{g}</button>
          ))}
        </div>
        <Btn variant="primary" size="sm" className="ml-auto"><Plus size={13} /> Add User</Btn>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["User", "Group", "Devices", "Data Used", "Policy", "Last Seen", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground/60 text-sm">No users match your filters.</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-muted transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          u.group === "Staff" || u.group === "Guests" || u.group === "IoT" ? "text-(--brand-navy)" : "text-white"
                        }`}
                        style={{ backgroundColor: u.color }}
                      >{u.initials}</div>
                      <span className="font-medium text-foreground text-xs">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs border ${
                      u.group === "Admins" ? "bg-tint-navy-bg text-tint-navy-fg border-border" :
                      u.group === "Staff" ? "bg-tint-aqua-bg text-tint-aqua-fg border-border" :
                      u.group === "Students" ? "bg-tint-teal-bg text-tint-teal-fg border-border" :
                      u.group === "Guests" ? "bg-muted text-muted-foreground border-border" :
                      "bg-tint-amber-bg text-tint-amber-fg border-border"
                    }`}>{u.group}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.devices}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground/80">{u.data}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.policy}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.lastSeen}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded hover:bg-tint-aqua-bg hover:text-tint-aqua-fg text-muted-foreground/60 transition-colors" title="View"><Eye size={13} /></button>
                      <button className="p-1.5 rounded hover:bg-tint-amber-bg hover:text-tint-amber-fg text-muted-foreground/60 transition-colors" title="Assign policy"><Shield size={13} /></button>
                      <button className="p-1.5 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground/60 transition-colors" title="Disable"><Ban size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
