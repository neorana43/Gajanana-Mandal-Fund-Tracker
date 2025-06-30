"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

export default function AddExpensePage() {
  const supabase = createClient();
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || !category) {
      toast.error("Amount and category are required.");
      return;
    }

    setLoading(true);
    const user = await supabase.auth.getUser();

    const { error } = await supabase.from("expenses").insert([
      {
        amount: parseFloat(amount),
        category,
        notes,
        receipt_url: receiptUrl,
        created_by: user.data.user?.id,
      },
    ]);

    setLoading(false);

    if (!error) {
      toast.success("Expense added.");
      router.push("/expense/list");
    } else {
      toast.error("Failed to save expense.");
    }
  };

  const handleReceiptUpload = async (file: File) => {
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("receipts")
      .upload(fileName, file);

    if (error) {
      toast.error("Upload failed.");
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("receipts")
      .getPublicUrl(fileName);

    if (publicUrlData?.publicUrl) {
      setReceiptUrl(publicUrlData.publicUrl);
      toast.success("Receipt uploaded.");
    }

    setUploading(false);
  };

  return (
    <div className="p-4 pb-24 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Add Expense</h1>

      <div className="space-y-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            placeholder="E.g. Decoration, Food"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Input
            id="notes"
            placeholder="Short description"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="receipt">Upload Receipt (optional)</Label>
          <Input
            id="receipt"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleReceiptUpload(file);
            }}
          />
        </div>

        {receiptUrl && (
          <div className="mt-2">
            <Label className="text-xs text-muted-foreground">Preview:</Label>
            <Image
              src={receiptUrl}
              alt="Receipt Preview"
              width={120}
              height={120}
              className="rounded border mt-1 object-cover"
            />
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={loading || uploading}
          className="w-full mt-2"
        >
          {loading ? "Saving..." : "Submit Expense"}
        </Button>
      </div>
    </div>
  );
}
