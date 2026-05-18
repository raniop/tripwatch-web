'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import type { PriceCheck } from '@/lib/supabase/types';

interface Props {
  checks: PriceCheck[];
  paidPrice: number;
  currency: string;
}

export function PriceChart({ checks, paidPrice, currency }: Props) {
  const data = checks
    .filter((c) => c.price !== null && !c.error)
    .sort((a, b) => +new Date(a.checked_at) - +new Date(b.checked_at))
    .map((c) => ({
      date: dayjs(c.checked_at).format('D MMM'),
      price: Number(c.price),
      iso: c.checked_at,
    }));

  if (data.length < 2) {
    return (
      <div className="grid h-64 place-items-center text-sm text-muted-foreground">
        {data.length === 0 ? 'אין עדיין בדיקות מחיר. הבדיקה הראשונה תתבצע בלילה הקרוב.' : 'יוצג גרף אחרי הבדיקה הבאה.'}
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
          <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
          <YAxis
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            domain={['dataMin - 100', 'dataMax + 100']}
            tickFormatter={(v) => `${currencySymbol(currency)}${Math.round(v).toLocaleString()}`}
          />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
            labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            formatter={(v: number) => [`${currencySymbol(currency)}${v.toLocaleString()}`, 'מחיר']}
          />
          <ReferenceLine
            y={paidPrice}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="4 4"
            label={{ value: `שילמת`, position: 'insideTopLeft', fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3, fill: 'hsl(var(--primary))' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function currencySymbol(c: string) {
  return { ILS: '₪', THB: '฿', USD: '$', EUR: '€', GBP: '£' }[c] || '';
}
