"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Share2 } from "lucide-react";

export function ShareDashboardButton() {
  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}/dashboard/public`;
    navigator.clipboard.writeText(url);
    toast.success("Public dashboard URL copied!");
  };

  return (
    <form action="#" onSubmit={handleShare}>
      <Button
        type="submit"
        variant="glass"
        className="text-xs flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share Public Dashboard
      </Button>
    </form>
  );
}
