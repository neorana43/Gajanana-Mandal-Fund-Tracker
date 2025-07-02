"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Pencil, Plus, UserCheck, UserX } from "lucide-react";
import Link from "next/link";

type UserType = "admin" | "volunteer";

type User = {
  id: string;
  email: string;
  displayName: string;
  phone: string;
  userType: UserType;
  active?: boolean;
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

  const handleToggleActive = async (userId: string, setActive: boolean) => {
    startTransition(async () => {
      const response = await fetch("/api/users/delete", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, setActive }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to update user status.");
      } else {
        toast.success(setActive ? "User activated!" : "User deactivated!");
        fetchUsers();
      }
    });
  };

  return (
    <div className="p-4 pb-24 max-w-2xl w-full mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Users</h1>
        <Link href="/users/add">
          <Button className="text-xs">
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users found.</p>
      ) : (
        <ul className="space-y-4 text-sm">
          {users.map((user) => (
            <li key={user.id}>
              <Card className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 w-full">
                      <div className="text-xs text-muted-foreground font-medium col-span-1">
                        Name:
                      </div>
                      <div className="col-span-1 font-medium">
                        {user.displayName}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium col-span-1">
                        Email:
                      </div>
                      <div className="col-span-1">{user.email}</div>
                      <div className="text-xs text-muted-foreground font-medium col-span-1">
                        Number:
                      </div>
                      <div className="col-span-1">{user.phone}</div>
                      <div className="text-xs text-muted-foreground font-medium col-span-1">
                        Type:
                      </div>
                      <div className="col-span-1 capitalize">
                        {user.userType}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      (window.location.href = `/users/edit/${user.id}`)
                    }
                  >
                    <Pencil className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant={
                          user.active === false ? "secondary" : "destructive"
                        }
                        size="sm"
                      >
                        {user.active === false ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-2 " />
                            Activate
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3 mr-2 " />
                            Deactivate
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {user.active === false
                            ? "Activate User"
                            : "Deactivate User"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {user.active === false
                            ? `Are you sure you want to activate ${user.displayName}?`
                            : `Are you sure you want to deactivate ${user.displayName}? This user will not be able to log in until reactivated.`}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleToggleActive(user.id, user.active === false)
                          }
                          disabled={isPending}
                        >
                          {isPending
                            ? user.active === false
                              ? "Activating..."
                              : "Deactivating..."
                            : user.active === false
                            ? "Activate"
                            : "Deactivate"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
