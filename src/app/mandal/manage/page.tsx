"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash, ArrowRight, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Define Mandal type
interface Mandal {
  id: string;
  name: string;
  description?: string;
  slug?: string;
}

export default function ManageMandalsPage() {
  const [mandals, setMandals] = useState<Mandal[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [showInviteId, setShowInviteId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("volunteer");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchMandals = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/mandals/list");
        const data = await response.json();
        if (!response.ok) {
          toast.error(data.error || "Failed to fetch mandals.");
        } else {
          setMandals(data.mandals || []);
        }
      } catch {
        toast.error("Could not load mandals.");
      } finally {
        setLoading(false);
      }
    };
    fetchMandals();
  }, []);

  useEffect(() => {
    // Check if user is admin for any mandal (simple check: if any mandal.owner_id matches current user)
    // In a real app, fetch user id from session or context
    // For now, if mandals exist, allow invite (for demo)
    setIsAdmin(mandals.length > 0);
  }, [mandals]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mandal?")) return;
    const response = await fetch("/api/mandals/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.error || "Failed to delete mandal.");
    } else {
      toast.success("Mandal deleted successfully!");
      setMandals((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="p-4 pb-24 max-w-2xl w-full mx-auto">
      <Card className="w-full p-8">
        <TooltipProvider>
          <div className="flex items-center mb-4 justify-between">
            <h1 className="text-xl font-bold">Manage Mandals</h1>
            <div className="flex gap-2">
              <Link href="/mandal/manage/create">
                <Button className="text-xs">
                  <Plus className="mr-2 h-4 w-4" /> Add Mandal
                </Button>
              </Link>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : mandals.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No mandals found.
            </div>
          ) : (
            <ul className="space-y-4">
              {mandals.map((mandal) => (
                <li key={mandal.id}>
                  <Card className="flex flex-col sm:flex-row sm:items-center justify-between p-4">
                    <div>
                      <div className="font-semibold text-lg">{mandal.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {mandal.description}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 sm:mt-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Edit"
                            onClick={() =>
                              router.push(`/mandal/manage/edit/${mandal.id}`)
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            aria-label="Delete"
                            onClick={() => handleDelete(mandal.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="default"
                            size="icon"
                            aria-label="Go to Mandal"
                            onClick={() => {
                              const mandalSlug = mandal.slug || mandal.id;
                              router.push(`/mandal/${mandalSlug}/dashboard`);
                            }}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Go to Mandal</TooltipContent>
                      </Tooltip>
                      <Dialog
                        open={showInviteId === mandal.id}
                        onOpenChange={(open) =>
                          setShowInviteId(open ? mandal.id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="Invite User"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Invite User to {mandal.name}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block mb-1 font-medium">
                                Email
                              </label>
                              <Input
                                type="email"
                                value={
                                  showInviteId === mandal.id ? inviteEmail : ""
                                }
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="user@example.com"
                              />
                            </div>
                            <div>
                              <label className="block mb-1 font-medium">
                                Role
                              </label>
                              <select
                                className="bg-white dark:bg-gray-800 border-2 border-white/80 rounded-full px-4 py-2 text-base font-normal shadow-[0_2px_8px_0_rgba(80,120,255,0.08)] focus:border-primary focus:ring-2 focus:ring-primary transition-all duration-200 w-full disabled:cursor-not-allowed disabled:opacity-50  outline-1 outline-white/30"
                                value={
                                  showInviteId === mandal.id
                                    ? inviteRole
                                    : "volunteer"
                                }
                                onChange={(e) => setInviteRole(e.target.value)}
                              >
                                <option value="volunteer">Volunteer</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                            <Button
                              className="w-full mt-2"
                              disabled={!inviteEmail}
                              onClick={async () => {
                                const res = await fetch("/api/mandals/invite", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    mandal_id: mandal.id,
                                    email: inviteEmail,
                                    role: inviteRole,
                                  }),
                                });
                                const result = await res.json();
                                if (res.ok) {
                                  toast.success("User invited!");
                                  setShowInviteId(null);
                                  setInviteEmail("");
                                  setInviteRole("volunteer");
                                } else {
                                  toast.error(
                                    result.error || "Failed to invite user.",
                                  );
                                }
                              }}
                            >
                              Send Invite
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </TooltipProvider>
      </Card>
    </div>
  );
}
