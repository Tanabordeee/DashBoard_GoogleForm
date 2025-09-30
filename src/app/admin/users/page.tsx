'use client'
import { useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: number;
  email: string;
  enabled: boolean;
}

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get<User[]>("/api/admin/users");
        setUsers(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h3>Users</h3>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.email} - {user.enabled ? "Enabled" : "Disabled"}
          </li>
        ))}
      </ul>
    </div>
  );
}
