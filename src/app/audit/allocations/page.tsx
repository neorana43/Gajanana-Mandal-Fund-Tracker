"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

type LogEntry = {
  id: string;
  action: "insert" | "update" | "delete";
  user_id: string;
  admin_id: string;
  previous_amount: number | null;
  new_amount: number | null;
  timestamp: string;
  user_email?: string;
  admin_email?: string;
};

export default function AllocationAuditPage() {
  const supabase = createClient();

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filters, setFilters] = useState({
    adminEmail: "",
    userEmail: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const fetchLogs = async () => {
      const [{ data: allUsersData }, { data: logData }] = await Promise.all([
        supabase.auth.admin.listUsers(),
        supabase
          .from("allocation_logs")
          .select("*")
          .order("timestamp", { ascending: false }),
      ]);

      const emailMap = new Map<string, string>();
      allUsersData?.users?.forEach((u) => {
        if (u.id && u.email) emailMap.set(u.id, u.email);
      });

      const mappedLogs = (logData || []).map((log: any) => ({
        ...log,
        user_email: emailMap.get(log.user_id) || log.user_id,
        admin_email: emailMap.get(log.admin_id) || log.admin_id,
      }));

      setLogs(mappedLogs);
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const { adminEmail, userEmail, startDate, endDate } = filters;
    const logDate = new Date(log.timestamp);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    return (
      (!adminEmail || log.admin_email?.includes(adminEmail)) &&
      (!userEmail || log.user_email?.includes(userEmail)) &&
      (!start || logDate >= start) &&
      (!end || logDate <= end)
    );
  });

  return (
    <div className="p-4 pb-24 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Fund Allocation Audit</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div>
          <Label htmlFor="adminEmail">Admin Email</Label>
          <Input
            id="adminEmail"
            placeholder="Search by admin"
            value={filters.adminEmail}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, adminEmail: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="userEmail">User Email</Label>
          <Input
            id="userEmail"
            placeholder="Search by user"
            value={filters.userEmail}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, userEmail: e.target.value }))
            }
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startDate: e.target.value }))
              }
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
            />
          </div>
        </div>
      </div>

      {/* Log List */}
      <ul className="space-y-3">
        {filteredLogs.map((log) => (
          <li key={log.id} className="bg-white rounded-xl shadow border p-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold">{log.action.toUpperCase()}</span>
              <span className="text-muted-foreground">
                {format(new Date(log.timestamp), "dd MMM yyyy")}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{log.admin_email}</span> changed
              allocation for{" "}
              <span className="font-medium">{log.user_email}</span>
              <br />
              {log.previous_amount ?? 0} →{" "}
              <span className="text-primary font-semibold">
                {log.new_amount}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
