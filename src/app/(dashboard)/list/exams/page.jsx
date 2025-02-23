import FormContainer from "@/app/components/FormContainer";
import Pagination from "@/app/components/Pagination";
import Table from "@/app/components/Table";
import TableSearch from "@/app/components/TableSearch";
import prisma from "@/app/lib/prisma";
import { Item_Per_Page } from "@/app/lib/settings";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";

const renderRow = (item, role) => {
  return (
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
        {new Intl.DateTimeFormat("en-us").format(new Date(item.startTime))}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormContainer table="exam" type="update" data={item} />
              <FormContainer table="exam" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

const ExamListPage = async ({ searchParams }) => {
  const authResponse = await auth();
  const { sessionClaims, userId: currentUserId } = authResponse || {};

  if (!sessionClaims) {
    console.error("No session claims found. User might not be authenticated.");
    return <div>Error loading exams.</div>;
  }

  const role = sessionClaims?.metadata?.role;

  const params = await searchParams;
  const { page, ...queryParams } = params;
  const p = parseInt(page) || 1;

  // URL PARAMS CONDITIONS
  const query = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.lesson = { ...query.lesson, classId: parseInt(value) };
            break;
          case "teacherId":
            query.lesson = { ...query.lesson, teacherId: value };
            break;
          case "search":
            query.lesson = {
              ...query.lesson,
              subject: { name: { contains: value, mode: "insensitive" } },
            };
            break;
          default:
            break;
        }
      }
    }
  }

  // role base conditions
  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.lesson = { ...query.lesson, teacherId: currentUserId };
      break;
    case "student":
      query.lesson = {
        ...query.lesson,
        class: {
          students: {
            some: {
              id: currentUserId,
            },
          },
        },
      };
      break;
    case "parent":
      query.lesson = {
        ...query.lesson,
        class: {
          students: {
            some: {
              parentId: currentUserId,
            },
          },
        },
      };
      break;
    default:
      break;
  }

  const [data, count] = await prisma.$transaction([
    prisma.exam.findMany({
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
      skip: Item_Per_Page * (p - 1),
    }),
    prisma.exam.count({
      where: query,
    }),
  ]);
  const columns = [
    {
      header: "Subject Name",
      accessor: "subject",
    },
    {
      header: "Class",
      accessor: "class",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    ...(role === "admin" || role === "teacher"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className=" hidden md:block text-lg font-semibold">All Exams</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-ayonYellow">
              <Image src="/filter.png" alt="filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-ayonYellow">
              <Image src="/sort.png" alt="filter" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="exam" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <div>
        <Table
          columns={columns}
          renderRow={(item) => renderRow(item, role)}
          data={data}
        />
      </div>

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ExamListPage;
