"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function AddExpensePage() {
  const supabase = createClient();
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRemaining = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id;

      const [{ data: alloc }, { data: expenses }] = await Promise.all([
        supabase
          .from("user_allocations")
          .select("amount")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase.from("expenses").select("amount").eq("created_by", userId),
      ]);

      const allocated = Number(alloc?.amount || 0);
      const spent =
        expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      setRemaining(allocated - spent);
    };

    fetchRemaining();
  }, []);

  const handleSubmit = async () => {
    setError("");
    const amt = parseFloat(amount);
    if (!category || !amt) {
      setError("Please fill category and amount");
      return;
    }

    if (remaining !== null && amt > remaining) {
      setError(`Insufficient funds. You have ₹${remaining} left.`);
      return;
    }

    let receipt_url = "";

    if (file) {
      const filename = `${Date.now()}_${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(filename, file);

      if (uploadError) {
        setError("Failed to upload receipt.");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("receipts")
        .getPublicUrl(filename);
      receipt_url = urlData?.publicUrl || "";
    }

    const { error: insertError } = await supabase.from("expenses").insert({
      amount: amt,
      category,
      description,
      receipt_url,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      router.push("/dashboard/user");
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 space-y-4">
      <h1 className="text-xl font-bold">Add Expense</h1>

      {remaining !== null && (
        <p className="text-sm text-muted-foreground">
          Remaining Funds: ₹{remaining}
        </p>
      )}
      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-3">
        <Label>Category</Label>
        <Input value={category} onChange={(e) => setCategory(e.target.value)} />

        <Label>Amount</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Label>Upload Receipt (PDF/Image)</Label>
        <Input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <Button onClick={handleSubmit}>Submit Expense</Button>
      </div>
    </div>
  );
}
