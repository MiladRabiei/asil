'use client';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface GradientAreaChartProps {
  data: { month: string; value: number }[];
  color: string;
  dataKeyLabel: string;
  id: string;
  title: string;
}

export function GradientAreaChart({
  data,
  color,
  dataKeyLabel,
  id,
  title,
}: GradientAreaChartProps) {
  const chartConfig = {
    value: {
      label: dataKeyLabel,
      color,
    },
  } satisfies ChartConfig;

  return (
    <div className="w-full bg-white p-sm rounded-2xl" dir="rtl">
      <h4 className="text-sm font-semibold px-sm pt-sm">{title}</h4>

      <ChartContainer config={chartConfig} className="h-[180px] w-full">
        <AreaChart data={data} margin={{ top: 12, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            reversed
            padding={{ left: 0, right: 0 }}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={30} ticks={[0, 1600, 2400, 3200]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="value"
            type="monotone"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#fill-${id})`}
            dot={false}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
