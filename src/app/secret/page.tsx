"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

export default function SecretSponsorForm() {
  const supabase = createClient();

  const [sponsorName, setSponsorName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [isFull, setIsFull] = useState(false);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchRole = async () => {
      const user = await supabase.auth.getUser();
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", user.data.user?.id)
        .single();

      if (data?.role !== "admin") {
        redirect("/dashboard");
      } else {
        setRole("admin");
      }
    };

    fetchRole();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);

    const user = await supabase.auth.getUser();
    const { error } = await supabase.from("sponsors").insert([
      {
        sponsor_name: sponsorName,
        category,
        description,
        amount: parseFloat(amount),
        is_full: isFull,
        created_by: user.data.user?.id,
      },
    ]);

    if (error) {
      setMsg("Error: " + error.message);
    } else {
      setMsg("Sponsor saved successfully!");
      setSponsorName("");
      setCategory("");
      setDescription("");
      setAmount("");
      setIsFull(false);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <h2 className="text-xl font-semibold mb-4">Secret Sponsorship Entry</h2>

      <Label>Name</Label>
      <Input
        value={sponsorName}
        onChange={(e) => setSponsorName(e.target.value)}
        className="mb-3"
      />

      <Label>Category (e.g. Murti, Lights, Event)</Label>
      <Input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="mb-3"
      />

      <Label>Description (optional)</Label>
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
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
          id="isFull"
          checked={isFull}
          onCheckedChange={(val) => setIsFull(!!val)}
        />
        <Label htmlFor="isFull">Full Sponsorship?</Label>
      </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? "Submitting..." : "Submit Sponsorship"}
      </Button>

      {msg && <p className="text-green-600 mt-4">{msg}</p>}
    </div>
  );
}
