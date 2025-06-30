"use client";

import Link from "next/link";
import { useState } from "react";

export default function FloatingButtons() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="space-y-2 mb-2 text-sm text-white text-right">
          <Link href="/donate">
            <div className="bg-pink-600 px-3 py-2 rounded shadow hover:bg-pink-700">
              + Donation
            </div>
          </Link>
          <Link href="/expense">
            <div className="bg-blue-600 px-3 py-2 rounded shadow hover:bg-blue-700">
              + Expense
            </div>
          </Link>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="bg-saffron text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-saffron/90"
      >
        {open ? "×" : "+"}
      </button>
    </div>
  );
}
