"use client";

import { createSubject, updateSubject } from "@/app/lib/actions";
import { subjectSchema } from "@/app/lib/fromValidationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import InputField from "../InputField";

const SubjectForm = ({ type, data, setOpen, relatedData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: data?.name || "",
      id: data?.id || "",
      teachers: data?.teachers
        ? data.teachers.map((teacher) => teacher.id)
        : [],
    },
  });

  const [state, setState] = useState({
    success: false,
    error: false,
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const action = type === "create" ? createSubject : updateSubject;
      const result = await action(formData);

      if (result.success) {
        setState({ success: true, error: false });
        toast.success(
          `Subject has been ${type === "create" ? "created" : "updated"}!`
        );
        setOpen(false);
        router.refresh();
      } else {
        setState({ success: false, error: true });
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      setState({ success: false, error: true });
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  });

  const { teachers } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Subject" : "Update the Subject"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Subject name"
          name="name"
          register={register}
          error={errors?.name}
          placeholder={"e.g. Mathematics"}
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            register={register}
            error={errors?.id}
            hidden
          />
        )}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Teachers</label>
          <select
            multiple
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("teachers")}
          >
            {teachers.map((teacher) => (
              <option value={teacher.id} key={teacher.id}>
                {teacher.name + " " + teacher.surname}
              </option>
            ))}
          </select>
          {errors.teachers?.message && (
            <p className="text-xs text-red-400">
              {errors.teachers.message.toString()}
            </p>
          )}
        </div>
      </div>
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button
        type="submit"
        className="bg-blue-400 text-white p-2 rounded-md hover:bg-blue-500 transition-colors"
      >
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default SubjectForm;
