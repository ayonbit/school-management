"use client";
import Image from "next/image";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  {
    month: "Jan",
    income: 4000,
    expense: 2400,
  },
  {
    month: "Feb",
    income: 10000,
    expense: 200,
  },
  {
    month: "Mar",
    income: 40000,
    expense: 24000,
  },
  {
    month: "Apr",
    income: 5000,
    expense: 6400,
  },
  {
    month: "May",
    income: 7200,
    expense: 1200,
  },
  {
    month: "Jun",
    income: 2300,
    expense: 2400,
  },
  {
    month: "Jul",
    income: 23000,
    expense: 6300,
  },
  {
    month: "Aug",
    income: 1200,
    expense: 745,
  },
  {
    month: "Sept",
    income: 12240,
    expense: 7045,
  },
  {
    month: "Oct",
    income: 3600,
    expense: 7254,
  },
  {
    month: "Nov",
    income: 6395,
    expense: 231,
  },
  {
    month: "Dec",
    income: 1840,
    expense: 22000,
  },
];
const FinanceChart = () => {
  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Finance </h1>
        <Image src="/moreDark.png" alt="chart" width={20} height={20} />
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart width={500} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tick={{ fill: "#d1d5db" }}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: "#d1d5db" }}
            tickLine={false}
            tickMargin={20}
          />
          <Tooltip
            contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }}
          />
          <Legend
            align="center"
            verticalAlign="top"
            wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px" }}
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#FAE27C"
            activeDot={{ r: 8 }}
            strokeWidth={5}
          />
          <Line
            type="monotone"
            dataKey="expense"
            stroke="#C3EBFA"
            strokeWidth={5}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;
