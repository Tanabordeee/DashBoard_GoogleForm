'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await axios.post('/api/admin/login', {email, password},   { withCredentials: true } );
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
    <div className="flex justify-center items-center h-screen">

  <form
    onSubmit={submit}
    className="flex flex-col p-8  gap-5 w-[30%] shadow-md rounded-xl">
    <h1>LOGIN</h1>
    <Input
      className="w-full p-5"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="admin email"
      required
    />
    <Input
      className="w-full p-5"
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="password"
      required
    />
    <Button type="submit" disabled={loading}>
      {loading ? "Signing in..." : "Sign in"}
    </Button>
  </form>
</div>


  );
}
