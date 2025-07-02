"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

type LogEntry = {
  id: string;
  created_at: string;
  amount: number;
  note?: string;
  from_user_id: string;
  to_user_id: string;
  from_user_email?: string;
  to_user_email?: string;
  admin_email?: string;
};

export default function AllocationAuditPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filters, setFilters] = useState({
    adminEmail: "",
    userEmail: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const fetchLogs = async () => {
      const supabase = createClient();
      let query = supabase.rpc("get_allocation_logs");

      if (filters.adminEmail) {
        query = query.ilike("admin_email", `%${filters.adminEmail}%`);
      }
      if (filters.userEmail) {
        query = query.or(
          `from_user_email.ilike.%${filters.userEmail}%,to_user_email.ilike.%${filters.userEmail}%`,
        );
      }
      if (filters.startDate) {
        query = query.gte("created_at", filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte("created_at", filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching allocation logs:", error);
      } else {
        setLogs(data as LogEntry[]);
      }
    };

    fetchLogs();
  }, [filters]);

  const filteredLogs = logs.filter((log) => {
    // This client-side filtering might be redundant if the API does it all,
    // but can be useful for instant feedback or if API filtering is limited.
    return (
      log.admin_email?.includes(filters.adminEmail) &&
      (log.from_user_email?.includes(filters.userEmail) ||
        log.to_user_email?.includes(filters.userEmail))
    );
  });

  return (
    <div className="p-4 max-w-2xl w-full mx-auto">
      <h1 className="text-xl font-bold mb-4">Fund Allocation Audit</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div>
          <Label htmlFor="adminEmail" className="mb-1.5 block">
            Admin Email
          </Label>
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
          <Label htmlFor="userEmail" className="mb-1.5 block">
            User Email
          </Label>
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
            <Label htmlFor="startDate" className="mb-1.5 block">
              Start Date
            </Label>
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
            <Label htmlFor="endDate" className="mb-1.5 block">
              End Date
            </Label>
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
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <div key={log.id} className="p-4 border rounded-lg">
            <p>
              <strong>Amount:</strong> {log.amount}
            </p>
            <p>
              <strong>From:</strong> {log.from_user_email}
            </p>
            <p>
              <strong>To:</strong> {log.to_user_email}
            </p>
            <p>
              <strong>By:</strong> {log.admin_email}
            </p>
            <p>
              <strong>Date:</strong> {format(new Date(log.created_at), "PPP p")}
            </p>
            {log.note && (
              <p>
                <strong>Note:</strong> {log.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
