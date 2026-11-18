"use client";
/**
 * Komponen SelectInput: dropdown buatan sendiri (menggantikan <select> bawaan browser
 * yang tampilannya jadul). Cara pakainya SAMA dengan <select>: beri `value`, `onChange`,
 * dan anak berupa <option>. Daftar pilihan tampil sebagai kartu bergaya neo-brutalism.
 *
 * Keyboard: panah atas/bawah memindah pilihan, Enter/Spasi memilih, Esc menutup.
 * Aksesibilitas: memakai role "combobox" dan "listbox".
 */
import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEventHandler,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { borderClass, CONTROL } from "./control-styles";

/** Tinggi maksimal daftar pilihan (px) dan jarak aman dari tepi layar (px). */
const MAX_LIST_HEIGHT = 256;
const EDGE_GAP = 16;

/** Satu pilihan dropdown. */
interface SelectOption {
  value: string;
  label: string;
}

/** Mengubah anak <option> menjadi daftar { value, label }. */
function parseOptions(children: ReactNode): SelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];
    const element = child as ReactElement<{ value?: string | number; children?: ReactNode }>;
    const label = Children.toArray(element.props.children).join("");
    return [{ value: String(element.props.value ?? label), label }];
  });
}

interface SelectInputProps {
  value?: string | number;
  /** Dipanggil dengan objek mirip event: `event.target.value` berisi nilai terpilih. */
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  onFocus?: FocusEventHandler<HTMLButtonElement>;
  onBlur?: FocusEventHandler<HTMLButtonElement>;
  error?: string;
  className?: string;
  children?: ReactNode;
  id?: string;
  name?: string;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

export function SelectInput({ value, onChange, onFocus, onBlur, error, className, children, id, name, disabled, ...aria }: SelectInputProps) {
  const options = parseOptions(children);
  const selectedIndex = options.findIndex((option) => option.value === String(value ?? ""));
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  // Posisi daftar: ke atas bila ruang di bawah layar tidak cukup, dengan tinggi maksimal yang muat
  const [placement, setPlacement] = useState({ up: false, maxHeight: MAX_LIST_HEIGHT });
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  /**
   * Membuka daftar. Sebelum dibuka, ukur sisa ruang di atas dan di bawah komponen
   * (dalam layar) supaya daftar tidak terpotong tepi bawah layar.
   */
  function openList() {
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom - EDGE_GAP;
      const spaceAbove = rect.top - EDGE_GAP;
      const wanted = Math.min(MAX_LIST_HEIGHT, options.length * 40 + 16);
      const up = spaceBelow < wanted && spaceAbove > spaceBelow;
      setPlacement({ up, maxHeight: Math.max(120, Math.min(MAX_LIST_HEIGHT, up ? spaceAbove : spaceBelow)) });
    }
    setActiveIndex(Math.max(selectedIndex, 0));
    setOpen(true);
  }

  // Tutup dropdown bila pengguna mengklik di luar komponen
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  /** Memilih satu opsi lalu menutup daftar. */
  function choose(option: SelectOption) {
    onChange?.({ target: { value: option.value, name } } as unknown as ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  }

  /** Mengatur keyboard pada tombol dropdown. */
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") return setOpen(false);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) return openList();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => (current + step + options.length) % options.length);
    }
    if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      if (options[activeIndex]) choose(options[activeIndex]);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        name={name}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        disabled={disabled}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        onClick={() => (open ? setOpen(false) : openList())}
        className={cn(CONTROL, "flex items-center justify-between gap-3 pr-12 text-left", borderClass(error), className)}
        {...aria}
      >
        <span className={cn("truncate", (!selected || selected.value === "") && "text-ink-muted")}>{selected?.label || "Pilih"}</span>
        {/* Panah: berjarak dari tepi kanan, berputar saat terbuka */}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={cn("pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 transition-transform", open && "rotate-180")}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          style={{ maxHeight: placement.maxHeight }}
          className={cn(
            "absolute left-0 right-0 z-40 overflow-auto rounded-card border-2 border-ink bg-surface p-1.5 shadow-hard",
            placement.up ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]",
          )}
        >
          {options.map((option, index) => {
            const isSelected = option.value === String(value ?? "");
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()} // jaga fokus tetap di tombol
                onClick={() => choose(option)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-control px-3 py-2 text-sm",
                  index === activeIndex && "bg-accent-subtle",
                  isSelected && "font-semibold",
                )}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && (
                  <span aria-hidden className="text-accent">
                    ✓
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
