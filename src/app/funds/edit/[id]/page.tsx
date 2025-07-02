"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

type User = {
  id: string;
  displayName: string;
};

export default function EditAllocationPage() {
  const supabase = createClient();
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const form = useForm({
    defaultValues: {
      user: "",
      amount: "",
    },
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch all users for the dropdown
        const usersResponse = await fetch("/api/users/list");
        const usersData = await usersResponse.json();
        if (usersResponse.ok && usersData.users) {
          setUsers(usersData.users);
        } else {
          toast.error("Failed to fetch users.");
        }

        // Fetch the specific allocation to edit
        const { data: allocationData, error: allocationError } = await supabase
          .from("user_allocations")
          .select("*")
          .eq("id", id)
          .single();

        if (allocationError) {
          toast.error("Failed to fetch allocation data.");
          router.push("/funds/list");
        } else if (allocationData) {
          form.reset({
            user: allocationData.user_id || "",
            amount: String(allocationData.amount),
          });
        }
      } catch (error) {
        toast.error("An error occurred while loading data.");
        console.error("Fetch Initial Data Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInitialData();
    }
  }, [id, router, supabase, form]);

  const onSubmit = async (data: { user: string; amount: string }) => {
    if (!data.user || !data.amount) {
      toast.error("All fields are required.");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("user_allocations")
      .update({
        user_id: data.user,
        amount: parseFloat(data.amount),
      })
      .eq("id", id);
    setLoading(false);
    if (error) {
      toast.error("Failed to update allocation.");
      console.error(error);
    } else {
      toast.success("Allocation updated successfully!");
      router.push("/funds/list");
    }
  };

  if (loading) {
    return (
      <div className="p-4 pb-24 max-w-2xl w-full mx-auto">
        <Card className="w-full p-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent" />
          </div>
          <div className="w-2/3 h-6 mb-2">
            <div className="bg-accent/40 animate-pulse rounded-full w-full h-full" />
          </div>
          <div className="w-1/2 h-4">
            <div className="bg-accent/30 animate-pulse rounded-full w-full h-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl w-full mx-auto">
      <div className="flex items-center mb-4">
        <Link href="/funds/list">
          <Button variant="glass" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold ml-4">Edit Fund</h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="user"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select User</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
