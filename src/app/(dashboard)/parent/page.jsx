import Announcements from "@/app/components/Announcement";
import BigCalendarContainer from "@/app/components/BigCalendarContainer";
import prisma from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const ParentPage = async () => {
  const { userId } = await auth(); // Get the authenticated user ID

  // Fetch all students linked to this parent
  const students = await prisma.student.findMany({
    where: { parentId: userId },
    include: {
      class: true, // Ensure you fetch related class data if needed
    },
  });

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Class Schedules</h1>

          {students.length > 0 ? (
            students.map((student) => (
              <div key={student.id} className="mt-6">
                <h2 className="text-lg font-semibold">
                  {student.name}'s Schedule
                </h2>
                <BigCalendarContainer studentId={student.id} />
              </div>
            ))
          ) : (
            <p className="text-gray-500">No students found.</p>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  );
};

export default ParentPage;
