"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { format } from "date-fns";

export default function SecretSponsorListPage() {
  const supabase = createClient();
  const [secretDonations, setSecretDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecret = async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("is_secret", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setSecretDonations(data);
      }

      setLoading(false);
    };

    fetchSecret();
  }, []);

  return (
    <div className="p-4 pb-24 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Secret Sponsors</h1>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : secretDonations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No secret sponsors found.
        </p>
      ) : (
        <ul className="space-y-4">
          {secretDonations.map((donation) => (
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
              <div className="text-xs text-muted-foreground mb-1">
                {format(new Date(donation.created_at), "dd MMM yyyy")}
              </div>
              {donation.notes && (
                <div className="text-xs text-gray-700">{donation.notes}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
