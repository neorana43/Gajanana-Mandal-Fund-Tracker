"use client";

import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

type UserType = "admin" | "volunteer";

export default function AddUserPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const displayName = formData.get("displayName") as string;
    const phone = formData.get("phone") as string;
    const userType = formData.get("userType") as UserType;

    if (!userType) {
      toast.error("Please select a user type.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName, phone, userType }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to create user.");
      } else {
        toast.success("User created successfully!");
        router.push("/users/list");
      }
    });
  };

  return (
    <div className="p-4 pb-24 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Add New User</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="displayName" className="mb-1.5 block">
            Display Name
          </Label>
          <Input
            id="displayName"
            name="displayName"
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <Label htmlFor="email" className="mb-1.5 block">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="newuser@example.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="password" className="mb-1.5 block">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone" className="mb-1.5 block">
            Phone Number (Optional)
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+91 98765 43210"
          />
        </div>

        <div>
          <Label htmlFor="userType" className="mb-1.5 block">
            User Type
          </Label>
          <Select name="userType" required>
            <SelectTrigger>
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="volunteer">Volunteer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Creating..." : "Create User"}
        </Button>
      </form>
    </div>
  );
}
