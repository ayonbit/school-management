"use client";

import { createLesson, updateLesson } from "@/app/lib/actions";
import { lessonSchema } from "@/app/lib/fromValidationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import InputField from "../InputField";

const LessonForm = ({ type, data, setOpen, relatedData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      id: data?.id || "",
      name: data?.name || "",
      day: data?.day || "",
      startTime: data?.startTime
        ? new Date(data.startTime).toISOString().slice(0, 16)
        : "",
      endTime: data?.endTime
        ? new Date(data.endTime).toISOString().slice(0, 16)
        : "",
      teacherId: data?.teacherId || "",
      subjectId: data?.subjectId || "",
      classId: data?.classId || "",
    },
  });

  const [state, setState] = useState({
    success: false,
    error: false,
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const action = type === "create" ? createLesson : updateLesson;
      const result = await action(formData);

      if (result.success) {
        setState({ success: true, error: false });
        toast.success(
          `Lesson has been ${type === "create" ? "created" : "updated"}!`
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

  const { teachers, classes, subjects } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Lesson" : "Update the Lesson"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Lesson Name"
          name="name"
          register={register}
          error={errors?.name}
          placeholder={"Lesson Name"}
        />
        <InputField
          label="Start Time"
          name="startTime"
          register={register}
          error={errors?.startTime}
          type="datetime-local"
        />
        <InputField
          label="End Time"
          name="endTime"
          register={register}
          error={errors?.endTime}
          type="datetime-local"
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Day</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("day", { required: "Day is required" })}
            defaultValue={data?.day || ""}
          >
            <option value="" disabled>
              Select Day
            </option>{" "}
            {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"].map(
              (day) => (
                <option value={day} key={day}>
                  {day}
                </option>
              )
            )}
          </select>
          {errors.day?.message && (
            <p className="text-xs text-red-400">{errors.day.message}</p>
          )}
        </div>

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
          <label className="text-xs text-gray-500">Teacher</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("teacherId", { required: "Teacher is required" })}
            defaultValue={data?.teacherId || ""}
          >
            <option value="" disabled>
              Select Teacher
            </option>{" "}
            {teachers.map((teacher) => (
              <option value={teacher.id} key={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
          {errors.teacherId?.message && (
            <p className="text-xs text-red-400">{errors.teacherId.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId", { required: "Class is required" })}
            defaultValue={data?.classId || ""}
          >
            <option value="" disabled>
              Select Class
            </option>{" "}
            {classes.map((cls) => (
              <option value={cls.id} key={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">{errors.classId.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subject</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjectId", { required: "Subject is required" })}
            defaultValue={data?.subjectId || ""}
          >
            <option value="" disabled>
              Select Subject
            </option>{" "}
            {subjects.map((subject) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjectId?.message && (
            <p className="text-xs text-red-400">{errors.subjectId.message}</p>
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

export default LessonForm;
