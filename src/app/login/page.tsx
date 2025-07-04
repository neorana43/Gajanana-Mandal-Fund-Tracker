"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { onboardMandalUser } from "@/lib/auth/onboardMandalUser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      toast.error("Login failed.");
    } else {
      // Fetch user to check active status
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        toast.error("User not found after login.");
        return;
      }
      if (user.user_metadata?.active === false) {
        toast.error("Your account is deactivated. Please contact admin.");
        await supabase.auth.signOut();
        return;
      }
      // Onboard invited user to mandal if needed
      await onboardMandalUser(user.id, user.user_metadata);
      toast.success("Login successful!");
      // Fetch user's mandal memberships
      type Membership = { mandals: { slug: string } | null };
      const { data: memberships, error: membershipError } = await supabase
        .from("mandal_users")
        .select("mandals(slug)")
        .eq("user_id", user.id)
        .eq("status", "active");

      const typedMemberships = memberships as unknown as Membership[];
      const firstMandal = typedMemberships?.find(
        (m) => m.mandals && m.mandals.slug,
      );
      if (
        membershipError ||
        !typedMemberships ||
        typedMemberships.length === 0 ||
        !firstMandal
      ) {
        router.push("/mandal/onboarding");
      } else {
        // Use the first mandal as default, or implement your own logic
        const slug = firstMandal.mandals!.slug;
        router.push(`/mandal/${slug}/dashboard`);
      }
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
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="text-sm text-muted-foreground">
            Admins and volunteers only
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
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

          <div>
            <Label className="text-md mb-1.5 block" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            variant="glass"
            className="w-full mt-5"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <div className="flex flex-col items-center gap-2 mt-6">
          <Link
            href="/reset-password"
            className="text-xs text-primary hover:underline"
          >
            Forgot password?
          </Link>
          <Link href="/signup" className="text-xs text-primary hover:underline">
            Don&apos;t have an account? Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
}
