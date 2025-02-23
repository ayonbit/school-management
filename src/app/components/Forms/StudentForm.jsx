"use client";

import { createStudent, updateStudent } from "@/app/lib/actions";
import { studentSchema } from "@/app/lib/fromValidationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import InputField from "../InputField";

const StudentForm = ({ type, data, setOpen, relatedData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentSchema),
  });

  const [img, setImg] = useState();
  const [state, setState] = useState({ success: false, error: false });
  const router = useRouter();

  // Initialize the img state with the existing image URL
  useEffect(() => {
    if (data?.img) {
      setImg({ secure_url: data.img });
    }
  }, [data]);

  const onSubmit = handleSubmit(async (formData) => {
    console.log("Form Data Submitted:", formData);
    try {
      const action = type === "create" ? createStudent : updateStudent;
      const result = await action({ ...formData, img: img?.secure_url });
      console.log(result);
      if (result?.success) {
        toast.success(
          `Student has been ${type === "create" ? "created" : "updated"}!`
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

  const { grades, classes } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new student" : "Update the student"}
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
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
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
        />
        <InputField
          label="Last Name"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors.bloodType}
        />
        <InputField
          label="Birthday"
          name="dob"
          type="date"
          defaultValue={data?.dob?.toISOString().split("T")[0]}
          register={register}
          error={errors.dob}
        />
        <InputField
          label="Parent Id"
          name="parentId"
          defaultValue={data?.parentId}
          register={register}
          error={errors.parentId}
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
        {/* Image Upload */}
        <CldUploadWidget
          uploadPreset="school_management"
          onSuccess={(result) => {
            setImg(result.info); // Only pass the result.info object
          }}
        >
          {({ open }) => (
            <div className="flex flex-col items-start gap-2 cursor-pointer">
              <div className="flex items-center gap-2">
                <Image src="/upload.png" alt="Upload" width={28} height={28} />
                <span onClick={() => open()} className="text-xs text-gray-500">
                  Upload a photo
                </span>
              </div>
              {img?.secure_url && (
                <Image
                  src={img.secure_url}
                  alt="Uploaded Preview"
                  width={100}
                  height={100}
                  className="mt-2 rounded-md border border-gray-300"
                />
              )}
            </div>
          )}
        </CldUploadWidget>
      </div>

      {/* Dropdowns for Sex, Grade, and Class */}
      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Sex</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("sex")}
            defaultValue={data?.sex}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">{errors.sex.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Grade</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
            defaultValue={data?.gradeId}
          >
            {grades.map((grade) => (
              <option value={grade.id} key={grade.id}>
                {grade.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">{errors.gradeId.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
            defaultValue={data?.classId}
          >
            {classes.map((classItem) => (
              <option value={classItem.id} key={classItem.id}>
                {classItem.name} - {classItem._count.students}/
                {classItem.capacity}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">{errors.classId.message}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default StudentForm;
