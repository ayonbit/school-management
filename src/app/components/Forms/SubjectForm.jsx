"use client";

import { createSubject, updateSubject } from "@/app/lib/actions";
import { SubjectSchema } from "@/app/lib/fromValidationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation"; // ✅ Import useRouter
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import InputField from "../InputField";

const SubjectForm = ({ type, data, setOpen }) => {
  const router = useRouter(); // ✅ Initialize router

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(SubjectSchema),
    defaultValues: { name: data?.name || "" }, // Pre-fill for update
  });

  const [state, setState] = useState({ success: false, error: null });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    reset({ name: data?.name || "" });
  }, [data, reset]);

  // Handle form submission for both create and update
  const onSubmit = handleSubmit((formData) => {
    startTransition(async () => {
      let response;
      if (type === "update") {
        response = await updateSubject(data.id, formData); // ✅ Pass `id` for updating
      } else {
        response = await createSubject(formData);
      }

      setState(response);

      if (response.success) {
        toast.success(
          `Subject ${type === "create" ? "Created" : "Updated"} Successfully!`
        );
        setOpen(false);
        router.refresh(); // ✅ Refresh the page after update
      } else {
        toast.error(
          response.error || "Something went wrong. Please try again."
        );
      }
    });
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a New Subject" : "Update the Subject"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Subject Name"
          name="name"
          register={register}
          error={errors.name}
          placeholder="Subject"
        />
      </div>

      {state.error && <span className="text-red-500">{state.error}</span>}

      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded-md"
        disabled={isPending}
      >
        {isPending ? "Processing..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default SubjectForm;
