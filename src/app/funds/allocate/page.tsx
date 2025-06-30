"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type User = {
  id: string;
  email: string | undefined;
  user_metadata: {
    display_name: string;
  };
};

export default function AllocatePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient();
      const {
        data: { users },
        error,
      } = await supabase.auth.admin.listUsers();
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(users as User[]);
      }
    };

    fetchUsers();
  }, []);

  const handleAllocate = async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const adminId = session?.user?.id;

    if (!adminId) {
      toast.error("You must be logged in to allocate funds.");
      return;
    }

    const { error } = await supabase.from("allocations").insert([
      {
        user_id: selectedUser,
        amount: parseFloat(amount),
        admin_id: adminId,
      },
    ]);

    if (error) {
      toast.error("Failed to allocate funds.");
      console.error("Error allocating funds:", error);
    } else {
      toast.success("Funds allocated successfully!");
      setSelectedUser("");
      setAmount("");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Allocate Funds</h1>
      <div className="space-y-4">
        <div>
          <Label htmlFor="user" className="mb-1.5 block">
            Select Volunteer
          </Label>
          <select
            id="user"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="" disabled>
              Select a user
            </option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.user_metadata.display_name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="amount" className="mb-1.5 block">
            Amount
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <Button onClick={handleAllocate} disabled={!selectedUser || !amount}>
          Allocate
        </Button>
      </div>
    </div>
  );
}
