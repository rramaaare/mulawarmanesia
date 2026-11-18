"use client";
/**
 * AccountManager: halaman Akun admin untuk superadmin. Menampilkan daftar akun dan memungkinkan:
 * menambah akun, menonaktifkan/mengaktifkan, dan mereset kata sandi. Aturan pengaman
 * (tidak boleh menonaktifkan diri sendiri / superadmin terakhir) dijaga di server dan
 * pesannya ditampilkan di sini.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, PasswordInput, SelectInput, TextInput } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Tag } from "@/components/ui/Tag";
import { formatDateShort } from "@/lib/format";
import type { AdminAccount } from "@/server/services/account-service";
import { callAdminApi } from "./admin-api";

export function AccountManager({ accounts, selfEmail }: { accounts: AdminAccount[]; selfEmail: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const [resetTarget, setResetTarget] = useState<AdminAccount | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState<string>();
  const [form, setForm] = useState({ email: "", name: "", password: "", role: "ADMIN" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  /** Aktifkan atau nonaktifkan satu akun. */
  async function toggleActive(account: AdminAccount) {
    setMessage(undefined);
    const result = await callAdminApi(`/api/admin/akun/${account.id}`, "PATCH", { active: !account.active }, account.active ? "Akun dinonaktifkan." : "Akun diaktifkan.");
    if (!result.ok) setMessage(result.message);
    else router.refresh();
  }

  /** Simpan kata sandi baru untuk akun yang dipilih di dialog. */
  async function submitReset() {
    if (!resetTarget) return;
    setResetError(undefined);
    const result = await callAdminApi(`/api/admin/akun/${resetTarget.id}`, "PATCH", { password: newPassword }, "Kata sandi diganti.");
    if (!result.ok) {
      setResetError(result.message);
      return;
    }
    setResetTarget(null);
    setNewPassword("");
    setMessage(undefined);
    router.refresh();
  }

  /** Buat akun baru dari form. */
  async function submitCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    setMessage(undefined);
    const result = await callAdminApi("/api/admin/akun", "POST", form, "Akun baru dibuat.");
    setSaving(false);
    if (!result.ok) {
      setErrors(result.fields ?? {});
      if (!result.fields) setMessage(result.message);
      return;
    }
    setForm({ email: "", name: "", password: "", role: "ADMIN" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex min-w-0 flex-col gap-4">
        {message && <Alert tone="danger">{message}</Alert>}
        <Card className="overflow-x-auto !p-0">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-ink bg-subtle">
                {["Akun", "Peran", "Status", "Dibuat", "Aksi"].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{account.name}</p>
                    <p className="text-xs text-ink-muted">{account.email}{account.email === selfEmail && " (kamu)"}</p>
                  </td>
                  <td className="px-4"><Tag tone={account.role === "SUPERADMIN" ? "dark" : "neutral"}>{account.role === "SUPERADMIN" ? "Superadmin" : "Admin"}</Tag></td>
                  <td className="px-4"><Tag tone={account.active ? "success" : "warning"}>{account.active ? "Aktif" : "Nonaktif"}</Tag></td>
                  <td className="px-4">{formatDateShort(account.createdAt)}</td>
                  <td className="px-4">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => toggleActive(account)}>{account.active ? "Nonaktifkan" : "Aktifkan"}</Button>
                      <Button size="sm" variant="secondary" onClick={() => { setResetTarget(account); setNewPassword(""); setResetError(undefined); }}>Reset sandi</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Form tambah akun */}
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Tambah akun</h2>
        <form onSubmit={submitCreate} noValidate className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Nama" required error={errors.name}>
            {(props) => <TextInput {...props} error={errors.name} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />}
          </Field>
          <Field label="Email" required error={errors.email}>
            {(props) => <TextInput {...props} type="email" error={errors.email} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />}
          </Field>
          <Field label="Kata sandi awal" required error={errors.password} hint="Minimal 8 karakter.">
            {(props) => <PasswordInput {...props} autoComplete="new-password" error={errors.password} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />}
          </Field>
          <Field label="Peran">
            {(props) => (
              <SelectInput {...props} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <option value="ADMIN">Admin (pesanan)</option>
                <option value="SUPERADMIN">Superadmin (semua)</option>
              </SelectInput>
            )}
          </Field>
          <Button type="submit" disabled={saving} className="w-fit sm:col-span-2 lg:col-span-4">{saving ? "Menyimpan…" : "Tambah akun"}</Button>
        </form>
      </Card>

      {/* Dialog reset kata sandi */}
      <Modal open={resetTarget !== null} title="Reset kata sandi" onClose={() => setResetTarget(null)}>
        <p className="mb-3 text-sm text-ink-soft">Kata sandi baru untuk <span className="font-semibold">{resetTarget?.email}</span>.</p>
        <Field label="Kata sandi baru" error={resetError} hint="Minimal 8 karakter.">
          {(props) => <PasswordInput {...props} autoComplete="new-password" error={resetError} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />}
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setResetTarget(null)}>Batal</Button>
          <Button onClick={submitReset}>Simpan</Button>
        </div>
      </Modal>
    </div>
  );
}
