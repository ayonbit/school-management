import prisma from "../lib/prisma";
import { adjustScheduleToCurrentWeek } from "../lib/utils";
import BigCalendar from "./BigCalendar";

const BigCalendarContainer = async ({ type, id }) => {
  try {
    const dataRes = await prisma.lesson.findMany({
      where: {
        ...(type === "teacherId" ? { teacherId: id } : { classId: id }),
      },
    });

    if (!dataRes || dataRes.length === 0) {
      console.warn("No lessons found for the given ID:", id);
      return <p>No schedule available.</p>;
    }

    // Ensure every lesson has required fields
    const data = dataRes
      .map((lesson, index) => {
        if (!lesson.name || !lesson.startTime || !lesson.endTime) {
          console.warn(`Lesson at index ${index} is missing fields:`, lesson);
          return null; // Skip invalid lessons
        }

        return {
          title: lesson.name,
          start: new Date(lesson.startTime),
          end: new Date(lesson.endTime),
        };
      })
      .filter(Boolean); // Remove null values

    const schedule = adjustScheduleToCurrentWeek(data);

    return (
      <div className="">
        <BigCalendar data={schedule} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return <p>Failed to load schedule.</p>;
  }
};

export default BigCalendarContainer;
