"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
};

export default function AllocateFundsPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: userList, error } = await supabase.auth.admin.listUsers();
      if (!error && userList?.users) {
        const formatted = userList.users.map((u) => ({
          id: u.id,
          email: u.email || u.id,
        }));
        setUsers(formatted);
      }
    };

    fetchUsers();
  }, []);

  const handleAllocate = async () => {
    if (!selectedUser || !amount) {
      toast.error("Select user and amount.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("user_allocations")
      .upsert(
        { user_id: selectedUser, amount: parseFloat(amount) },
        { onConflict: "user_id" },
      );

    setLoading(false);

    if (!error) {
      toast.success("Funds allocated.");
      setAmount("");
      setSelectedUser("");
    } else {
      toast.error("Error allocating funds.");
    }
  };

  return (
    <div className="p-4 pb-24 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Allocate Funds</h1>

      <div className="space-y-4">
        <div>
          <Label htmlFor="user">Select Volunteer</Label>
          <select
            id="user"
            className="w-full border p-2 rounded-md text-sm"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">-- Select User --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="₹"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <Button
          onClick={handleAllocate}
          disabled={loading}
          className="w-full mt-2"
        >
          {loading ? "Allocating..." : "Allocate"}
        </Button>
      </div>
    </div>
  );
}
