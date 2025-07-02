"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { Mail, Facebook, Twitter, MessageCircle, Share2 } from "lucide-react";

export function ShareDashboardButton() {
  const isMobile = useIsMobile();
  const url = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/dashboard/public`;
  const title = encodeURIComponent(
    "Check out the Gajanana Mandal Public Dashboard!",
  );
  const encodedUrl = encodeURIComponent(url);

  const shareOptions = [
    {
      label: "Email",
      icon: Mail,
      href: `mailto:?subject=${title}&body=${encodedUrl}`,
    },
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${title}%20${encodedUrl}`,
    },
    {
      label: "SMS",
      icon: MessageCircle,
      href: `sms:?body=${title}%20${encodedUrl}`,
    },
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${title}&url=${encodedUrl}`,
    },
  ];

  if (!isMobile) {
    // On desktop, fallback to copy to clipboard
    const handleShare = (e: React.FormEvent) => {
      e.preventDefault();
      navigator.clipboard.writeText(url);
      toast.success("Public dashboard URL copied!");
    };
    return (
      <form action="#" onSubmit={handleShare}>
        <Button
          type="submit"
          variant="glass"
          className="text-xs flex items-center gap-2 w-full"
        >
          <Share2 className="w-4 h-4" />
          Share Public Dashboard
        </Button>
      </form>
    );
  }

  // On mobile, show popover with share options
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="glass"
          className="text-xs flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share Public Dashboard
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" sideOffset={8} className="p-2 w-64">
        <div className="flex flex-col gap-2">
          {shareOptions.map((option) => (
            <a
              key={option.label}
              href={option.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition"
            >
              <option.icon className="w-5 h-5 text-primary" />
              <span className="text-sm">{option.label}</span>
            </a>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
