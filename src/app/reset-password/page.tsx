"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/update-password`,
    });

    setLoading(false);

    if (error) {
      toast.error("Failed to send reset email.");
    } else {
      toast.success("Password reset email sent.");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 pb-6 my-auto max-w-2xl w-full mx-auto">
      <Image
        src="/logo.svg"
        alt="Gajanana Mandal Logo"
        width={96}
        height={96}
        className="mx-auto mb-6 h-24"
        priority
      />
      <Card className="w-full p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to receive a reset link.
          </p>
        </div>
        <form
          className="space-y-4 mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleReset();
          }}
        >
          <div>
            <Label className="text-md mb-1.5 block" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            variant="glass"
            className="w-full mt-5"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
