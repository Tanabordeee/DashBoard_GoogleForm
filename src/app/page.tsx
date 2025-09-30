'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await axios.post('/api/admin/login', {email, password});
      console.log('Login result:', result.data);
      if(result.status === 200){
        router.push("/admin/users");
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={submit}>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="admin email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
