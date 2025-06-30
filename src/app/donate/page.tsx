"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
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
import Link from "next/link";

export default function DonatePage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  type DonateFormData = {
    donorName: string;
    houseNumber: string;
    amount: string;
    contact: string;
    isRecurring: boolean;
  };

  const form = useForm<DonateFormData>({
    defaultValues: {
      donorName: "",
      houseNumber: "",
      amount: "",
      contact: "",
      isRecurring: false,
    },
  });

  const onSubmit = async (data: DonateFormData) => {
    if (!data.donorName || !data.amount) {
      toast.error("Please fill all required fields.");
      return;
    }
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to create a donation.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("donations").insert({
      donor_name: data.donorName,
      amount: Number(data.amount),
      contact: data.contact || null,
      is_recurring: data.isRecurring,
      house_number: data.houseNumber || null,
      created_by: user.id,
    });
    setLoading(false);
    if (error) {
      toast.error("Failed to submit donation.");
      console.error("Error submitting donation:", error);
    } else {
      toast.success("Donation saved!");
      form.reset();
      router.push("/donate/list");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center mb-4">
        <Link href="/donate/list">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold ml-4">Make a Donation</h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="donorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your Name" required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="houseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>House Number (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Information (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Any additional contact information"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isRecurring"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recurring Donation</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="isRecurring"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Submit Donation"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
