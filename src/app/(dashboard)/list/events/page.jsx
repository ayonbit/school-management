import FormModal from "@/app/components/FormModal";
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
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td>{item.class?.name || "N/A"}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(new Date(item.startTime))}
      </td>
      <td className="hidden md:table-cell">
        {new Date(item.startTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </td>
      <td className="hidden md:table-cell">
        {new Date(item.endTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal table="event" type="update" data={item} />
              <FormModal table="event" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

const EventListPage = async ({ searchParams }) => {
  try {
    const authResponse = await auth();
    const { sessionClaims, userId: currentUserId } = authResponse || {};

    if (!sessionClaims) {
      console.error(
        "No session claims found. User might not be authenticated."
      );
      return <div>Error loading events.</div>;
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
            case "search":
              query.title = { contains: value, mode: "insensitive" };
              break;
            default:
              break;
          }
        }
      }
    }

    //   // Role Base Conditions

    // const roleConditions = {
    //   teacher: { class: { lessons: { some: { teacherId: currentUserId } } } },
    //   student: { class: { students: { some: { id: currentUserId } } } },
    //   parent: { class: { students: { some: { parentId: currentUserId } } } },
    // };

    // {
    //  =>* NOT WORKING * ##CLASS ID NULL not working
    // =>** when general event is created under no classId it not working ,
    // => if no classId it should be work for all roles

    // query.OR = [
    //   { classId: null },
    //   {
    //     class: roleConditions[role] || {},
    //   },
    // ];

    // Role Base Conditions
    switch (role) {
      case "admin":
        break;
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

    // query.OR = [{ classId: null }, { class: query.classId[role] || {} }];

    const [data, count] = await prisma.$transaction([
      prisma.events.findMany({
        where: query,
        include: {
          class: true,
        },
        take: Item_Per_Page,
        skip: Item_Per_Page * (p - 1),
      }),
      prisma.events.count({
        where: query,
      }),
    ]);

    const columns = [
      {
        header: "Title",
        accessor: "title",
      },
      {
        header: "Class",
        accessor: "class",
      },
      {
        header: "Date",
        accessor: "date",
        className: "hidden md:table-cell",
      },
      {
        header: "Start Time",
        accessor: "startTime",
        className: "hidden md:table-cell",
      },
      {
        header: "End Time",
        accessor: "endTime",
        className: "hidden md:table-cell",
      },
      ...(role === "admin"
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
          <h1 className=" hidden md:block text-lg font-semibold">All Events</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-ayonYellow">
                <Image src="/filter.png" alt="filter" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-ayonYellow">
                <Image src="/sort.png" alt="filter" width={14} height={14} />
              </button>
              {role === "admin" && <FormModal table="event" type="create" />}
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
  } catch (error) {
    console.error("Error loading events:", error);
    return <div>Error loading events.</div>;
  }
};

export default EventListPage;
