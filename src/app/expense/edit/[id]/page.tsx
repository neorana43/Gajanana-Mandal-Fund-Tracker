"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tables } from "@/types/supabase";
import { ArrowLeft, X, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";

type Expense = Tables<"expenses">;

export default function EditExpensePage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [expense, setExpense] = useState<Expense | null>(null);
  const [removeBill, setRemoveBill] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  type EditExpenseFormData = {
    amount: string;
    category: string;
    note: string;
    date: string;
    billFile: File | null;
  };

  const form = useForm<EditExpenseFormData>({
    defaultValues: {
      amount: "",
      category: "",
      note: "",
      date: "",
      billFile: null,
    },
  });

  useEffect(() => {
    const fetchExpense = async () => {
      if (!id) return;
      setIsFetching(true);
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Failed to fetch expense details.");
        router.push("/expense/list");
      } else {
        setExpense(data);
        form.reset({
          amount: data.amount.toString(),
          category: data.category,
          note: data.description || "",
          date: new Date(data.date).toISOString().split("T")[0],
          billFile: null,
        });
      }
      setIsFetching(false);
    };

    fetchExpense();
  }, [id, router, form, supabase]);

  const onSubmit = async (data: EditExpenseFormData) => {
    if (!data.amount) {
      toast.error("Amount is a required field.");
      return;
    }
    setLoading(true);
    let updated_bill_url = expense?.bill_url;
    // Handle bill removal
    if (removeBill && updated_bill_url) {
      const filePath = new URL(updated_bill_url).pathname.split(
        "/receipts/",
      )[1];
      if (filePath) {
        await supabase.storage.from("receipts").remove([filePath]);
      }
      updated_bill_url = null;
    }
    // Handle new bill upload
    if (data.billFile) {
      // If there's an old bill, remove it first
      if (updated_bill_url) {
        const oldFilePath = new URL(updated_bill_url).pathname.split(
          "/receipts/",
        )[1];
        if (oldFilePath) {
          await supabase.storage.from("receipts").remove([oldFilePath]);
        }
      }
      // Upload the new file
      if (expense) {
        const filePath = `${expense.user_id}/${Date.now()}-${
          data.billFile.name
        }`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(filePath, data.billFile);
        if (uploadError) {
          toast.error("Failed to upload new bill.");
          setLoading(false);
          return;
        }
        const { data: urlData } = supabase.storage
          .from("receipts")
          .getPublicUrl(uploadData.path);
        updated_bill_url = urlData.publicUrl;
      }
    }
    const { error } = await supabase
      .from("expenses")
      .update({
        amount: Number(data.amount),
        category: data.category,
        description: data.note,
        date: data.date,
        bill_url: updated_bill_url,
      })
      .eq("id", id);
    setLoading(false);
    if (error) {
      toast.error("Failed to update expense.");
    } else {
      toast.success("Expense updated successfully!");
      router.push("/expense/list");
    }
  };

  const handleRemoveBill = () => {
    setRemoveBill(true);
    setExpense((prev) => (prev ? { ...prev, bill_url: null } : null));
  };

  if (isFetching) {
    return (
      <div className="p-4 max-w-2xl w-full mx-auto">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 max-w-2xl w-full mx-auto">
      <Card className="w-full p-8">
        <div className="flex items-center mb-4">
          <Link href="/expense/list">
            <Button variant="glass" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold ml-4">Edit Expense</h1>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Label htmlFor="bill" className="mb-1.5 block">
                Bill (Image or PDF)
              </Label>
              {expense?.bill_url && !removeBill && (
                <div className="mb-2">
                  {expense.bill_url.toLowerCase().endsWith(".pdf") ? (
                    <div className="flex items-center p-2 rounded-md border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                      <FileText className="h-8 w-8 text-red-500 mr-3" />
                      <a
                        href={expense.bill_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="text-sm text-primary hover:underline flex-1"
                      >
                        View/Download PDF Receipt
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={handleRemoveBill}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative w-32 h-32">
                      <a href={expense.bill_url} download target="_blank">
                        <Image
                          src={expense.bill_url}
                          alt="Receipt"
                          layout="fill"
                          className="rounded border object-cover"
                        />
                      </a>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={handleRemoveBill}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
              <Input
                id="bill"
                type="file"
                onChange={(e) =>
                  form.setValue("billFile", e.target.files?.[0] || null)
                }
                accept="image/*,application/pdf"
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-foreground file:text-primary hover:file:bg-primary-foreground/90"
              />
            </div>
            <Button
              type="submit"
              variant="glass"
              className="w-full mt-5"
              disabled={loading}
            >
              {loading ? "Saving..." : "Update Expense"}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
