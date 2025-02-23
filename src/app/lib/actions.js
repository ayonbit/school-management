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
    if (!validation.success) return validation;

    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "teacher" },
    });

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
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (data) => {
  if (!data.id) return { success: false, error: true };

  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.teacher.update({
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
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId) => ({ id: parseInt(subjectId) })),
        },
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (data) => {
  const id = data.get("id");
  try {
    await clerkClient.users.deleteUser(id);
    await prisma.teacher.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
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
