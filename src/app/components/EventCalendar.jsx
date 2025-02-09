"use client";

import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const EventCalendar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial date from URL or default to today
  const initialDate = searchParams.get("date")
    ? new Date(searchParams.get("date"))
    : new Date();

  const [value, onChange] = useState(initialDate);

  useEffect(() => {
    if (value instanceof Date && !isNaN(value)) {
      const formattedDate = format(value, "yyyy-MM-dd"); // Format: YYYY-MM-DD
      const currentDate = searchParams.get("date");

      // Only update the URL if the date is different
      if (formattedDate !== currentDate) {
        router.push(`?date=${formattedDate}`, { scroll: false });
      }
    }
  }, [value, router, searchParams]);

  return <Calendar onChange={onChange} value={value} />;
};

export default EventCalendar;
