import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { BarChart2 } from "lucide-react";

/**
 * Temporary dummy registration data organized by timeframe.
 * Put in one place so it can easily be replaced with an API call later.
 */
const REGISTRATION_DUMMY_DATA = {
  "7d": [
    { day: "Mon", registrations: 2 },
    { day: "Tue", registrations: 5 },
    { day: "Wed", registrations: 3 },
    { day: "Thu", registrations: 8 },
    { day: "Fri", registrations: 6 },
    { day: "Sat", registrations: 12 },
    { day: "Sun", registrations: 7 },
  ],
  "30d": [
    { day: "Week 1", registrations: 24 },
    { day: "Week 2", registrations: 38 },
    { day: "Week 3", registrations: 45 },
    { day: "Week 4", registrations: 31 },
  ],
  "90d": [
    { day: "Month 1", registrations: 110 },
    { day: "Month 2", registrations: 165 },
    { day: "Month 3", registrations: 210 },
  ],
};

/**
 * Custom dark glass-style tooltip matching the KrishiDhara dashboard
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2.5 shadow-2xl text-white">
        <p className="text-xs text-white/50 font-medium mb-1">{label}</p>
        <p className="text-sm font-semibold flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] inline-block shadow-sm ring-2 ring-emerald-500/20" />
          <span>{payload[0].value} registrations</span>
        </p>
      </div>
    );
  }
  return null;
};

/**
 * RegistrationChart component
 * 
 * Props:
 * - data: optional custom array of [{ day: string, registrations: number }]
 * - timeframe: "7d" | "30d" | "90d" (default: "7d")
 */
const RegistrationChart = ({ data, timeframe = "7d" }) => {
  // If data prop is explicitly provided, use it; otherwise get from dummy dataset
  const chartData = data !== undefined ? data : (REGISTRATION_DUMMY_DATA[timeframe] || REGISTRATION_DUMMY_DATA["7d"]);

  // Empty state handling
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] border border-dashed border-white/10 rounded-xl bg-white/[0.02] text-center p-6">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-3 shadow-inner">
          <BarChart2 size={24} className="text-white/40" />
        </div>
        <p className="text-white/80 font-semibold text-base mb-1">No registrations yet</p>
        <p className="text-white/40 text-xs max-w-xs">
          Activity will appear here once new farmers, labourers, or dealers register.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
        >
          {/* Faint dashed cartesian grid lines */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255, 255, 255, 0.08)"
            vertical={false}
          />

          {/* Light gray readable X and Y axis */}
          <XAxis
            dataKey="day"
            stroke="#9ca3af"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
          />
          <YAxis
            stroke="#9ca3af"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />

          {/* Dark glass-style tooltip */}
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255, 255, 255, 0.05)", radius: 6 }}
          />

          {/* Brand green bars with rounded tops */}
          <Bar
            dataKey="registrations"
            fill="#22c55e"
            radius={[6, 6, 0, 0]}
            maxBarSize={45}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RegistrationChart;
