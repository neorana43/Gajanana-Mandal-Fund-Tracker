"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

export default function DonatePage() {
  const supabase = createClient();
  const router = useRouter();
  const [donorName, setDonorName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [contact, setContact] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !amount) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to create a donation.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("donations").insert({
      donor_name: donorName,
      amount: Number(amount),
      contact: contact || null,
      is_recurring: isRecurring,
      house_number: houseNumber || null,
      created_by: user.id,
    });

    setLoading(false);

    if (error) {
      toast.error("Failed to submit donation.");
      console.error("Error submitting donation:", error);
    } else {
      toast.success("Donation saved!");
      setDonorName("");
      setAmount("");
      setContact("");
      setHouseNumber("");
      setIsRecurring(false);
      router.push("/donate/list");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">Make a Donation</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="donorName" className="mb-1.5 block">
            Name
          </Label>
          <Input
            id="donorName"
            placeholder="Your Name"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="houseNumber">House Number (Optional)</Label>
          <Input
            id="houseNumber"
            value={houseNumber}
            onChange={(e) => setHouseNumber(e.target.value)}
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
          <Label htmlFor="contact" className="mb-1.5 block">
            Contact Information (Optional)
          </Label>
          <Input
            id="contact"
            placeholder="Any additional contact information"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="isRecurring">Recurring Donation</Label>
          <Checkbox
            id="isRecurring"
            checked={isRecurring}
            onCheckedChange={(checked) => setIsRecurring(Boolean(checked))}
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Submitting..." : "Submit Donation"}
        </Button>
      </form>
    </div>
  );
}
