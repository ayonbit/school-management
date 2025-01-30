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
      <td>{item.class.name}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.date)}
      </td>

      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal table="announcement" type="update" data={item} />
              <FormModal table="announcement" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

const AnnouncementListPage = async ({ searchParams }) => {
  try {
    const authResponse = await auth();
    const { sessionClaims } = authResponse || {};
    if (!sessionClaims) {
      console.error(
        "No session claims found. User might not be authenticated."
      );
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

    const [data, count] = await prisma.$transaction([
      prisma.announcement.findMany({
        where: query,
        include: {
          class: true,
        },
        take: Item_Per_Page,
        skip: Item_Per_Page * (p - 1),
      }),
      prisma.announcement.count({
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
        {/*TOP*/}
        <div className="flex items-center justify-between">
          <h1 className=" hidden md:block text-lg font-semibold">
            All Announcements
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-ayonYellow">
                <Image src="/filter.png" alt="filter" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-ayonYellow">
                <Image src="/sort.png" alt="filter" width={14} height={14} />
              </button>
              {role === "admin" && (
                <FormModal table="announcement" type="create" />
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
  } catch (error) {
    console.error("Error loading announcements:", error);
    return <div>Error loading announcements.</div>;
  }
};

export default AnnouncementListPage;
