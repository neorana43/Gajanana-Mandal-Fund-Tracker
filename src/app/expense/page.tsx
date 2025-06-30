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
  const [billFile, setBillFile] = useState<File | null>(null);
  const [users, setUsers] = useState<{ id: string; displayName: string }[]>([]);
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
        // Fetch users from our reliable API endpoint
        const response = await fetch("/api/users/list");
        const data = await response.json();

        if (response.ok && data.users) {
          // The current user should be in the list from the API
          setUsers(data.users);
          // Set the default selection to the current user
          setUserId(currentUser.id);
        } else {
          // Fallback in case the API fails
          const adminUser = {
            id: currentUser.id,
            displayName: currentUser.user_metadata.display_name || "Admin",
          };
          setUsers([adminUser]);
          setUserId(adminUser.id);
        }
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

    let bill_url: string | null = null;

    if (billFile) {
      const filePath = `${userId}/${Date.now()}-${billFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(filePath, billFile);

      if (uploadError) {
        toast.error("Failed to upload bill.");
        console.error("Upload Error: ", uploadError);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("receipts")
        .getPublicUrl(uploadData.path);

      bill_url = urlData.publicUrl;
    }

    const { error } = await supabase.from("expenses").insert({
      user_id: userId,
      amount: Number(amount),
      category,
      note,
      date: new Date().toISOString(),
      bill_url,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      toast.error("Failed to save expense.");
    } else {
      toast.success("Expense saved!");
      // Clear the form fields
      setAmount("");
      setCategory("");
      setNote("");
      setBillFile(null);
      // Optionally, reset the user if it's an admin making entries for others
      // For now, we'll keep the user selected.

      // Redirect to the list page
      router.push("/expense/list");
    }
  };

  return (
    <div className="p-4 pb-24 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Add Expense</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isAdmin && (
          <div>
            <Label htmlFor="user" className="mb-1.5 block">
              User
            </Label>
            <Select onValueChange={(value) => setUserId(value)} value={userId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

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

        <div>
          <Label htmlFor="category" className="mb-1.5 block">
            Category
          </Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="note" className="mb-1.5 block">
            Note
          </Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional description or bill info"
          />
        </div>

        <div>
          <Label htmlFor="bill" className="mb-1.5 block">
            Bill (Image or PDF)
          </Label>
          <Input
            id="bill"
            type="file"
            onChange={(e) => setBillFile(e.target.files?.[0] || null)}
            accept="image/*,application/pdf"
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-foreground file:text-primary hover:file:bg-primary-foreground/90"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Submit Expense"}
        </Button>
      </form>
    </div>
  );
}
