"use client";

import Image from "next/image";
import { RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

const data = [
  {
    name: "Total",
    count: 100,
    fill: "white",
  },
  {
    name: "Boys",
    count: 55,
    fill: "#c3ebfa",
  },
  {
    name: "Girls",
    count: 45,
    fill: "#fae27c",
  },
];

const CountChart = () => {
  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      <div className="flex justify-between items-center">
        {/*Title*/}
        <h1 className="text-lg font-semibold">Students</h1>
        <Image src="/moreDark.png" alt="chart" width={20} height={20} />
      </div>
      <div className="w-full h-[75%] relative">
        {/*Chart*/}
        <ResponsiveContainer>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="100%"
            barSize={32}
            data={data}
          >
            <RadialBar background dataKey="count" />
          </RadialBarChart>
        </ResponsiveContainer>
        <Image
          src="/maleFemale.png"
          alt="maleFemale"
          width={40}
          height={40}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
      <div className="flex justify-center gap-16">
        {/*Bottom*/}
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 rounded-full bg-ayonSky" />
          <h1 className="font-bold">5,500</h1>
          <h2 className="text-xs text-gray-400">Boys (55%)</h2>
        </div>

        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 rounded-full bg-ayonYellow" />
          <h1 className="font-bold">4,500</h1>
          <h2 className="text-xs text-gray-400">Girls (45%)</h2>
        </div>
      </div>
    </div>
  );
};

export default CountChart;
