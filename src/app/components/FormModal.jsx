"use client";

import { deleteSubject } from "@/app/lib/actions";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Dynamically import forms
const TeacherForm = dynamic(() => import("./Forms/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./Forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./Forms/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});

// Delete function mapping for dynamic selection
const deleteActionMap = {
  subject: deleteSubject,
  // teacher: deleteTeacher,
  // student: deleteStudent,
};

// Reusable form mapping
const forms = {
  teacher: (type, data, setOpen) => (
    <TeacherForm type={type} data={data} setOpen={setOpen} />
  ),
  student: (type, data, setOpen) => (
    <StudentForm type={type} data={data} setOpen={setOpen} />
  ),
  subject: (type, data, setOpen) => (
    <SubjectForm type={type} data={data} setOpen={setOpen} />
  ),
};

const FormModal = ({ table, type, data, id }) => {
  const router = useRouter();
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-ayonYellow"
      : type === "update"
      ? "bg-ayonSky"
      : "bg-ayonPurple";

  // Modal state
  const [open, setOpen] = useState(false);

  // Close modal on `Esc` key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Handle Delete Action
  const handleDelete = async (id) => {
    if (!id) {
      toast.error("Invalid ID!");
      return;
    }

    const deleteFunction = deleteActionMap[table]; // Select correct delete function

    if (!deleteFunction) {
      toast.error("Delete function not found!");
      return;
    }

    try {
      const response = await deleteFunction(id);

      if (response.success) {
        toast.success(
          `${
            table.charAt(0).toUpperCase() + table.slice(1)
          } Deleted Successfully!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error(response.error || `Failed to delete ${table}.`);
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("An error occurred while deleting.");
    }
  };

  // Reusable form component
  const Form = () => {
    if (type === "delete" && id) {
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDelete(id);
          }}
          className="p-4 flex flex-col gap-4"
        >
          <span className="text-center font-medium">
            All data will be lost! Are you sure you want to delete this {table}?
          </span>
          <button
            type="submit"
            className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center"
          >
            Delete
          </button>
        </form>
      );
    }
    if (type === "create" || type === "update") {
      return forms[table]
        ? forms[table](type, data, setOpen)
        : "Form Not Found!";
    }
    return "Invalid Action!";
  };

  return (
    <>
      {/* Button to open modal */}
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
        aria-label={`${type} ${table}`}
      >
        <Image src={`/${type}.png`} alt={type} width={16} height={16} />
      </button>

      {/* Modal UI */}
      {open && (
        <div className="w-screen h-screen fixed left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form />
            {/* Close Button */}
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
              aria-label="Close Modal"
            >
              <Image
                src="/close.png"
                alt="close"
                width={14}
                height={14}
                priority
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
