"use client";
/**
 * PagedTable: tabel dengan pengaturan jumlah baris ("Tampilkan N entri"), keterangan
 * "Menampilkan x–y dari z", dan tombol Sebelumnya/Berikutnya. Datanya sudah lengkap di browser,
 * jadi mengubah jumlah baris atau halaman tidak memanggil server. Dipakai di semua tabel dashboard.
 */
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectInput } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import type { Cell, TableData } from "@/lib/domain/table";

/** Pilihan jumlah baris. */
const PER_PAGE_OPTIONS = [5, 10, 25, 50];

/** Menampilkan satu sel: angka diberi pemisah ribuan, objek berupa tautan. */
function renderCell(cell: Cell) {
  if (typeof cell === "number") return cell.toLocaleString("id-ID");
  if (typeof cell === "object") return <Link href={cell.href} className="whitespace-nowrap font-semibold hover:underline">{cell.text}</Link>;
  return cell;
}

interface PagedTableProps {
  table: TableData;
  defaultPerPage?: number;
  emptyText?: string;
}

export function PagedTable({ table, defaultPerPage = 5, emptyText = "Belum ada data." }: PagedTableProps) {
  const [perPage, setPerPage] = useState(defaultPerPage);
  const [page, setPage] = useState(1);

  const total = table.rows.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(page, pageCount); // jaga agar halaman tidak melewati batas saat jumlah baris diubah
  const startIndex = (current - 1) * perPage;
  const visible = table.rows.slice(startIndex, startIndex + perPage);

  return (
    <div className="flex flex-col gap-3">
      {/* Pengaturan jumlah baris */}
      <div className="flex items-center gap-2 text-sm text-ink-soft">
        <span>Tampilkan</span>
        <div className="w-24">
          <SelectInput
            aria-label="Jumlah entri per halaman"
            value={perPage}
            className="!py-1.5"
            onChange={(event) => {
              setPerPage(Number(event.target.value));
              setPage(1);
            }}
          >
            {PER_PAGE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </SelectInput>
        </div>
        <span>entri</span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[420px] overflow-hidden rounded-card border-2 border-ink">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-ink text-white">
                {table.columns.map((column, index) => (
                  <th key={column} className={cn("whitespace-nowrap px-4 py-3 font-medium", table.align?.[index] === "right" ? "text-right" : "text-left")}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && <tr><td colSpan={table.columns.length} className="px-4 py-8 text-center text-ink-muted">{emptyText}</td></tr>}
              {visible.map((row, rowIndex) => (
                <tr key={startIndex + rowIndex} className={cn(rowIndex % 2 === 1 && "bg-subtle")}>
                  {row.map((cell, index) => (
                    <td key={index} className={cn("px-4 py-3", table.align?.[index] === "right" ? "whitespace-nowrap text-right tabular-nums" : "text-left")}>{renderCell(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-ink-muted">
          {total === 0 ? "Menampilkan 0 dari 0 entri" : `Menampilkan ${startIndex + 1}–${Math.min(startIndex + perPage, total)} dari ${total} entri`}
        </p>
        {pageCount > 1 && (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={current <= 1} onClick={() => setPage(current - 1)}>Sebelumnya</Button>
            <Button size="sm" variant="secondary" disabled={current >= pageCount} onClick={() => setPage(current + 1)}>Berikutnya</Button>
          </div>
        )}
      </div>
    </div>
  );
}
