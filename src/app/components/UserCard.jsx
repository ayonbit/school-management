import Image from "next/image";
import prisma from "../lib/prisma";

const UserCard = async ({ type }) => {
  const modelMap = {
    admin: prisma.admin,
    teacher: prisma.teacher,
    student: prisma.student,
    parent: prisma.parent,
  };

  const count = await modelMap[type].count();

  return (
    <div className="rounded-2xl odd:bg-ayonPurple even:bg-ayonYellow p-4 flex-1 min-w-[130px]">
      <div className=" flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">
          {new Date().toLocaleDateString()}
        </span>
        <Image src="/more.png" alt="more" width={20} height={20} />
      </div>
      <h1 className="text-2xl font-semibold my-4">{count}</h1>
      <h2 className="capitalize text-sm font-medium text-gray-500">{type}s</h2>
    </div>
  );
};

export default UserCard;
