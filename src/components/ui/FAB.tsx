"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function FloatingButtons() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="space-y-2 mb-2 text-sm text-white text-right">
          <Link href="/donate" passHref>
            <Button
              asChild
              variant="glass"
              className="bg-pink-600 hover:bg-pink-700 text-white w-full"
            >
              + Donation
            </Button>
          </Link>
          <Link href="/expense" passHref>
            <Button
              asChild
              variant="glass"
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              + Expense
            </Button>
          </Link>
        </div>
      )}
      <Button
        onClick={() => setOpen(!open)}
        variant="glass"
        className="bg-saffron text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-saffron/90"
      >
        {open ? "\u00d7" : "+"}
      </Button>
    </div>
  );
}
