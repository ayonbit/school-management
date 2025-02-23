import FormModal from "@/app/components/FormModal";
import Pagination from "@/app/components/Pagination";
import Table from "@/app/components/Table";
import TableSearch from "@/app/components/TableSearch";
import prisma from "@/app/lib/prisma";
import { Item_Per_Page } from "@/app/lib/settings";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";

export const dynamic = "force-dynamic"; // Ensure dynamic rendering

const AnnouncementListPage = async ({ searchParams }) => {
  try {
    // Fetch authentication details
    const authResponse = await auth();
    const { sessionClaims, userId: currentUserId } = authResponse || {};

    if (!sessionClaims) {
      return <div className="text-red-500">Unauthorized: Please log in.</div>;
    }

    const role = sessionClaims?.metadata?.role;
    const page = parseInt(searchParams?.page) || 1;
    const searchQuery = searchParams?.search || "";

    // Construct query based on role
    const query = {
      ...(searchQuery && {
        title: { contains: searchQuery, mode: "insensitive" },
      }),
    };

    if (role === "teacher") {
      query.class = { lessons: { some: { teacherId: currentUserId } } };
    } else if (role === "student") {
      query.class = { students: { some: { id: currentUserId } } };
    } else if (role === "parent") {
      query.class = { students: { some: { parentId: currentUserId } } };
    }

    // Fetch announcements and count using Prisma transaction
    const [announcements, count] = await prisma.$transaction([
      prisma.announcement.findMany({
        where: query,
        include: { class: true },
        take: Item_Per_Page,
        skip: Item_Per_Page * (page - 1),
      }),
      prisma.announcement.count({ where: query }),
    ]);

    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP SECTION */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            All Announcements
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-ayonYellow">
                <Image src="/filter.png" alt="filter" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-ayonYellow">
                <Image src="/sort.png" alt="sort" width={14} height={14} />
              </button>
              {role === "admin" && (
                <FormModal table="announcement" type="create" />
              )}
            </div>
          </div>
        </div>

        {/* ANNOUNCEMENT TABLE */}
        <Table
          columns={[
            { header: "Title", accessor: "title" },
            { header: "Class", accessor: "class" },
            {
              header: "Date",
              accessor: "date",
              className: "hidden md:table-cell",
            },
            ...(role === "admin"
              ? [{ header: "Actions", accessor: "action" }]
              : []),
          ]}
          renderRow={(item) => (
            <tr
              key={item.id}
              className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-gray-100"
            >
              <td className="p-3">{item.title}</td>
              <td className="p-3">{item.class?.name || "N/A"}</td>
              <td className="p-3 hidden md:table-cell">
                {new Intl.DateTimeFormat("en-US").format(new Date(item.date))}
              </td>
              {role === "admin" && (
                <td className="p-3 flex gap-2">
                  <FormModal table="announcement" type="update" data={item} />
                  <FormModal table="announcement" type="delete" id={item.id} />
                </td>
              )}
            </tr>
          )}
          data={announcements}
        />

        {/* PAGINATION */}
        <Pagination page={page} count={count} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return (
      <div className="text-red-500">
        Error loading announcements. Please try again.
      </div>
    );
  }
};

export default AnnouncementListPage;
