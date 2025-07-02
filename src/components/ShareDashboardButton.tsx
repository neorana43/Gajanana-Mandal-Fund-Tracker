"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ShareDashboardButton() {
  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}/dashboard/public`;
    navigator.clipboard.writeText(url);
    toast.success("Public dashboard URL copied!");
  };

  return (
    <form action="#" onSubmit={handleShare}>
      <Button type="submit" variant="glass">
        Share Public Dashboard URL
      </Button>
    </form>
  );
}
