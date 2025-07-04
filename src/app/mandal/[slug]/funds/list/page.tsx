"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash } from "lucide-react";
import { Tables } from "@/types/supabase";
import { useRouter, useParams } from "next/navigation";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Allocation = Tables<"user_allocations"> & {
  user_email: string;
  admin_email: string;
  user_display_name: string | null;
  admin_display_name: string | null;
};

export default function AllocationListPage() {
  const supabase = createClient();
  const router = useRouter();
  const { slug } = useParams();
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllocations = async () => {
      // We need to get user and admin emails, so we'll use an RPC call.
      // This assumes an RPC function 'get_allocations_with_emails' exists.
      // If not, we'll need to create it.
      const { data, error } = await supabase.rpc("get_allocations_with_emails");

      if (error) {
        toast.error("Failed to fetch allocations.");
        console.error(error);
      } else if (data) {
        setAllocations(data);
      }
      setLoading(false);
    };

    fetchAllocations();
  }, [supabase]);

  const handleDelete = async (allocationId: string) => {
    const { error } = await supabase
      .from("user_allocations")
      .delete()
      .eq("id", allocationId);

    if (error) {
      toast.error(`Failed to delete allocation: ${error.message}`);
    } else {
      setAllocations(allocations.filter((a) => a.id !== allocationId));
      toast.success("Allocation deleted successfully.");
    }
  };

  if (loading) {
    return (
      <div className="p-4 max-w-2xl w-full mx-auto text-center">
        <p>Loading allocations...</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 max-w-2xl w-full mx-auto">
      <TooltipProvider>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Fund Allocations</h1>
          <Link href={`/mandal/${slug}/funds/allocate`}>
            <Button className="text-xs">
              <Plus className="mr-2 h-4 w-4" /> Add Allocation
            </Button>
          </Link>
        </div>

        {allocations.length === 0 ? (
          <p className="text-muted-foreground text-sm">No allocations found.</p>
        ) : (
          <ul className="space-y-4">
            {allocations.map((alloc) => (
              <li key={alloc.id}>
                <Card className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <span className="font-medium text-sm">
                        To:{" "}
                        {alloc.user_display_name || alloc.user_email || "N/A"}
                      </span>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        By:{" "}
                        {alloc.admin_display_name || alloc.admin_email || "N/A"}
                      </div>
                    </div>
                    <span className="text-primary font-semibold text-base">
                      ₹{alloc.amount}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground mt-1">
                    {format(new Date(alloc.created_at!), "dd MMM yyyy, p")}
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Edit"
                          onClick={() =>
                            router.push(
                              `/mandal/${slug}/funds/edit/${alloc.id}`,
                            )
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              aria-label="Delete"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the allocation record.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(alloc.id)}
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
      </TooltipProvider>
    </div>
  );
}
