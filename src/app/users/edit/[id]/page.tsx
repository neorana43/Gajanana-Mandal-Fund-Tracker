"use client";

import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useParams } from "next/navigation";
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

type UserType = "admin" | "volunteer";

type EditUserFormData = {
  id: string;
  email: string;
  displayName: string;
  phone: string;
  userType: UserType;
};

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<EditUserFormData | null>(null);

  const form = useForm<EditUserFormData>({
    defaultValues: {
      id: userId,
      email: "",
      displayName: "",
      phone: "",
      userType: "volunteer",
    },
  });

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/list?id=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user data.");
        }
        const data = await response.json();
        const currentUser = data.users?.[0];

        if (currentUser) {
          setUser(currentUser);
          form.reset(currentUser);
        } else {
          toast.error("User not found.");
          router.push("/users/list");
        }
      } catch {
        toast.error("Could not load user data.");
        router.push("/users/list");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, router]);

  const onSubmit = (data: EditUserFormData) => {
    startTransition(async () => {
      const response = await fetch("/api/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to update user.");
      } else {
        toast.success("User updated successfully!");
        router.push("/users/list");
      }
    });
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

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 pb-24 max-w-2xl w-full mx-auto">
      <Card className="w-full p-8">
        <div className="flex items-center mb-4">
          <Link href="/users/list">
            <Button variant="glass" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold ml-4">Edit User</h1>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="user@example.com"
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+91 98765 43210"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="volunteer">Volunteer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="glass"
              className="w-full mt-5"
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
