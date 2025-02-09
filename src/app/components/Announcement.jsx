import { auth } from "@clerk/nextjs/server";
import prisma from "../lib/prisma";

const Announcements = async () => {
  const authResponse = await auth();
  const { sessionClaims, userId: currentUserId } = authResponse || {};

  if (!sessionClaims) {
    console.error("No session claims found. User might not be authenticated.");
    return <div>Error loading announcements.</div>;
  }

  const role = sessionClaims?.metadata?.role;

  // Define query object
  let query = {};

  // Role-Based Conditions
  switch (role) {
    case "teacher":
      query.class = {
        lessons: {
          some: {
            teacherId: currentUserId,
          },
        },
      };
      break;
    case "student":
      query.class = {
        students: {
          some: {
            id: currentUserId,
          },
        },
      };
      break;
    case "parent":
      query.class = {
        students: {
          some: {
            parentId: currentUserId,
          },
        },
      };
      break;
    default:
      break;
  }

  // Fetch announcements with the role-based query (if any)
  const data = await prisma.announcement.findMany({
    where: query,
    take: 3,
    orderBy: { date: "desc" },
  });

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <span className="text-xs text-gray-400">View All</span>
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
                <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                  {new Intl.DateTimeFormat("en-GB").format(
                    new Date(announcement.date)
                  )}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {announcement.description}
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
