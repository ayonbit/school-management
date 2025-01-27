import FormModal from "@/app/components/FormModal";
import Pagination from "@/app/components/Pagination";
import Table from "@/app/components/Table";
import TableSearch from "@/app/components/TableSearch";
import { role } from "@/app/lib/data";
import prisma from "@/app/lib/prisma";
import { Item_Per_Page } from "@/app/lib/settings";

import Image from "next/image";

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
    header: "Actions",
    accessor: "action",
  },
];
const renderRow = (item) => {
  return (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-ayonPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.subject.name}</td>
      <td>{item.class.name}</td>
      <td className="hidden md:table-cell">
        {item.teacher.name + " " + item.teacher.surname}
      </td>

      <td>
        <div className="flex items-center gap-2">
          {/* <Link href={`/list/teachers/${item.id}`}>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-ayonSky">
                <Image
                  src="/edit.png"
                  alt="EditButton"
                  width={16}
                  height={16}
                />
              </button>
            </Link> */}
          {role === "admin" && (
            // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-ayonPurple">
            //   <Image
            //     src="/delete.png"
            //     alt="viewButton"
            //     width={16}
            //     height={16}
            //   />
            // </button>
            <>
              <FormModal table="lesson" type="update" data={item} />
              <FormModal table="lesson" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

const LessonListPage = async ({ searchParams }) => {
  const params = await searchParams;
  const { page, ...queryParams } = params;
  const p = parseInt(page) || 1;

  //URL PARAMS CONDITIONS
  const query = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.classId = parseInt(value);
            break;

          case "teacherId":
            query.teacherId = value;
            break;

          case "search":
            query.OR = [
              { subject: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;

          default:
            break;

          //Add More ...
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.lessons.findMany({
      where: query,

      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
        teacher: { select: { name: true, surname: true } },
      },
      take: Item_Per_Page,
      skip: Item_Per_Page * (p - 1),
    }),
    prisma.lessons.count({
      where: query,
    }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/*TOP*/}
      <div className="flex items-center justify-between">
        <h1 className=" hidden md:block text-lg font-semibold">All Lessons</h1>
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
              // <button className="w-8 h-8 flex items-center justify-center rounded-full bg-ayonYellow">
              //   <Image src="/plus.png" alt="filter" width={14} height={14} />
              // </button>
              <FormModal table="lesson" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <div>
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {/* PAGINATION */}

      <Pagination page={p} count={count} />
    </div>
  );
};

export default LessonListPage;
