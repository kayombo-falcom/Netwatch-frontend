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
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: u.color }}
                      >{u.initials}</div>
                      <span className="font-medium text-foreground text-xs">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs border ${
                      u.group === "Admins" ? "bg-purple-50 text-purple-700 border-purple-200" :
                      u.group === "Staff" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      u.group === "Students" ? "bg-green-50 text-green-700 border-green-200" :
                      u.group === "Guests" ? "bg-muted text-muted-foreground border-border" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>{u.group}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.devices}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground/80">{u.data}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.policy}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.lastSeen}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded hover:bg-blue-50 hover:text-blue-600 text-muted-foreground/60 transition-colors" title="View"><Eye size={13} /></button>
                      <button className="p-1.5 rounded hover:bg-amber-50 hover:text-amber-600 text-muted-foreground/60 transition-colors" title="Assign policy"><Shield size={13} /></button>
                      <button className="p-1.5 rounded hover:bg-red-50 hover:text-red-500 text-muted-foreground/60 transition-colors" title="Disable"><Ban size={13} /></button>
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
