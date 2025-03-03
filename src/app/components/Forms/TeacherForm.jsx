"use client";
import { createTeacher, updateTeacher } from "@/app/lib/actions";
import { teacherSchema } from "@/app/lib/fromValidationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import InputField from "../InputField";

const TeacherForm = ({ type, data, setOpen, relatedData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teacherSchema),
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
      const action = type === "create" ? createTeacher : updateTeacher;
      const result = await action({ ...formData, img: img?.secure_url });
      console.log(result);
      if (result?.success) {
        toast.success(
          `Teacher has been ${type === "create" ? "created" : "updated"}!`
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

  const { subjects } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new Teacher" : "Update the Teacher"}
      </h1>
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
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
          placeholder={"Aa1! 8 characters"}
        />
      </div>
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
        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors.bloodType}
          placeholder={"e.g. A+"}
        />
        <InputField
          label="Birthday"
          name="dob"
          defaultValue={data?.dob.toISOString().split("T")[0]}
          register={register}
          error={errors.dob}
          type="date"
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
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Sex</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("sex", { required: "Gender is required" })}
            defaultValue={data?.sex || ""}
          >
            <option value="" disabled>
              Select Gender
            </option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subjects</label>
          <select
            multiple
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjects")}
            defaultValue={data?.subjects?.map((subject) => subject.id)} // Pre-select subjects
          >
            {subjects.map((subject) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjects?.message && (
            <p className="text-xs text-red-400">
              {errors.subjects.message.toString()}
            </p>
          )}
        </div>
        <CldUploadWidget
          uploadPreset="school_management"
          onSuccess={(result, { widget }) => {
            setImg(result.info);
            widget.close();
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
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default TeacherForm;
