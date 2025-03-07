"use client";

import { createParent, updateParent } from "@/app/lib/actions";
import { parentSchema } from "@/app/lib/fromValidationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import InputField from "../InputField";

const parentForm = ({ type, data, setOpen }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(parentSchema),
  });

  const [state, setState] = useState({ success: false, error: false });
  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const action = type === "create" ? createParent : updateParent;
      const result = await action({ ...formData });

      if (result?.success) {
        toast.success(
          `Parent has been ${type === "create" ? "created" : "updated"}!`
        );
        router.refresh();
        setOpen(false);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Parent" : "Update the Parent"}
      </h1>

      {/* Authentication Information */}
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
          placeholder={"e.g. johndoe123"}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
          placeholder={"email is required"}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue={data?.password || ""}
          register={register}
          error={errors?.password}
          placeholder={"Aa1! 8 characters"}
        />
      </div>

      {/* Personal Information */}
      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="First Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
          placeholder={"John"}
        />
        <InputField
          label="Last Name"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
          placeholder={"Doe"}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
          placeholder={"01234567890"}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
          placeholder={"123 Main St, City, Country"}
        />

        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
      </div>

      {/* Submit Button */}
      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};
export default parentForm;
