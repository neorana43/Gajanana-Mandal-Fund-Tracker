"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";

export default function DonatePage() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("donations")
      .insert([{ name, amount: parseFloat(amount), note }]);

    setLoading(false);

    if (error) {
      toast.error("Failed to submit donation.");
      console.error("Error submitting donation:", error);
    } else {
      toast.success("Donation submitted successfully!");
      setName("");
      setAmount("");
      setNote("");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">Make a Donation</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="mb-1.5 block">
            Name
          </Label>
          <Input
            id="name"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            required
          />
        </div>
        <div>
          <Label htmlFor="note" className="mb-1.5 block">
            Note (Optional)
          </Label>
          <Input
            id="note"
            placeholder="Any message or dedication"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Submitting..." : "Submit Donation"}
        </Button>
      </form>
    </div>
  );
}
