"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
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

export default function EditDonationPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  type EditDonationFormData = {
    donorName: string;
    houseNumber: string;
    amount: string;
    contact: string;
    isRecurring: boolean;
  };

  const form = useForm<EditDonationFormData>({
    defaultValues: {
      donorName: "",
      houseNumber: "",
      amount: "",
      contact: "",
      isRecurring: false,
    },
  });

  useEffect(() => {
    const fetchDonation = async () => {
      if (!id) return;
      setIsFetching(true);
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Failed to fetch donation details.");
        router.push("/donate/list");
      } else {
        form.reset({
          donorName: data.donor_name,
          houseNumber: data.house_number || "",
          amount: data.amount.toString(),
          contact: data.contact || "",
          isRecurring: data.is_recurring || false,
        });
      }
      setIsFetching(false);
    };

    fetchDonation();
  }, [id, router]);

  const onSubmit = async (data: EditDonationFormData) => {
    if (!data.donorName || !data.amount) {
      toast.error("Please fill all required fields.");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("donations")
      .update({
        donor_name: data.donorName,
        amount: Number(data.amount),
        contact: data.contact,
        house_number: data.houseNumber,
        is_recurring: data.isRecurring,
      })
      .eq("id", id);
    setLoading(false);
    if (error) {
      toast.error("Failed to update donation.");
    } else {
      toast.success("Donation updated successfully!");
      router.push("/donate/list");
    }
  };

  if (isFetching) {
    return (
      <div className="p-4 max-w-xl mx-auto">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 max-w-xl mx-auto">
      <div className="flex items-center mb-4">
        <Link href="/donate/list" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold mb-4">Edit Donation</h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="donorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Donor Name</FormLabel>
                <FormControl>
                  <Input required {...field} />
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
                  <Input type="number" required {...field} />
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
                <FormLabel>Contact (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="isRecurring"
                    />
                  </FormControl>
                  <label
                    htmlFor="isRecurring"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Is this a recurring donation?
                  </label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Update Donation"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
