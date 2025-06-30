"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

type UserType = "admin" | "volunteer";

type User = {
  id: string;
  email: string;
  displayName: string;
  phone: string;
  userType: UserType;
};

export default function ListUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Users</h1>
        <Button asChild>
          <Link href="/users/add">Add User</Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users found.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {users.map((user) => (
            <li key={user.id} className="border rounded p-3 bg-card shadow-sm">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="font-medium">{user.displayName}</div>
                  <div className="text-muted-foreground">{user.email}</div>
                  <div className="text-xs text-muted-foreground">
                    {user.phone}
                  </div>
                  <div className="text-xs font-medium capitalize">
                    Type: {user.userType}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/users/edit/${user.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
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
                          disabled={isPending}
                        >
                          {isPending ? "Deleting..." : "Delete"}
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
