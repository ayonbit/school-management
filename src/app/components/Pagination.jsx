"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Item_Per_Page } from "../lib/settings";

const Pagination = ({ page, count }) => {
  const router = useRouter();
  const pathname = usePathname(); // ✅ Get current path
  const searchParams = useSearchParams(); // ✅ Read query params

  const hasPrev = Item_Per_Page * (page - 1) > 0;
  const hasNext = Item_Per_Page * (page - 1) + Item_Per_Page < count;

  const changePage = (newPage) => {
    const params = new URLSearchParams(searchParams.toString()); // ✅ Use `searchParams`
    params.set("page", newPage.toString());

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="p-4 flex items-center justify-between text-gray-500">
      <button
        disabled={!hasPrev}
        className="p-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => changePage(page - 1)}
      >
        Prev
      </button>

      <div className="flex items-center gap-2 text-xs">
        {Array.from(
          { length: Math.ceil(count / Item_Per_Page) },
          (_, index) => {
            const pageIndex = index + 1;
            return (
              <button
                key={pageIndex}
                className={`px-2 rounded-sm ${
                  page === pageIndex ? "bg-ayonSky" : ""
                }`}
                onClick={() => changePage(pageIndex)}
              >
                {pageIndex}
              </button>
            );
          }
        )}
      </div>

      <button
        disabled={!hasNext}
        onClick={() => changePage(page + 1)}
        className="p-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
