"use client";
/**
 * Komponen form: Field (pembungkus label + petunjuk + error), TextInput, TextArea,
 * dan SelectInput (dropdown kustom, ada di Select.tsx).
 * Error tampil di bawah field, diawali "[!]" (sudah ada di pesannya), dengan garis field lebih tebal,
 * dan dihubungkan lewat aria-describedby supaya terbaca pembaca layar.
 */
import { useId, useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { borderClass, CONTROL } from "./control-styles";

export { SelectInput } from "./Select";

interface FieldProps {
  label: string;
  /** Pesan error (sudah diawali [!]). Kosong = tidak ada error. */
  error?: string;
  hint?: string;
  required?: boolean;
  /** Fungsi yang menerima id dan atribut aksesibilitas untuk dipasang di kontrol. */
  children: (props: { id: string; "aria-describedby": string; "aria-invalid": boolean }) => ReactNode;
}

/** Pembungkus satu isian: label di atas, kontrol di tengah, petunjuk/error di bawah. */
export function Field({ label, error, hint, required, children }: FieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </label>
      {children({ id, "aria-describedby": messageId, "aria-invalid": Boolean(error) })}
      <p id={messageId} className={cn("text-xs", error ? "font-semibold text-danger" : "text-ink-muted")}>
        {error ?? hint}
      </p>
    </div>
  );
}

/** Kolom isian satu baris. */
export function TextInput({ error, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return <input className={cn(CONTROL, borderClass(error), className)} {...rest} />;
}

/** Kolom kata sandi dengan tombol ikon mata untuk melihat / menyembunyikan isinya. */
export function PasswordInput({ error, className, ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { error?: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input type={visible ? "text" : "password"} className={cn(CONTROL, borderClass(error), "pr-12", className)} {...rest} />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        aria-pressed={visible}
        title={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-control text-ink-soft hover:bg-subtle hover:text-ink"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={visible ? "M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7c1.7 0 3.2-.4 4.5-1M9.9 9.9a3 3 0 0 0 4.2 4.2" : "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"} />
        </svg>
      </button>
    </div>
  );
}

/** Kolom isian beberapa baris. */
export function TextArea({ error, className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return <textarea className={cn(CONTROL, "min-h-24", borderClass(error), className)} {...rest} />;
}
