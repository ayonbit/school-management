"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const TableSearch = () => {
  const router = useRouter();
  const pathname = usePathname(); // ✅ Get current path
  const searchParams = useSearchParams(); // ✅ Read current query params
  const [query, setQuery] = useState(searchParams.get("search") || ""); // ✅ Keep query state

  const handleSubmit = (e) => {
    e.preventDefault();
    const searchValue = query.trim();
    const params = new URLSearchParams(searchParams.toString()); // ✅ Use `searchParams`

    if (searchValue) {
      params.set("search", searchValue);
    } else {
      params.delete("search"); // ✅ Remove empty search param
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-3 py-1"
    >
      <Image src="/search.png" alt="search" width={14} height={14} />
      <input
        type="text"
        name="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="w-[200px] p-2 bg-transparent outline-none"
      />
    </form>
  );
};

export default TableSearch;
