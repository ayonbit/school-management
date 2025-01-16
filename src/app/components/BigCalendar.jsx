"use client";
import moment from "moment";
import { useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { calendarEvents } from "../lib/data";

const localizer = momentLocalizer(moment);

const BigCalendar = () => {
  const [view, setView] = useState(Views.WORK_WEEK);
  const handleOnchangeView = (SelectedView) => {
    setView(SelectedView);
  };
  return (
    <Calendar
      localizer={localizer}
      events={calendarEvents}
      startAccessor="start"
      endAccessor="end"
      views={["work_week", "day"]}
      view={view}
      style={{ height: "98%" }}
      onView={handleOnchangeView}
      min={new Date(2025, 0, 0, 8, 0, 0)}
      max={new Date(2025, 0, 0, 17, 0, 0)}
    />
  );
};

export default BigCalendar;
