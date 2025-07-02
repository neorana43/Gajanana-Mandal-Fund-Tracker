"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
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

type Sponsor = Tables<"sponsors">;

export default function SponsorListPage() {
  const supabase = createClient();
  const router = useRouter();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchSponsors = async () => {
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch sponsors.");
      } else if (data) {
        setSponsors(data);
      }
    };

    fetchSponsors();
  }, []);

  const handleDelete = async (sponsorId: string) => {
    const { data, error } = await supabase
      .from("sponsors")
      .delete()
      .eq("id", sponsorId)
      .select();

    if (error) {
      toast.error(`Failed to delete sponsor: ${error.message}`);
    } else if (data && data.length > 0) {
      setSponsors(sponsors.filter((s) => s.id !== sponsorId));
      toast.success("Sponsor deleted successfully.");
    } else {
      toast.error(
        "Deletion failed. The item was not found or you may not have permission.",
      );
    }
  };

  const filteredSponsors = sponsors.filter(
    (s) =>
      s.sponsor_name.toLowerCase().includes(filter.toLowerCase()) ||
      s.category?.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="p-4 pb-24 max-w-2xl w-full mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Sponsors</h1>
        <Link href="/secret">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Sponsor
          </Button>
        </Link>
      </div>

      <Input
        type="text"
        placeholder="Filter by name or category..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4"
      />

      {filteredSponsors.length === 0 ? (
        <p className="text-muted-foreground text-sm">No sponsors found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredSponsors.map((sponsor) => (
            <li key={sponsor.id}>
              <Card className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-primary">
                      {sponsor.sponsor_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sponsor.category}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    ₹{sponsor.amount}
                  </p>
                </div>

                {sponsor.description && (
                  <p className="text-sm my-2 text-gray-700 dark:text-gray-300">
                    {sponsor.description}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/secret/edit/${sponsor.id}`)}
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
                          delete this sponsor record.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(sponsor.id)}
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
