"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type User = {
  id: string;
  displayName: string;
};

export default function AllocatePage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users/list");
        const data = await response.json();

        if (response.ok && data.users) {
          setUsers(data.users);
        } else {
          toast.error("Failed to fetch users.");
        }
      } catch (error) {
        toast.error("An error occurred while fetching users.");
        console.error("Fetch Users Error:", error);
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

    const { error } = await supabase.from("user_allocations").insert([
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
      router.push("/funds/list");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="mb-4">
        <Link href="/funds/list">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
          </Button>
        </Link>
      </div>
      <h1 className="text-xl font-bold mb-4">Allocate Funds</h1>
      <div className="space-y-4">
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
