"use client";
/**
 * LoginForm: form login admin (email + kata sandi).
 * Pesan gagal berasal dari server dan sama untuk email salah / sandi salah.
 */
import { toast } from "@/lib/toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, PasswordInput, TextInput } from "@/components/ui/Field";

export function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  /** Kirim email + sandi ke server; berhasil -> buka dashboard. */
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).then((r) => r.json());
    setLoading(false);
    if (!response.ok) {
      const text = response.fields ? Object.values<string>(response.fields)[0] : response.message;
      toast.error(text ?? "Gagal masuk. Coba lagi.");
      return;
    }
    toast.success("Berhasil masuk.");
    router.push("/admin");
    router.refresh();
  }

  return (
    <Card className="mx-auto flex w-full max-w-md flex-col gap-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">Panel admin</p>
      <h1 className="text-3xl font-semibold">Masuk</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Email" required>
          {(props) => <TextInput {...props} type="email" autoComplete="username" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} />}
        </Field>
        <Field label="Kata sandi" required>
          {(props) => <PasswordInput {...props} autoComplete="current-password" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} />}
        </Field>
        <Button type="submit" size="lg" disabled={loading}>{loading ? "Memeriksa…" : "Masuk →"}</Button>
      </form>
    </Card>
  );
}
