import prisma from "../lib/prisma";

const EventList = async ({ dateParam }) => {
  try {
    // Validate and parse the date
    const date =
      dateParam && !isNaN(Date.parse(dateParam))
        ? new Date(dateParam)
        : new Date();

    // Fetch events from the database
    const events = await prisma.event.findMany({
      where: {
        startTime: {
          gte: new Date(date.setHours(0, 0, 0, 0)), // Start of day
          lte: new Date(date.setHours(23, 59, 59, 999)), // End of day
        },
      },
      orderBy: { startTime: "asc" }, // Sort by start time
    });

    return (
      <div className="space-y-4">
        {events.length > 0 ? (
          events.map((event) => (
            <div
              key={event.id}
              className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lamaSky even:border-t-lamaPurple"
            >
              <div className="flex items-center justify-between">
                <h1 className="font-semibold text-gray-600">{event.title}</h1>
                <span className="text-gray-300 text-xs">
                  {new Date(event.startTime).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </span>
              </div>
              <p className="mt-2 text-gray-400 text-sm">{event.description}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">
            No events scheduled for this date.
          </p>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching events:", error);
    return (
      <p className="text-red-500 text-center py-4">
        Failed to load events. Please try again.
      </p>
    );
  }
};

export default EventList;
