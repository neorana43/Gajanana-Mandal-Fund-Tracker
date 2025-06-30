"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

export default function EditSponsorPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [sponsorName, setSponsorName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isFull, setIsFull] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchSponsor = async () => {
      if (!id) return;
      setIsFetching(true);
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Failed to fetch sponsor details.");
        router.push("/secret/list");
      } else {
        setSponsorName(data.sponsor_name);
        setAmount(data.amount.toString());
        setCategory(data.category);
        setDescription(data.description || "");
        setIsFull(data.is_full || false);
      }
      setIsFetching(false);
    };

    fetchSponsor();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorName || !amount) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("sponsors")
      .update({
        sponsor_name: sponsorName,
        amount: Number(amount),
        category,
        description,
        is_full: isFull,
      })
      .eq("id", id);

    setLoading(false);

    if (error) {
      toast.error("Failed to update sponsor.");
    } else {
      toast.success("Sponsor updated successfully!");
      router.push("/secret/list");
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
        <Link href="/secret/list" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Edit Sponsor</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="sponsorName">Sponsor Name</Label>
          <Input
            id="sponsorName"
            value={sponsorName}
            onChange={(e) => setSponsorName(e.target.value)}
            required
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
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isFull"
            checked={isFull}
            onCheckedChange={(checked) => setIsFull(Boolean(checked))}
          />
          <label
            htmlFor="isFull"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Is this a full sponsorship?
          </label>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Update Sponsor"}
        </Button>
      </form>
    </div>
  );
}
