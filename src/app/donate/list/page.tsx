"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function DonationListPage() {
  const supabase = createClient();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDonations(data);
      }

      setLoading(false);
    };

    fetchDonations();
  }, []);

  return (
    <div className="p-4 pb-24 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Recent Donations</h1>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : donations.length === 0 ? (
        <p className="text-muted-foreground text-sm">No donations found.</p>
      ) : (
        <ul className="space-y-4">
          {donations.map((donation) => (
            <li
              key={donation.id}
              className="bg-white rounded-xl shadow border p-4"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm">
                  {donation.name || "Anonymous"}
                </span>
                <span className="text-primary font-semibold text-base">
                  ₹{donation.amount}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {donation.location && <span>{donation.location} · </span>}
                {format(new Date(donation.created_at), "dd MMM yyyy")}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Floating Action Button */}
      <Link
        href="/donate"
        className="fixed bottom-20 right-4 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90"
      >
        <Plus className="w-5 h-5" />
      </Link>
    </div>
  );
}
