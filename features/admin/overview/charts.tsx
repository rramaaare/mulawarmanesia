"use client";
/**
 * charts.tsx: dua grafik Recharts untuk dashboard admin (komponen client karena Recharts
 * menggambar di browser). Aturan visualisasi (PRD §8.9): satu sumbu per grafik, warna merek
 * untuk besaran, dan setiap angka punya label teks.
 */
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const BRAND = "#C12822";
const INK = "#111111";
const GRID = "#DEDADA";

/** Format rupiah ringkas untuk sumbu: 48900000 -> "48,9 jt". */
function toMillions(value: number): string {
  return `${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
}

/** Grafik area: pendapatan diterima per minggu (8 minggu terakhir), titik terakhir diberi label. */
export function WeeklyRevenueChart({ data }: { data: { label: string; value: number }[] }) {
  const last = data[data.length - 1];
  return (
    <div className="h-64 w-full" role="img" aria-label="Grafik area pendapatan per minggu">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ left: 0, right: 64, top: 12 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND} stopOpacity={0.18} />
              <stop offset="100%" stopColor={BRAND} stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke={GRID} tickLine={false} />
          <YAxis tickFormatter={toMillions} tick={{ fontSize: 11 }} stroke={GRID} tickLine={false} axisLine={false} width={52} />
          <Tooltip formatter={(value) => [`Rp ${Number(value).toLocaleString("id-ID")}`, "Diterima"]} />
          <Area type="monotone" dataKey="value" stroke={BRAND} strokeWidth={2} fill="url(#revenueFill)" />
          {last && (
            <ReferenceDot
              x={last.label}
              y={last.value}
              r={3.5}
              fill={BRAND}
              stroke={BRAND}
              label={{ value: `Rp ${toMillions(last.value)}`, position: "right", fontSize: 11, fill: INK }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Grafik kolom: jumlah pcs per ukuran S sampai XXXL, angka di atas tiap kolom. */
export function SizeColumnChart({ data }: { data: { size: string; pcs: number }[] }) {
  return (
    <div className="h-56 w-full" role="img" aria-label="Grafik kolom pcs per ukuran">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 22, right: 8, left: 8 }}>
          <XAxis dataKey="size" tick={{ fontSize: 11 }} stroke={GRID} tickLine={false} />
          <YAxis hide />
          <Tooltip formatter={(value) => [value, "pcs"]} cursor={{ fill: "transparent" }} />
          <Bar dataKey="pcs" fill={BRAND} radius={[3, 3, 0, 0]} maxBarSize={22} label={{ position: "top", fontSize: 11, fill: INK }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
