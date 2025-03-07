"use client";

import { createEvent, updateEvent } from "@/app/lib/actions";
import { eventSchema } from "@/app/lib/fromValidationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import InputField from "../InputField";

const EventForm = ({ type, data, setOpen, relatedData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: data?.title || "",
      description: data?.description || "",
      startTime: data?.startTime
        ? new Date(data.startTime).toISOString().slice(0, 16)
        : "", // Fix for startTime
      endTime: data?.endTime
        ? new Date(data.endTime).toISOString().slice(0, 16)
        : "", // Fix for endTime
      classId: data?.classId || "", // Default value for classId
    },
  });

  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState({ success: false, error: false });

  const router = useRouter();

  const onSubmit = handleSubmit((formData) => {
    startTransition(async () => {
      try {
        const response = await (type === "create" ? createEvent : updateEvent)(
          formData
        );
        setState({ success: true, error: false });
      } catch (error) {
        setState({ success: false, error: true });
      }
    });
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Event has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { classes } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Event" : "Update the Event"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Event Title"
          name="title"
          register={register}
          error={errors?.title}
          placeholder={"Event Title"}
        />
        <InputField
          label="Description"
          name="description"
          register={register}
          error={errors?.description}
          type="textarea"
          placeholder={"Event Description"}
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
        {data && (
          <input type="hidden" {...register("id")} defaultValue={data?.id} />
        )}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class (Optional)</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
            defaultValue={data?.classId || ""}
          >
            <option value="">Select Class</option>
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

export default EventForm;
