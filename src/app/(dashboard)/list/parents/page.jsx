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
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name + " " + item.surname} </h3>
          <p className=" text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      {role === "admin" && (
        <>
          <td>{item.id}</td>
        </>
      )}

      <td className="hidden md:table-cell ">
        {item.students.map((student) => student.name).join(",")}{" "}
      </td>
      <td className="hidden md:table-cell ">{item.phone} </td>
      <td className="hidden md:table-cell ">{item.address} </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="parent" type="update" data={item} />
              <FormContainer table="parent" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

const ParentsListPage = async ({ searchParams }) => {
  const authResponse = await auth();
  const { sessionClaims } = authResponse || {};

  if (!sessionClaims) {
    console.error("No session claims found. User might not be authenticated.");
    return <div>Error loading parents.</div>;
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
          case "search": {
            query.name = { contains: value, mode: "insensitive" };
            break;
          }
          // Add more cases as needed
          default:
            break;
        }
      }
    }
  }
  //NO Role Base Condition Apply For this page
  //Only Admin can apply CRUD operations
  const [data, count] = await prisma.$transaction([
    prisma.parent.findMany({
      where: query,
      include: {
        students: true,
      },
      take: Item_Per_Page,
      skip: Item_Per_Page * (p - 1),
    }),
    prisma.parent.count({
      where: query,
    }),
  ]);
  const columns = [
    {
      header: "Parent Name",
      accessor: "info",
    },

    ...(role === "admin"
      ? [
          {
            header: "Parent Id",
            accessor: "parentId",
            className: "hidden md:table-cell",
          },
        ]
      : []),

    {
      header: "Student Name",
      accessor: "student",
      className: "hidden md:table-cell",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden lg:table-cell",
    },
    {
      header: "Address",
      accessor: "address",
      className: "hidden lg:table-cell",
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
        <h1 className=" hidden md:block text-lg font-semibold">All Parents</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-ayonYellow">
              <Image src="/filter.png" alt="filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-ayonYellow">
              <Image src="/sort.png" alt="filter" width={14} height={14} />
            </button>
            {role === "admin" && <FormContainer table="parent" type="create" />}
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

export default ParentsListPage;
