"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Define Mandal type
interface Mandal {
  id: string;
  name: string;
  description?: string;
  address?: string;
  logo?: string;
}

export default function EditMandalPage() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchMandal = async () => {
      setLoading(true);
      const response = await fetch("/api/mandals/list");
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to fetch mandals.");
        setLoading(false);
        return;
      }
      const mandal = (result.mandals || []).find((m: Mandal) => m.id === id);
      if (!mandal) {
        toast.error("Mandal not found.");
        router.push("/mandal/manage");
        return;
      }
      setName(mandal.name);
      setDescription(mandal.description || "");
      setAddress(mandal.address || "");
      setLogo(mandal.logo || null);
      setLoading(false);
    };
    if (id) fetchMandal();
  }, [id, router]);

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
    setSaving(true);
    let logoUrl = logo;
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
        setSaving(false);
        return;
      }
      logoUrl = uploadJson.url;
    }
    const response = await fetch("/api/mandals/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, description, address, logo: logoUrl }),
    });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) {
      toast.error(result.error || "Failed to update mandal.");
    } else {
      toast.success("Mandal updated successfully!");
      router.push("/mandal/manage");
    }
  };

  if (loading) {
    return (
      <div className="p-4 pb-24 max-w-2xl w-full mx-auto">
        <Card className="w-full p-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent" />
          </div>
          <div className="w-2/3 h-6 mb-2">
            <div className="bg-accent/40 animate-pulse rounded-full w-full h-full" />
          </div>
          <div className="w-1/2 h-4">
            <div className="bg-accent/30 animate-pulse rounded-full w-full h-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 max-w-2xl w-full mx-auto">
      <Card className="w-full p-8">
        <div className="flex items-center mb-4">
          <Link href="/mandal/manage">
            <Button variant="glass" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold ml-4">Edit Mandal</h1>
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
            {(logoPreview || logo) && (
              <img
                src={logoPreview || logo || undefined}
                alt="Logo Preview"
                className="mt-2 h-20 rounded"
              />
            )}
          </div>
          <Button type="submit" className="w-full mt-5" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
