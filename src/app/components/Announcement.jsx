import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import prisma from "../lib/prisma";

const Announcements = async () => {
  // Authenticate user
  const authResponse = await auth();
  const { sessionClaims, userId: currentUserId } = authResponse || {};

  if (!sessionClaims) {
    console.warn("No session claims found. User might not be authenticated.");
    return null; // Don't render anything if the user isn't authenticated
  }

  const role = sessionClaims?.metadata?.role;
  let query = {};

  // Role-based filtering
  if (role === "teacher") {
    query.class = { lessons: { some: { teacherId: currentUserId } } };
  } else if (role === "student") {
    query.class = { students: { some: { id: currentUserId } } };
  } else if (role === "parent") {
    query.class = { students: { some: { parentId: currentUserId } } };
  }

  // Fetch latest announcements
  const data = await prisma.announcement.findMany({
    where: query,
    take: 3,
    orderBy: { date: "desc" },
  });

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <Link
          href="/announcements"
          className="text-xs text-blue-500 hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {data.length > 0 ? (
          data.map((announcement, index) => (
            <div
              key={announcement.id}
              className={`p-4 rounded-md ${
                index === 0
                  ? "bg-ayonSkyLight"
                  : index === 1
                  ? "bg-ayonPurpleLight"
                  : "bg-ayonYellowLight"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{announcement.title}</h2>
                <span className="text-xs text-gray-500 bg-white rounded-md px-2 py-1">
                  {announcement.date
                    ? new Intl.DateTimeFormat("en-GB").format(
                        new Date(announcement.date)
                      )
                    : "No Date"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {announcement.description || "No description available."}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">
            No announcements available.
          </p>
        )}
      </div>
    </div>
  );
};

export default Announcements;
