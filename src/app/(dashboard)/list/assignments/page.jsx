import FormContainer from "@/app/components/FormContainer";
import Pagination from "@/app/components/Pagination";
import Table from "@/app/components/Table";
import TableSearch from "@/app/components/TableSearch";
import prisma from "@/app/lib/prisma";
import { Item_Per_Page } from "@/app/lib/settings";
import { getSearchParams } from "@/app/lib/utils";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";

export const dynamic = "force-dynamic";
const AssignmentListPage = async ({ searchParams }) => {
  const { page, searchQuery, classId, teacherId } = await getSearchParams(
    searchParams
  ); // Ensure searchParams is awaited

  try {
    const authResponse = await auth();
    const { sessionClaims, userId: currentUserId } = authResponse || {};
    if (!sessionClaims) {
      return <div className="text-red-500">Unauthorized: Please log in.</div>;
    }

    const role = sessionClaims?.metadata?.role;

    // Ensure classId and teacherId are parsed correctly
    const classIdParsed = classId ? parseInt(classId) : null;
    const teacherIdParsed = teacherId || null;

    // Build Prisma query
    const query = {
      lesson: {
        ...(searchQuery && {
          subject: { name: { contains: searchQuery, mode: "insensitive" } },
        }),
        ...(classIdParsed && { classId: classIdParsed }),
        ...(teacherIdParsed && { teacherId: teacherIdParsed }),
      },
    };

    // Role-based conditions
    switch (role) {
      case "admin":
        break;
      case "teacher":
        query.lesson.teacherId = currentUserId;
        break;
      case "student":
        query.lesson.class = { students: { some: { id: currentUserId } } };
        break;
      case "parent":
        query.lesson.class = {
          students: { some: { parentId: currentUserId } },
        };
        break;
      default:
        break;
    }

    const [data, count] = await prisma.$transaction([
      prisma.assignment.findMany({
        where: query,
        include: {
          lesson: {
            select: {
              subject: { select: { name: true } },
              teacher: { select: { name: true, surname: true } },
              class: { select: { name: true } },
            },
          },
        },
        take: Item_Per_Page,
        skip: Item_Per_Page * (page - 1),
      }),
      prisma.assignment.count({ where: query }),
    ]);

    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            All Assignments
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
              {(role === "admin" || role === "teacher") && (
                <FormContainer table="assignment" type="create" />
              )}
            </div>
          </div>
        </div>

        {/* ASSIGNMENT TABLE */}
        <Table
          columns={[
            { header: "Subject Name", accessor: "lesson.subject.name" },
            { header: "Class", accessor: "lesson.class.name" },
            {
              header: "Teacher",
              accessor: "lesson.teacher",
              className: "hidden md:table-cell",
            },
            {
              header: "Date",
              accessor: "dueDate",
              className: "hidden md:table-cell",
            },
            ...(role === "admin" || role === "teacher"
              ? [{ header: "Actions", accessor: "action" }]
              : []),
          ]}
          renderRow={(item) => (
            <tr
              key={item.id}
              className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-ayonPurpleLight"
            >
              <td className="flex items-center gap-4 p-4">
                {item.lesson.subject.name}
              </td>
              <td>{item.lesson.class.name}</td>
              <td className="hidden md:table-cell">
                {item.lesson.teacher.name + " " + item.lesson.teacher.surname}
              </td>
              <td className="hidden md:table-cell">
                {new Intl.DateTimeFormat("en-us").format(
                  new Date(item.dueDate)
                )}
              </td>
              <td>
                <div className="flex items-center gap-2">
                  {(role === "admin" || role === "teacher") && (
                    <>
                      <FormContainer
                        table="assignment"
                        type="update"
                        data={item}
                      />
                      <FormContainer
                        table="assignment"
                        type="delete"
                        id={item.id}
                      />
                    </>
                  )}
                </div>
              </td>
            </tr>
          )}
          data={data}
        />

        {/* PAGINATION */}
        <Pagination page={page} count={count} />
      </div>
    );
  } catch (error) {
    console.error("Error loading assignments:", error);
    return <div className="text-red-500">Error loading assignments.</div>;
  }
};

export default AssignmentListPage;
