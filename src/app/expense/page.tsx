"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ExpenseForm() {
  const supabase = createClient();
  const router = useRouter();

  const [userId, setUserId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [users, setUsers] = useState<{ id: string; full_name: string }[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user;
      if (!currentUser) return;

      setUserId(currentUser.id);

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", currentUser.id)
        .single();

      if (roleData?.role === "admin") {
        setIsAdmin(true);
        const { data: allUsers } = await supabase
          .from("users")
          .select("id, full_name")
          .order("full_name");

        if (allUsers) setUsers(allUsers);
      }
    };

    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !amount) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("expenses").insert({
      user_id: userId,
      amount: Number(amount),
      category,
      note,
      date: new Date().toISOString(),
    });

    setLoading(false);

    if (error) {
      console.error(error);
      toast.error("Failed to save expense.");
    } else {
      toast.success("Expense saved!");
      router.push("/expense/list");
    }
  };

  return (
    <div className="p-4 pb-24 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Add Expense</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isAdmin && (
          <div>
            <Label>User</Label>
            <Select
              onValueChange={(value) => setUserId(value)}
              defaultValue={userId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label>Amount</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <Label>Category</Label>
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div>
          <Label>Note</Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional description or bill info"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Submit Expense"}
        </Button>
      </form>
    </div>
  );
}
