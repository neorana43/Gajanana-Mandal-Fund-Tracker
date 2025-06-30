"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

type User = {
  id: string;
  displayName: string;
};

export default function EditAllocationPage() {
  const supabase = createClient();
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch all users for the dropdown
        const usersResponse = await fetch("/api/users/list");
        const usersData = await usersResponse.json();
        if (usersResponse.ok && usersData.users) {
          setUsers(usersData.users);
        } else {
          toast.error("Failed to fetch users.");
        }

        // Fetch the specific allocation to edit
        const { data: allocationData, error: allocationError } = await supabase
          .from("user_allocations")
          .select("*")
          .eq("id", id)
          .single();

        if (allocationError) {
          toast.error("Failed to fetch allocation data.");
          router.push("/funds/list");
        } else if (allocationData) {
          setSelectedUser(allocationData.user_id || "");
          setAmount(String(allocationData.amount));
        }
      } catch (error) {
        toast.error("An error occurred while loading data.");
        console.error("Fetch Initial Data Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInitialData();
    }
  }, [id, router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !amount) {
      toast.error("All fields are required.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("user_allocations")
      .update({
        user_id: selectedUser,
        amount: parseFloat(amount),
      })
      .eq("id", id);

    setLoading(false);

    if (error) {
      toast.error("Failed to update allocation.");
      console.error(error);
    } else {
      toast.success("Allocation updated successfully!");
      router.push("/funds/list");
    }
  };

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Edit Fund Allocation</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="user" className="mb-1.5 block">
            Select User
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
                {user.displayName}
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
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
