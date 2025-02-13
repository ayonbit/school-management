"use server";

import { classSchema, subjectSchema } from "./fromValidationSchema";
import prisma from "./prisma";

// Shared validation function
const validateSubjectData = (data) => {
  const validation = subjectSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }
  return { success: true, error: null };
};

const validateClassData = (data) => {
  const validation = classSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }
  return { success: true, error: null };
};

// Create Subject
export const createSubject = async (data) => {
  try {
    // Validate input
    const validation = validateSubjectData(data);
    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    // Insert into database
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
    console.error("Error creating subject:", err);
    return {
      success: false,
      error: "Failed to create subject. Please try again.",
    };
  }
};

// Update Subject
export const updateSubject = async (data) => {
  try {
    // Validate input
    const validation = validateSubjectData(data);
    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    // Update database
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

    return { success: true, error: null };
  } catch (err) {
    console.error("Error updating subject:", err);
    return {
      success: false,
      error: "Failed to update subject. Please try again.",
    };
  }
};

// Delete Subject
export const deleteSubject = async (data) => {
  const id = data.get("id");
  try {
    if (!id || isNaN(parseInt(id))) {
      return { success: false, error: "Invalid subject ID" };
    }

    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    return { success: true, error: null };
  } catch (err) {
    console.error("Error deleting subject:", err);
    return {
      success: false,
      error: "Failed to delete subject. Please try again.",
    };
  }
};

// Create Class
export const createClass = async (data) => {
  try {
    // Validate input
    const validation = validateClassData(data);
    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    // Insert into database
    await prisma.class.create({
      data,
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Update Class
export const updateClass = async (data) => {
  try {
    // Validate input
    const validation = validateClassData(data);
    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    // Insert into database
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (data) => {
  const id = data.get("id");
  try {
    await prisma.class.delete({
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
