"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type User = {
  id: string;
  email: string;
  role?: string;
};

export default function ManageUsersPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("volunteer");
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");

  const fetchUsers = async () => {
    const {
      data: { users: allUsers },
    } = await supabase.auth.admin.listUsers();
    const { data: roles } = await supabase.from("user_roles").select("*");

    const merged = (allUsers || []).map((u) => ({
      id: u.id,
      email: u.email || "",
      role: roles?.find((r) => r.id === u.id)?.role || "",
    }));
    setUsers(merged);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    setMessage("");

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      setMessage("❌ " + error.message);
      return;
    }

    const userId = data?.user?.id;
    if (!userId) return;

    const { error: roleError } = await supabase
      .from("user_roles")
      .insert([{ id: userId, role }]);

    if (roleError) {
      setMessage("⚠️ User created, but role not saved: " + roleError.message);
    } else {
      setMessage("✅ User created successfully");
      setEmail("");
      setPassword("");
      fetchUsers();
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("user_roles")
      .upsert({ id: userId, role: newRole });

    if (error) {
      alert("❌ Failed to update role: " + error.message);
    } else {
      alert("✅ Role updated");
      fetchUsers();
    }
  };

  const handlePasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "/reset-password",
    });

    if (error) {
      alert("❌ " + error.message);
    } else {
      alert(`✅ Password reset email sent to ${email}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-xl font-bold mb-6">👥 Manage Users</h1>

      <div className="space-y-3 mb-8 border p-4 rounded">
        <Label>Email</Label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />

        <Label>Password</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Label>Role</Label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="volunteer">Volunteer</option>
          <option value="admin">Admin</option>
        </select>

        <Button onClick={handleCreateUser}>Create User</Button>
        {message && <p className="text-sm mt-2 text-green-600">{message}</p>}
      </div>

      <h2 className="text-lg font-semibold mb-2">📋 Existing Users</h2>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Update</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">
                <select
                  value={u.role}
                  onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="border p-2 space-x-2 text-center">
                ✅
                <button
                  onClick={() => handlePasswordReset(u.email)}
                  className="text-blue-600 underline text-xs"
                >
                  Reset Password
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
