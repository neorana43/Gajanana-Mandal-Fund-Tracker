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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

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
    <div className="p-4 max-w-2xl w-full mx-auto">
      <Card className="w-full p-8">
        <div className="flex items-center mb-4">
          <Link href="/funds/list">
            <Button variant="glass" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold ml-4">Allocate Funds</h1>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleAllocate();
          }}
        >
          <div>
            <Label htmlFor="user" className="mb-1.5 block">
              Select User
            </Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-full h-12 text-left">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <Button
            type="submit"
            disabled={!selectedUser || !amount}
            variant="glass"
            className="w-full mt-5"
          >
            Allocate
          </Button>
        </form>
      </Card>
    </div>
  );
}
