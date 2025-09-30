'use client'
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button"

interface User {
  id: number;
  email: string;
  enabled: boolean;
}
interface Attempt {
  ip: string;
  email: string;
  time: string;
}
export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const fetchUsers = async () => {
    try {
      const res = await axios.get<{ok: boolean, users: User[]}>("/api/admin/users");
      setUsers(res.data.users);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttempts = async () => {
    const res = await axios.get<{ ok: boolean; attempts: Attempt[] }>("/api/auth/check");
    setAttempts(res.data.attempts);
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p>Loading...</p>;

  const toggle = async (user_email:string) => {
    setLoadingUser(user_email);
    try {
      await axios.patch("/api/admin/users", { email: user_email });
    } catch(err) {
      console.log(err);
    } finally {
      setLoadingUser(null);
    }
  }

  return (
    <div className="flex w-full justify-center items-center min-h-screen">
    <div className="flex flex-col w-full justify-center items-center">
      <h3 className="text-xl">Users</h3>
      <ul className="w-full gap-5 flex flex-col">
        {users.map(user => (
          <li key={user.id} className="flex justify-between items-center m-5 border p-5 rounded-xl">
            {user.email}
            {loadingUser === user.email ? (
              <Button className="bg-gray-300 text-white cursor-not-allowed" disabled>
                Loading...
              </Button>
            ) : user.enabled ? (
              <Button
                className="cursor-pointer"
                onClick={() => toggle(user.email)}
              >
                Enabled
              </Button>
            ) : (
              <Button
                className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                onClick={() => toggle(user.email)}
              >
                Disabled
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
      <div className="p-5 m-10 w-full flex flex-col min-h-[500px]">
        <div className="flex">
            <h3 className="text-xl mr-5 text-center">Login Attempts</h3>
            <Button onClick={fetchAttempts} className="hover:cursor-pointer">FETCH LOGIN LOG</Button>
        </div>
        <ul className="w-full mt-3 border rounded-xl p-3 flex-1 overflow-y-auto ">
          {attempts.length === 0 && <p>No login attempts yet.</p>}
          {attempts.map((a, i) => (
            <li key={i} className="border-b py-2">
              <span className="font-bold">{a.email}</span> tried from <span className="text-blue-600">{a.ip}</span> at{" "}
              {new Date(a.time).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
  </div>
  );
}
