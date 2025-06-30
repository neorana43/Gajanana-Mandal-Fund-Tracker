"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AddSecretSponsorPage() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount) {
      toast.error("Amount is required.");
      return;
    }

    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from("donations").insert([
      {
        name: name || "Anonymous",
        amount: parseFloat(amount),
        notes,
        is_secret: true,
        created_by: userData?.user?.id,
      },
    ]);

    setLoading(false);

    if (!error) {
      toast.success("Secret sponsor added.");
      router.push("/secret/list");
    } else {
      toast.error("Failed to save sponsor.");
    }
  };

  return (
    <div className="p-4 pb-24 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Add Secret Sponsor</h1>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="mb-1.5 block">
            Name (optional)
          </Label>
          <Input
            id="name"
            placeholder="e.g. Sponsor A"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="amount" className="mb-1.5 block">
            Amount (₹)
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="notes" className="mb-1.5 block">
            Notes (optional)
          </Label>
          <Input
            id="notes"
            placeholder="Sponsor details, category, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-2"
        >
          {loading ? "Saving..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}
