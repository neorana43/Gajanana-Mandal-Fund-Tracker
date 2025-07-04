"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateMandalPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const router = useRouter();

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let logoUrl = "";
    if (logoFile) {
      // Upload logo to Supabase Storage
      const formData = new FormData();
      formData.append("file", logoFile);
      const uploadRes = await fetch("/api/mandals/upload-logo", {
        method: "POST",
        body: formData,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) {
        toast.error(uploadJson.error || "Logo upload failed");
        setLoading(false);
        return;
      }
      logoUrl = uploadJson.url;
    }
    const response = await fetch("/api/mandals/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, address, logo: logoUrl }),
    });
    const result = await response.json();
    setLoading(false);
    if (!response.ok) {
      toast.error(result.error || "Failed to create mandal.");
    } else {
      toast.success("Mandal created successfully!");
      router.push("/mandal/manage");
    }
  };

  return (
    <div className="p-4 pb-24 max-w-2xl w-full mx-auto">
      <Card className="w-full p-8">
        <div className="flex items-center mb-4">
          <Link href="/mandal/manage">
            <Button variant="glass" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold ml-4">Create Mandal</h1>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Mandal Name"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Address</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Logo</label>
            <Input type="file" accept="image/*" onChange={handleLogoChange} />
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="mt-2 h-20 rounded"
              />
            )}
          </div>
          <Button type="submit" className="w-full mt-5" disabled={loading}>
            {loading ? "Creating..." : "Create Mandal"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
