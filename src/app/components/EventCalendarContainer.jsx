import EventCalendar from "./EventCalendar";
import EventList from "./EventList";

const EventCalendarContainer = async ({ searchParams }) => {
  const params = await searchParams;
  const date = params?.date || new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white p-4 rounded-md">
      <EventCalendar />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold my-4">Events</h1>
      </div>
      <div className="flex flex-col gap-4">
        <EventList dateParam={date} />
      </div>
    </div>
  );
};

export default EventCalendarContainer;
