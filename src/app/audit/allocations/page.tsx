"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

      const userMap = new Map<string, string>();
      allUsersData?.users.forEach((u) => userMap.set(u.id, u.email || ""));

      const logsWithEmails = (logData || []).map((log) => ({
        ...log,
        user_email: userMap.get(log.user_id),
        admin_email: userMap.get(log.admin_id),
      }));

      setLogs(logsWithEmails);
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const { adminEmail, userEmail, startDate, endDate } = filters;

    const matchesAdmin = adminEmail
      ? log.admin_email?.toLowerCase().includes(adminEmail.toLowerCase())
      : true;
    const matchesUser = userEmail
      ? log.user_email?.toLowerCase().includes(userEmail.toLowerCase())
      : true;
    const logDate = new Date(log.timestamp);
    const matchesStart = startDate ? logDate >= new Date(startDate) : true;
    const matchesEnd = endDate ? logDate <= new Date(endDate) : true;

    return matchesAdmin && matchesUser && matchesStart && matchesEnd;
  });

  return (
    <div className="max-w-6xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">📜 Fund Allocation Audit Logs</h1>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div>
          <Label>Filter by Admin Email</Label>
          <Input
            placeholder="admin@example.com"
            value={filters.adminEmail}
            onChange={(e) =>
              setFilters({ ...filters, adminEmail: e.target.value })
            }
          />
        </div>
        <div>
          <Label>Filter by User Email</Label>
          <Input
            placeholder="user@example.com"
            value={filters.userEmail}
            onChange={(e) =>
              setFilters({ ...filters, userEmail: e.target.value })
            }
          />
        </div>
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />
        </div>
        <div>
          <Label>End Date</Label>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Action</th>
              <th className="border p-2">User</th>
              <th className="border p-2">Admin</th>
              <th className="border p-2">Previous Amount</th>
              <th className="border p-2">New Amount</th>
              <th className="border p-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td className="border p-2">{log.action}</td>
                <td className="border p-2">{log.user_email || log.user_id}</td>
                <td className="border p-2">
                  {log.admin_email || log.admin_id}
                </td>
                <td className="border p-2 text-center">
                  {log.previous_amount ?? "-"}
                </td>
                <td className="border p-2 text-center">
                  {log.new_amount ?? "-"}
                </td>
                <td className="border p-2">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
