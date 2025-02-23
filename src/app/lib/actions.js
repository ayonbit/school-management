// actions.js
"use server";

import { clerkClient } from "@clerk/nextjs/server";
import {
  classSchema,
  examSchema,
  studentSchema,
  subjectSchema,
  teacherSchema,
} from "./fromValidationSchema";
import prisma from "./prisma";

// Shared validation function
const validateData = (data, schema) => {
  const validation = schema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }
  return { success: true, error: null };
};

// Subject Actions
export const createSubject = async (data) => {
  try {
    const validation = validateData(data, subjectSchema);
    if (!validation.success) return validation;

    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });
    return { success: true, error: null };
  } catch (err) {
    console.error("Error creating Subject:", err);
    return {
      success: false,
      error: "Failed to create Subject. Please try again.",
    };
  }
};

export const updateSubject = async (data) => {
  try {
    const validation = validateData(data, subjectSchema);
    if (!validation.success) return validation;

    await prisma.subject.update({
      where: { id: data.id },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });
    return { success: true, error: null };
  } catch (err) {
    console.error("Error updating Subject:", err);
    return {
      success: false,
      error: "Failed to update Subject. Please try again.",
    };
  }
};

export const deleteSubject = async (data) => {
  try {
    const id = parseInt(data.get("id"));
    if (!id) return { success: false, error: "Invalid subject ID" };
    await prisma.subject.delete({ where: { id } });
    return { success: true, error: null };
  } catch (err) {
    console.error("Error deleting Subject:", err);
    return {
      success: false,
      error: "Failed to delete Subject. Please try again.",
    };
  }
};

// Class Actions
export const createClass = async (data) => {
  try {
    const validation = validateData(data, classSchema);
    if (!validation.success) return validation;
    await prisma.class.create({ data });
    return { success: true, error: null };
  } catch (err) {
    console.error("Error creating Class:", err);
    return {
      success: false,
      error: "Failed to create Class. Please try again.",
    };
  }
};

export const updateClass = async (data) => {
  try {
    const validation = validateData(data, classSchema);
    if (!validation.success) return validation;
    await prisma.class.update({ where: { id: data.id }, data });
    return { success: true, error: null };
  } catch (err) {
    console.error("Error updating class:", err);
    return {
      success: false,
      error: "Failed to update class. Please try again.",
    };
  }
};

export const deleteClass = async (data) => {
  try {
    const id = parseInt(data.get("id"));
    await prisma.class.delete({ where: { id } });
    return { success: true, error: null };
  } catch (err) {
    console.error("Error deleting class:", err);
    return {
      success: false,
      error: "Failed to delete class. Please try again.",
    };
  }
};

// Teacher Actions
export const createTeacher = async (data) => {
  try {
    const validation = validateData(data, teacherSchema);
    console.log("Validation Result:", validation);
    if (!validation.success) return validation;

    const response = await fetch("https://api.clerk.dev/v1/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: [data.email], // Clerk expects an array for emails
        username: data.username,
        password: data.password,
        first_name: data.name,
        last_name: data.surname,
        public_metadata: { role: "teacher" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Clerk API Error: ${JSON.stringify(errorData)}`);
    }

    const user = await response.json();

    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        dob: data.dob,
        subjects: {
          connect: data.subjects?.map((subjectId) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating Clerk user:", err.message);
    return { success: false, error: true, message: err.message };
  }
};

export const updateTeacher = async (data) => {
  if (!data.id)
    return { success: false, error: true, message: "No ID provided" };

  try {
    console.log("Updating user with ID:", data.id);

    const response = await fetch(`https://api.clerk.dev/v1/users/${data.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: data.username,
        ...(data.password ? { password: data.password } : {}),
        first_name: data.name,
        last_name: data.surname,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user: ${await response.text()}`);
    }

    const user = await response.json();
    console.log("Updated Clerk user successfully:", user);

    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating user:", err);
    return { success: false, error: true, message: err.message };
  }
};

export const deleteTeacher = async (data) => {
  const id = data.get("id");

  try {
    console.log("Deleting user with ID:", id);

    const clerkApiKey = process.env.CLERK_SECRET_KEY; // Ensure this is set in .env
    if (!clerkApiKey) throw new Error("Clerk API key is missing");

    const response = await fetch(`https://api.clerk.dev/v1/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${clerkApiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Clerk API Error: ${errorData.message || response.statusText}`
      );
    }

    console.log(`Successfully deleted Clerk user: ${id}`);

    // Delete from database
    await prisma.teacher.delete({ where: { id } });
    console.log(`Successfully deleted teacher from database: ${id}`);

    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting user:", err.message);
    return { success: false, error: true, message: err.message };
  }
};

// Student Actions
export const createStudent = async (data) => {
  try {
    const validation = validateData(data, studentSchema);
    if (!validation.success) return validation;

    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }

    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student" },
    });

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        dob: data.dob,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (data) => {
  if (!data.id) return { success: false, error: true };

  try {
    const validation = validateData(data, studentSchema);
    if (!validation.success) return validation;

    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
      where: { id: data.id },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        dob: data.dob,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (data) => {
  const id = data.get("id");
  try {
    await clerkClient.users.deleteUser(id);
    await prisma.student.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

//Exam Action

export const createExam = async (data) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }
    const validation = validateData(data, examSchema);
    if (!validation.success) return validation;
    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (data) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }
    const validation = validateData(data, examSchema);
    if (!validation.success) return validation;
    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (data) => {
  const id = data.get("id");

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
        // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
