"use server";

import { subjectSchema } from "./fromValidationSchema";
import prisma from "./prisma";

// Shared validation function
const validateSubjectData = (data) => {
  const validation = subjectSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }
  return { success: true, error: null };
};

//create Subject
export const createSubject = async (data) => {
  try {
    // Validate input
    const validation = validateSubjectData(data);
    if (!validation.success) return validation;

    // Insert into database
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

//Update Subject
export const updateSubject = async (data) => {
  try {
    // Validate input
    const validation = validateSubjectData(data);
    if (!validation.success) return validation;

    //Update Db
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (data) => {
  const id = data.get("id");
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
