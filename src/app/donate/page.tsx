"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase";

export default function DonatePage() {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [amount, setAmount] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    const user = await supabase.auth.getUser();
    const { data, error } = await supabase.from("donations").insert([
      {
        donor_name: name,
        contact,
        amount: parseFloat(amount),
        is_recurring: recurring,
        created_by: user.data.user?.id,
      },
    ]);

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Donation recorded successfully!");
      setName("");
      setContact("");
      setAmount("");
      setRecurring(false);
      // Optionally: send email here
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <h2 className="text-xl font-semibold mb-4">Add Donation</h2>

      <Label>Name</Label>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-3"
      />

      <Label>Contact (optional)</Label>
      <Input
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        className="mb-3"
      />

      <Label>Amount</Label>
      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="mb-3"
      />

      <div className="flex items-center space-x-2 mb-3">
        <Checkbox
          id="recurring"
          checked={recurring}
          onCheckedChange={(val) => setRecurring(!!val)}
        />
        <Label htmlFor="recurring">Recurring Donation</Label>
      </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? "Submitting..." : "Submit Donation"}
      </Button>

      {message && <p className="text-sm text-green-600 mt-4">{message}</p>}
    </div>
  );
}
