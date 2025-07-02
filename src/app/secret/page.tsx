"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function AddSponsorPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const form = useForm({
    defaultValues: {
      sponsorName: "",
      amount: "",
      category: "",
      description: "",
      isFull: false,
    },
  });

  const onSubmit = async (data: Record<string, string | boolean>) => {
    if (!data.sponsorName || !data.amount) {
      toast.error("Sponsor name and amount are required.");
      return;
    }
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to create a sponsor record.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("sponsors").insert({
      sponsor_name: data.sponsorName,
      amount: Number(data.amount),
      category: data.category,
      description: data.description,
      is_full: data.isFull,
      created_by: user.id,
    });
    setLoading(false);
    if (error) {
      toast.error(`Failed to save sponsor: ${error.message}`);
    } else {
      toast.success("Sponsor added successfully!");
      router.push("/secret/list");
    }
  };

  return (
    <div className="p-4 pb-24 max-w-2xl w-full mx-auto">
      <div className="flex items-center mb-4">
        <Link href="/secret/list">
          <Button variant="glass" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold ml-4">Add Sponsor</h1>
      </div>

      <Card className="w-full p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sponsorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sponsor Name</FormLabel>
                  <FormControl>
                    <Input required {...field} />
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isFull"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="isFull"
                      />
                    </FormControl>
                    <label
                      htmlFor="isFull"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Is this a full sponsorship?
                    </label>
                  </div>
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
              {loading ? "Saving..." : "Add Sponsor"}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
