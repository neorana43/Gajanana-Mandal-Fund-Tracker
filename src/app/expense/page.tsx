"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type ExpenseFormData = {
  userId: string;
  amount: string;
  category: string;
  note: string;
  billFile: File | null;
};

export default function ExpenseForm() {
  const supabase = createClient();
  const router = useRouter();

  const [users, setUsers] = useState<{ id: string; displayName: string }[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<ExpenseFormData>({
    defaultValues: {
      userId: "",
      amount: "",
      category: "",
      note: "",
      billFile: null as File | null,
    },
  });

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user;
      if (!currentUser) return;

      form.setValue("userId", currentUser.id);

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", currentUser.id)
        .single();

      if (roleData?.role === "admin") {
        setIsAdmin(true);
        // Fetch users from our reliable API endpoint
        const response = await fetch("/api/users/list");
        const data = await response.json();

        if (response.ok && data.users) {
          // The current user should be in the list from the API
          setUsers(data.users);
          // Set the default selection to the current user
          form.setValue("userId", currentUser.id);
        } else {
          // Fallback in case the API fails
          const adminUser = {
            id: currentUser.id,
            displayName: currentUser.user_metadata.display_name || "Admin",
          };
          setUsers([adminUser]);
          form.setValue("userId", adminUser.id);
        }
      }
    };

    init();
  }, []);

  const onSubmit = async (data: ExpenseFormData) => {
    if (!data.userId || !data.amount) {
      toast.error("Please fill all required fields.");
      return;
    }
    setLoading(true);
    let bill_url: string | null = null;
    if (data.billFile) {
      const filePath = `${data.userId}/${Date.now()}-${data.billFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(filePath, data.billFile);
      if (uploadError) {
        toast.error("Failed to upload bill.");
        console.error("Upload Error: ", uploadError);
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage
        .from("receipts")
        .getPublicUrl(uploadData.path);
      bill_url = urlData.publicUrl;
    }
    const { error } = await supabase.from("expenses").insert({
      user_id: data.userId,
      amount: Number(data.amount),
      category: data.category,
      note: data.note,
      date: new Date().toISOString(),
      bill_url,
    });
    setLoading(false);
    if (error) {
      console.error(error);
      toast.error("Failed to save expense.");
    } else {
      toast.success("Expense saved!");
      form.reset();
      router.push("/expense/list");
    }
  };

  return (
    <div className="p-4 pb-24 max-w-xl mx-auto">
      <div className="mb-4">
        <Link href="/expense/list">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
          </Button>
        </Link>
      </div>
      <h1 className="text-xl font-bold mb-4">Add Expense</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {isAdmin && (
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
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
                  <Textarea
                    placeholder="Optional description or bill info"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Controller
            control={form.control}
            name="billFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bill (Image or PDF)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-foreground file:text-primary hover:file:bg-primary-foreground/90"
                    onChange={(e) =>
                      field.onChange(e.target.files?.[0] || null)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Submit Expense"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
