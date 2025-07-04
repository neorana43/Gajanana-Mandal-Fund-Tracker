"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
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
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

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
  const { slug } = useParams();
  const [mandal, setMandal] = useState<{ id: string } | null>(null);
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
    async function fetchMandal() {
      const { data, error } = await supabase
        .from("mandals")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) {
        toast.error("Mandal not found.");
      } else {
        setMandal(data);
      }
    }
    if (slug) fetchMandal();
  }, [slug]);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user;
      if (!currentUser) return;

      form.setValue("userId", currentUser.id);

      // TODO: Update user_roles and user list to be mandal-aware if needed
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", currentUser.id)
        .single();

      if (roleData?.role === "admin") {
        setIsAdmin(true);
        // Fetch users from our reliable API endpoint
        const response = await fetch(`/api/users/list?mandal_slug=${slug}`);
        const data = await response.json();

        if (response.ok && data.users) {
          setUsers(data.users);
          form.setValue("userId", currentUser.id);
        } else {
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
  }, [form, supabase, slug]);

  const onSubmit = async (data: ExpenseFormData) => {
    if (!data.userId || !data.amount) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (!mandal) {
      toast.error("Mandal not loaded.");
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
      mandal_id: mandal.id,
    });
    setLoading(false);
    if (error) {
      console.error(error);
      toast.error("Failed to save expense.");
    } else {
      toast.success("Expense saved!");
      form.reset();
      router.push(`/mandal/${slug}/expense/list`);
    }
  };

  return (
    <div className="p-4 pb-24 max-w-2xl w-full mx-auto">
      <Card className="w-full p-8">
        <div className="flex items-center mb-4">
          <Link href={`/mandal/${slug}/expense/list`}>
            <Button variant="glass" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold ml-4">Add Expense</h1>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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
                        <SelectTrigger>
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
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bill (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) =>
                        field.onChange(e.target.files?.[0] || null)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="glass"
              className="w-full mt-5"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Expense"}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
