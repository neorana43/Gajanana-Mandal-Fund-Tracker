"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

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
      if (user?.user_metadata?.active === false) {
        toast.error("Your account is deactivated. Please contact admin.");
        await supabase.auth.signOut();
        return;
      }
      toast.success("Login successful!");
      router.push("/dashboard");
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-6 my-auto max-w-2xl w-full mx-auto">
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
      </Card>
    </div>
  );
}
