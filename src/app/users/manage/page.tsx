"use client";

import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2 } from "lucide-react";

type UserType = "admin" | "volunteer";

type User = {
  id: string;
  email: string;
  displayName: string;
  phone: string;
  userType: UserType;
};

type EditUserFormData = {
  id: string;
  email: string;
  displayName: string;
  phone: string;
  userType: UserType;
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [editingUser, setEditingUser] = useState<EditUserFormData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users/list");
      if (!response.ok) {
        throw new Error("Failed to fetch users.");
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch {
      toast.error("Could not load user list.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
        (event.target as HTMLFormElement).reset();
        fetchUsers();
      }
    });
  };

  const handleEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser) return;

    startTransition(async () => {
      const response = await fetch("/api/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to update user.");
      } else {
        toast.success("User updated successfully!");
        setIsEditDialogOpen(false);
        setEditingUser(null);
        fetchUsers();
      }
    });
  };

  const handleDelete = async (userId: string) => {
    startTransition(async () => {
      const response = await fetch("/api/users/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to delete user.");
      } else {
        toast.success("User deleted successfully!");
        fetchUsers();
      }
    });
  };

  return (
    <div className="p-4 pb-24 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Manage Users</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="edit-displayName" className="mb-1.5 block">
                Display Name
              </Label>
              <Input
                id="edit-displayName"
                value={editingUser?.displayName || ""}
                onChange={(e) =>
                  setEditingUser(
                    (prev) => prev && { ...prev, displayName: e.target.value },
                  )
                }
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-email" className="mb-1.5 block">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editingUser?.email || ""}
                onChange={(e) =>
                  setEditingUser(
                    (prev) => prev && { ...prev, email: e.target.value },
                  )
                }
                placeholder="user@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-phone" className="mb-1.5 block">
                Phone Number (Optional)
              </Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editingUser?.phone || ""}
                onChange={(e) =>
                  setEditingUser(
                    (prev) => prev && { ...prev, phone: e.target.value },
                  )
                }
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <Label htmlFor="edit-userType" className="mb-1.5 block">
                User Type
              </Label>
              <Select
                value={editingUser?.userType}
                onValueChange={(value: UserType) =>
                  setEditingUser((prev) => prev && { ...prev, userType: value })
                }
              >
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
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <h2 className="text-lg font-semibold mb-2">Existing Users</h2>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users found.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {users.map((user) => (
            <li key={user.id} className="border rounded p-3 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="font-medium">{user.displayName}</div>
                  <div className="text-muted-foreground">{user.email}</div>
                  <div className="text-xs text-muted-foreground">
                    {user.phone}
                  </div>
                  <div className="text-xs font-medium">
                    Type: {user.userType}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingUser(user);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {user.displayName}?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(user.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
