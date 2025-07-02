"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash } from "lucide-react";
import { Tables } from "@/types/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Donation = Tables<"donations">;

export default function DonationListPage() {
  const supabase = createClient();
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchDonations = async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch donations.");
      } else if (data) {
        setDonations(data);
      }
    };

    fetchDonations();
  }, []);

  const handleDelete = async (donationId: string) => {
    const { data, error } = await supabase
      .from("donations")
      .delete()
      .eq("id", donationId)
      .select();

    if (error) {
      toast.error(`Failed to delete donation: ${error.message}`);
    } else if (data && data.length > 0) {
      setDonations(donations.filter((d) => d.id !== donationId));
      toast.success("Donation deleted successfully.");
    } else {
      toast.error(
        "Deletion failed. The item was not found or you may not have permission.",
      );
    }
  };

  const filteredDonations = donations.filter(
    (d) =>
      d.donor_name.toLowerCase().includes(filter.toLowerCase()) ||
      d.contact?.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="p-4 pb-24 max-w-2xl w-full mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Donations</h1>
        <Link href="/donate">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Donation
          </Button>
        </Link>
      </div>

      <Input
        type="text"
        placeholder="Filter by name or contact..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4"
      />

      {filteredDonations.length === 0 ? (
        <p className="text-muted-foreground text-sm">No donations found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredDonations.map((donation) => (
            <li key={donation.id}>
              <Card className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-primary">
                      {donation.donor_name}
                    </p>
                    {donation.house_number && (
                      <p className="text-xs text-muted-foreground">
                        H.No: {donation.house_number}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(donation.created_at!), "dd MMM yyyy")}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    ₹{donation.amount}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/donate/edit/${donation.id}`)}
                  >
                    <Pencil className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash className="h-3 w-3 mr-2" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete this donation record.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(donation.id)}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
