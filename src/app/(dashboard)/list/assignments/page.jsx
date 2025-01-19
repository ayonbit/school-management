import FormModal from "@/app/components/FormModal";
import Pagination from "@/app/components/Pagination";
import Table from "@/app/components/Table";
import TableSearch from "@/app/components/TableSearch";
import { assignmentsData, role } from "@/app/lib/data";

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
    header: "Date",
    accessor: "dueDate",
    className: "hidden md:table-cell",
  },

  {
    header: "Actions",
    accessor: "action",
  },
];

const AssignmentListPage = () => {
  const renderRow = (item) => {
    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-ayonPurpleLight"
      >
        <td className="flex items-center gap-4 p-4">{item.subject}</td>
        <td>{item.class}</td>
        <td className="hidden md:table-cell">{item.teacher}</td>
        <td className="hidden md:table-cell">{item.dueDate}</td>

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
                <FormModal table="assignment" type="update" data={item} />
                <FormModal table="assignment" type="delete" id={item.id} />
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/*TOP*/}
      <div className="flex items-center justify-between">
        <h1 className=" hidden md:block text-lg font-semibold">
          All Assignments
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
              // <button className="w-8 h-8 flex items-center justify-center rounded-full bg-ayonYellow">
              //   <Image src="/plus.png" alt="filter" width={14} height={14} />
              // </button>
              <FormModal table="assignment" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <div>
        <Table columns={columns} renderRow={renderRow} data={assignmentsData} />
      </div>

      {/* PAGINATION */}

      <Pagination />
    </div>
  );
};

export default AssignmentListPage;
