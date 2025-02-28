"use client";

import { createAssignment, updateAssignment } from "@/app/lib/actions";
import { assignmentSchema } from "@/app/lib/fromValidationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import InputField from "../InputField";

const AssignmentForm = ({ type, data, setOpen, relatedData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: data?.title || "",
      startDate: data?.startDate || "",
      dueDate: data?.dueDate || "",
      lessonId: data?.lessonId || "",
    },
  });

  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState({ success: false, error: false });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    startTransition(async () => {
      try {
        const response = await (type === "create"
          ? createAssignment
          : updateAssignment)(formData);

        if (response.success) {
          setState({ success: true, error: false });
        } else {
          setState({ success: false, error: true });
        }
      } catch (error) {
        console.error("Error:", error);
        setState({ success: false, error: true });
      }
    });
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Assignment has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { lessons } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new Assignment"
          : "Update the Assignment"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Assignment title"
          name="title"
          register={register}
          error={errors?.title}
        />
        <InputField
          label="Start Date"
          name="startDate"
          register={register}
          error={errors?.startDate}
          type="datetime-local"
        />
        <InputField
          label="Due Date"
          name="dueDate"
          register={register}
          error={errors?.dueDate}
          type="datetime-local"
        />
        {data && (
          <input type="hidden" {...register("id")} defaultValue={data?.id} />
        )}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("lessonId")}
          >
            {lessons.map((lesson) => (
              <option value={lesson.id} key={lesson.id}>
                {lesson.name}
              </option>
            ))}
          </select>
          {errors.lessonId?.message && (
            <p className="text-xs text-red-400">{errors.lessonId.message}</p>
          )}
        </div>
      </div>

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}

      <button
        type="submit"
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-50"
        disabled={isPending}
      >
        {isPending ? "Processing..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AssignmentForm;
