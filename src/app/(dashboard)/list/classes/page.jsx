import FormContainer from "@/app/components/FormContainer";
import Pagination from "@/app/components/Pagination";
import Table from "@/app/components/Table";
import TableSearch from "@/app/components/TableSearch";
import prisma from "@/app/lib/prisma";
import { Item_Per_Page } from "@/app/lib/settings";
import { getSearchParams } from "@/app/lib/utils";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";

export const dynamic = "force-dynamic"; // Ensure real-time data updates

const ClassesListPage = async ({ searchParams }) => {
  const { page, searchQuery, supervisorId } = await getSearchParams(
    searchParams
  );

  try {
    // Authenticate user
    const authResponse = await auth();
    const { sessionClaims } = authResponse || {};

    if (!sessionClaims) {
      return <div className="text-red-500">Unauthorized: Please log in.</div>;
    }

    const role = sessionClaims?.metadata?.role;

    // Build Prisma query
    const query = {
      ...(searchQuery && {
        name: { contains: searchQuery, mode: "insensitive" },
      }),
      ...(supervisorId && { supervisorId }),
    };

    // Fetch data with Prisma transaction
    const [data, count] = await prisma.$transaction([
      prisma.class.findMany({
        where: query,
        include: { supervisor: true, grade: true },
        take: Item_Per_Page,
        skip: Item_Per_Page * (page - 1),
      }),
      prisma.class.count({ where: query }),
    ]);

    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">All Classes</h1>
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
                <FormContainer table="class" type="create" />
              )}
            </div>
          </div>
        </div>

        {/* CLASS TABLE */}
        <Table
          columns={[
            { header: "Class Name", accessor: "name" },
            {
              header: "Capacity",
              accessor: "capacity",
              className: "hidden md:table-cell",
            },
            {
              header: "Grade",
              accessor: "grade",
              className: "hidden md:table-cell",
            },
            {
              header: "Supervisor",
              accessor: "supervisor",
              className: "hidden md:table-cell",
            },
            ...(role === "admin"
              ? [{ header: "Actions", accessor: "action" }]
              : []),
          ]}
          renderRow={(item) => (
            <tr
              key={item.id}
              className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-ayonPurpleLight"
            >
              <td className="flex items-center gap-4 p-4">{item.name}</td>
              <td className="hidden md:table-cell">{item.capacity}</td>
              <td className="hidden md:table-cell">
                {item.grade?.level || "N/A"}
              </td>
              <td className="hidden md:table-cell">
                {item.supervisor
                  ? `${item.supervisor.name} ${item.supervisor.surname}`
                  : "No Supervisor"}
              </td>
              {role === "admin" && (
                <td className="p-3 flex gap-2">
                  <FormContainer table="class" type="update" data={item} />
                  <FormContainer table="class" type="delete" id={item.id} />
                </td>
              )}
            </tr>
          )}
          data={data}
        />

        {/* PAGINATION */}
        <Pagination page={page} count={count} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching classes:", error);
    return (
      <div className="text-red-500">
        Error loading classes. Please try again.
      </div>
    );
  }
};

export default ClassesListPage;
