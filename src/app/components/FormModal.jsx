"use client";

import Image from "next/image";

const FormModal = ({ table, type, data, id }) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-ayonYellow"
      : type === "update"
      ? "bg-ayonSky"
      : "bg-ayonPurple";
  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
      >
        <Image src={`/${type}.png`} alt="typePNG" width={16} height={16} />
      </button>
    </>
  );
};

export default FormModal;
