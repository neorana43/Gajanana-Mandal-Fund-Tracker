"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
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
import { Card } from "@/components/ui/card";

export default function EditSponsorPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const slug = params.slug as string;

  const form = useForm({
    defaultValues: {
      sponsorName: "",
      amount: "",
      category: "",
      description: "",
      isFull: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchSponsor = async () => {
      if (!id) return;
      setIsFetching(true);
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Failed to fetch sponsor details.");
        router.push(`/mandal/${slug}/secret/list`);
      } else {
        form.reset({
          sponsorName: data.sponsor_name,
          amount: data.amount.toString(),
          category: data.category,
          description: data.description || "",
          isFull: data.is_full || false,
        });
      }
      setIsFetching(false);
    };

    fetchSponsor();
  }, [id, router, form, supabase]);

  const onSubmit = async (data: Record<string, string | boolean>) => {
    if (!data.sponsorName || !data.amount) {
      toast.error("Please fill all required fields.");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("sponsors")
      .update({
        sponsor_name: data.sponsorName,
        amount: Number(data.amount),
        category: data.category,
        description: data.description,
        is_full: data.isFull,
      })
      .eq("id", id);
    setLoading(false);
    if (error) {
      toast.error("Failed to update sponsor.");
    } else {
      toast.success("Sponsor updated successfully!");
      router.push(`/mandal/${slug}/secret/list`);
    }
  };

  if (isFetching) {
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
    <div className="p-4 pb-24 max-w-2xl w-full mx-auto">
      <Card className="w-full p-8">
        <div className="flex items-center mb-4">
          <Link href={`/mandal/${slug}/secret/list`}>
            <Button variant="glass" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold ml-4">Edit Sponsor</h1>
        </div>
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
                  <FormLabel>Full Sponsorship</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="isFull"
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
              {loading ? "Saving..." : "Update Sponsor"}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
