"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage("❌ " + error.message);
    } else {
      setMessage("✅ Password updated. You can now log in.");
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto py-20">
      <h1 className="text-xl font-bold mb-6">🔒 Reset Your Password</h1>
      <div className="space-y-4">
        <Label>New Password</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleReset}>Update Password</Button>
        {message && <p className="mt-2 text-sm text-green-700">{message}</p>}
      </div>
    </div>
  );
}
