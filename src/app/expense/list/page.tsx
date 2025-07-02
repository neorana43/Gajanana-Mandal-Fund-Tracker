"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash, FileText } from "lucide-react";
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

type Expense = Tables<"expenses">;

export default function ExpenseListPage() {
  const supabase = createClient();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchExpenses = async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        toast.error("Failed to fetch expenses.");
        console.error(error);
      } else if (data) {
        setExpenses(data);
      }
    };

    fetchExpenses();
  }, []);

  const handleDelete = async (expenseId: string) => {
    // Find the expense to get the bill URL for deletion from storage
    const expenseToDelete = expenses.find((e) => e.id === expenseId);
    if (expenseToDelete?.bill_url) {
      const filePath = new URL(expenseToDelete.bill_url).pathname.split(
        "/receipts/",
      )[1];
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from("receipts")
          .remove([filePath]);

        if (storageError) {
          toast.error(`Failed to delete bill: ${storageError.message}`);
          return; // Stop if we can't delete the file
        }
      }
    }

    const { data, error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId)
      .select();

    if (error) {
      toast.error(`Failed to delete expense: ${error.message}`);
    } else if (data && data.length > 0) {
      setExpenses(expenses.filter((e) => e.id !== expenseId));
      toast.success("Expense deleted successfully.");
    } else {
      toast.error(
        "Deletion failed. The item was not found or you may not have permission.",
      );
    }
  };

  const filteredExpenses = expenses.filter(
    (e) =>
      e.category?.toLowerCase().includes(filter.toLowerCase()) ||
      e.description?.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="p-4 pb-24 max-w-2xl w-full mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Expense List</h1>
        <Link href="/expense">
          <Button className="text-xs">
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </Link>
      </div>

      {/* Filter Input */}
      <Input
        type="text"
        placeholder="Filter by category or description..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4"
      />

      {/* List */}
      {filteredExpenses.length === 0 ? (
        <p className="text-muted-foreground text-sm">No expenses found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredExpenses.map((expense) => (
            <li key={expense.id}>
              <Card className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1">
                    <span className="font-medium text-sm capitalize">
                      {expense.category}
                    </span>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(expense.date), "dd MMM yyyy")}
                    </div>
                  </div>

                  <span className="text-destructive font-semibold text-base">
                    ₹{expense.amount}
                  </span>
                </div>

                {expense.description && (
                  <p className="text-sm my-2 text-gray-700 dark:text-gray-300">
                    {expense.description}
                  </p>
                )}
                {expense.bill_url && (
                  <div className="mt-2">
                    {expense.bill_url.toLowerCase().endsWith(".pdf") ? (
                      <a
                        href={expense.bill_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="text-sm text-primary hover:underline flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        View/Download Receipt
                      </a>
                    ) : (
                      <a href={expense.bill_url} download target="_blank">
                        <Image
                          src={expense.bill_url}
                          alt="Receipt"
                          width={80}
                          height={80}
                          className="rounded border object-cover"
                        />
                      </a>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/expense/edit/${expense.id}`)}
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
                          delete the expense record and its associated receipt.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(expense.id)}
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
