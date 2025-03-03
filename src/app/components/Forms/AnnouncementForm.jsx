"use client";

import { createAnnouncement, updateAnnouncement } from "@/app/lib/actions";
import { announcementSchema } from "@/app/lib/fromValidationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import InputField from "../InputField";

const AnnouncementForm = ({ type, data, setOpen, relatedData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      id: data?.id || "", // Add this line to ensure ID is included
      title: data?.title || "",
      description: data?.description || "",
      date: data?.date ? new Date(data.date).toISOString().split("T")[0] : "",
      classId: data?.classId || "",
    },
  });

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onSubmit = handleSubmit((formData) => {
    if (type === "update" && !data?.id) {
      toast.error("Invalid Announcement ID");
      return;
    }

    // Ensure classId is null if no class is selected
    formData.classId = formData.classId === "" ? null : formData.classId;
    formData.id = data?.id; // Ensure ID is included for update

    startTransition(async () => {
      try {
        const response = await (type === "create"
          ? createAnnouncement
          : updateAnnouncement)(formData);

        if (response.success) {
          toast.success(
            `Announcement has been ${
              type === "create" ? "created" : "updated"
            }!`
          );
          setOpen(false);
          router.refresh();
          reset();
        } else {
          toast.error(
            response.error || "Something went wrong! Please try again."
          );
        }
      } catch (error) {
        console.error("Submission Error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  });

  const { classes = [] } = relatedData || {}; // Ensure `classes` is always an array

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new Announcement"
          : "Update the Announcement"}
      </h1>
      <div className="flex justify-between py-2 px-4 flex-wrap gap-4">
        <InputField
          label="Title"
          name="title"
          register={register}
          error={errors?.title}
          placeholder={"e.g. School Closure"}
        />
        <InputField
          label="Description"
          name="description"
          register={register}
          error={errors?.description}
          type="textarea"
          placeholder={"e.g. School will be closed due to heavy rainfall"}
        />
        <InputField
          label="Date"
          name="date"
          register={register}
          error={errors?.date}
          type="date"
        />

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

export default AnnouncementForm;
