"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

export default function EditDonationPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState("");
  const [contact, setContact] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchDonation = async () => {
      if (!id) return;
      setIsFetching(true);
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Failed to fetch donation details.");
        router.push("/donate/list");
      } else {
        setDonorName(data.donor_name);
        setAmount(data.amount.toString());
        setContact(data.contact || "");
        setHouseNumber(data.house_number || "");
        setIsRecurring(data.is_recurring || false);
      }
      setIsFetching(false);
    };

    fetchDonation();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !amount) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("donations")
      .update({
        donor_name: donorName,
        amount: Number(amount),
        contact,
        house_number: houseNumber,
        is_recurring: isRecurring,
      })
      .eq("id", id);

    setLoading(false);

    if (error) {
      toast.error("Failed to update donation.");
    } else {
      toast.success("Donation updated successfully!");
      router.push("/donate/list");
    }
  };

  if (isFetching) {
    return (
      <div className="p-4 max-w-xl mx-auto">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 max-w-xl mx-auto">
      <div className="flex items-center mb-4">
        <Link href="/donate/list" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Edit Donation</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="donorName">Donor Name</Label>
          <Input
            id="donorName"
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
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="contact">Contact (Optional)</Label>
          <Input
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isRecurring"
            checked={isRecurring}
            onCheckedChange={(checked) => setIsRecurring(Boolean(checked))}
          />
          <label
            htmlFor="isRecurring"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Is this a recurring donation?
          </label>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Update Donation"}
        </Button>
      </form>
    </div>
  );
}
