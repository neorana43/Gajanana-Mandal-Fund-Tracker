"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { onboardMandalUser } from "@/lib/auth/onboardMandalUser";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      toast.error("Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Signup failed.");
    } else {
      // Onboard invited user to mandal if needed
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (user) {
        await onboardMandalUser(user.id, user.user_metadata);
      }
      toast.success(
        "Signup successful! Please check your email to verify your account.",
      );
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
          <h1 className="text-2xl font-bold">Sign Up</h1>
          <p className="text-sm text-muted-foreground">Create your account</p>
        </div>
        <form
          className="space-y-4 mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSignup();
          }}
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-5"
            variant="glass"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </form>
        <div className="flex flex-col items-center gap-2 mt-6">
          <Link href="/login" className="text-xs text-primary hover:underline">
            Already have an account? Login
          </Link>
        </div>
      </Card>
    </div>
  );
}
