"use server";
import prisma from "./prisma";

export const createSubject = async (data) => {
  try {
    // Validate input
    if (!data.name || data.name.trim() === "") {
      return { success: false, error: "Subject name is required" };
    }

    // Insert into database
    await prisma.Subject.create({ data: { name: data.name } });

    // Revalidate cache
    // revalidatePath("/list/subjects");

    return { success: true, error: null };
  } catch (error) {
    console.error("Create Subject Error:", error);
    return { success: false, error: "Failed to create subject" };
  }
};

export const updateSubject = async (id, data) => {
  try {
    // Validate input
    if (!data.name || data.name.trim() === "") {
      return { success: false, error: "Subject name is required" };
    }

    // Update subject in database
    await prisma.Subject.update({
      where: { id }, // Specify which subject to update
      data: { name: data.name },
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Update Subject Error:", error);
    return { success: false, error: "Failed to update subject" };
  }
};

export async function deleteSubject(id) {
  if (!id) return { success: false, error: "ID is required" };
  try {
    await prisma.Subject.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}