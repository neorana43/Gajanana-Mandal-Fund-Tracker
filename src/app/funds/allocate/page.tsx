"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import * as XLSX from "xlsx";

type User = {
  id: string;
  email?: string;
};

type Allocation = {
  id: string;
  user_id: string;
  amount: number;
  user_email?: string;
  _editedAmount?: string;
};

export default function AllocateFundsPage() {
  const supabase = createClient();

  const [users, setUsers] = useState<User[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentAdminId(user?.id || "");

      const {
        data: { users: allUsers },
        error: userError,
      } = await supabase.auth.admin.listUsers();
      if (userError) {
        setMessage("Failed to load users.");
        return;
      }

      setUsers(allUsers || []);

      const { data: existing } = await supabase
        .from("user_allocations")
        .select("id, user_id, amount")
        .order("created_at", { ascending: false });

      const allocationsWithEmail = (existing || []).map((a) => {
        const match = allUsers.find((u) => u.id === a.user_id);
        return {
          ...a,
          user_email: match?.email || "",
        };
      });

      setAllocations(allocationsWithEmail);
    };

    fetch();
  }, []);

  const handleAllocate = async () => {
    if (!selectedUserId || !amount) return;
    const amt = parseFloat(amount);

    const { data, error } = await supabase
      .from("user_allocations")
      .insert([{ user_id: selectedUserId, amount: amt }])
      .select("id")
      .single();

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      const allocationId = data?.id;

      await supabase.from("allocation_logs").insert({
        allocation_id: allocationId,
        user_id: selectedUserId,
        admin_id: currentAdminId,
        action: "insert",
        new_amount: amt,
      });

      setMessage("Allocation added successfully");
      setAmount("");
      setSelectedUserId("");
      location.reload();
    }
  };

  const handleUpdate = async (
    id: string,
    userId: string,
    prevAmount: number,
    newAmount: number,
  ) => {
    const { error } = await supabase
      .from("user_allocations")
      .update({ amount: newAmount })
      .eq("id", id);

    if (error) {
      alert("Failed to update: " + error.message);
    } else {
      await supabase.from("allocation_logs").insert({
        allocation_id: id,
        user_id: userId,
        admin_id: currentAdminId,
        action: "update",
        previous_amount: prevAmount,
        new_amount: newAmount,
      });

      alert("Updated!");
      location.reload();
    }
  };

  const handleDelete = async (id: string, userId: string, amount: number) => {
    const confirmDelete = confirm(
      "Are you sure you want to revoke this allocation?",
    );
    if (!confirmDelete) return;

    // 🔍 Step 1: Check if user has expenses
    const { data: userExpenses, error: checkError } = await supabase
      .from("expenses")
      .select("id")
      .eq("created_by", userId)
      .limit(1);

    if (checkError) {
      alert("Failed to verify expenses: " + checkError.message);
      return;
    }

    if (userExpenses && userExpenses.length > 0) {
      alert("❌ Cannot delete: This user has recorded expenses.");
      return;
    }

    // ✅ Step 2: Proceed to delete
    const { error } = await supabase
      .from("user_allocations")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Failed to delete: " + error.message);
    } else {
      await supabase.from("allocation_logs").insert({
        allocation_id: id,
        user_id: userId,
        admin_id: currentAdminId,
        action: "delete",
        previous_amount: amount,
      });

      alert("✅ Allocation revoked successfully!");
      location.reload();
    }
  };

  const exportToExcel = () => {
    if (!allocations.length) return;

    const worksheetData = allocations.map((a) => ({
      Email: a.user_email || a.user_id,
      Amount: a.amount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Allocations");

    XLSX.writeFile(workbook, "fund_allocations.xlsx");
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-xl font-bold mb-6">🎯 Admin Fund Allocation</h1>

      <div className="space-y-3">
        <Label>Select User</Label>
        <select
          className="w-full border rounded px-3 py-2"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
        >
          <option value="">Select a user</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.email || u.id}
            </option>
          ))}
        </select>

        <Label>Amount to Allocate</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Button onClick={handleAllocate}>Allocate Funds</Button>
        {message && <p className="text-green-600">{message}</p>}
      </div>

      <h2 className="mt-10 text-lg font-semibold">📋 Existing Allocations</h2>
      <table className="w-full mt-2 border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">User</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {allocations.map((a) => (
            <tr key={a.id}>
              <td className="border p-2">{a.user_email || a.user_id}</td>
              <td className="border p-2">
                <input
                  type="number"
                  className="w-full border px-2 py-1"
                  defaultValue={a.amount}
                  onChange={(e) => (a._editedAmount = e.target.value)}
                />
              </td>
              <td className="border p-2 text-center">
                <button
                  className="text-blue-600 underline mr-4"
                  onClick={() => {
                    const newAmt = parseFloat(a._editedAmount || `${a.amount}`);
                    handleUpdate(a.id, a.user_id, a.amount, newAmt);
                  }}
                >
                  Update
                </button>
                <button
                  className="text-red-600 underline"
                  onClick={() => handleDelete(a.id, a.user_id, a.amount)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6">
        <Button variant="outline" onClick={exportToExcel}>
          📤 Export to Excel
        </Button>
      </div>
    </div>
  );
}
