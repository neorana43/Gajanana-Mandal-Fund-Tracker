"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Logged in!");
      window.location.href = "/dashboard";
    }
    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto py-10">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-2"
      />
      <Button className="mt-4 w-full" onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>
      <p className="text-red-500 mt-2">{message}</p>
    </div>
  );
}
