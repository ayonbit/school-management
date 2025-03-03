"use server";

import {
  announcementSchema,
  assignmentSchema,
  classSchema,
  eventSchema,
  examSchema,
  lessonSchema,
  parentSchema,
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
  const id = data.get("id");
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    return { success: true, error: false };
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

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
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
          set: data.subjects?.map((subjectId) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

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
        public_metadata: { role: "student" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Clerk API Error: ${JSON.stringify(errorData)}`);
    }

    const user = await response.json();

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
    console.error("Error creating Clerk user:", err.message);
    return { success: false, error: true, message: err.message };
  }
};

export const updateStudent = async (data) => {
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
    await prisma.student.delete({ where: { id } });
    console.log(`Successfully deleted teacher from database: ${id}`);

    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting user:", err.message);
    return { success: false, error: true, message: err.message };
  }
};
//Parent Action
export const createParent = async (data) => {
  try {
    const validation = validateData(data, parentSchema);
    if (!validation.success) return validation;

    // Create a user in Clerk (if needed)
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
        public_metadata: { role: "parent" }, // Set role as parent
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Clerk API Error: ${JSON.stringify(errorData)}`);
    }

    const user = await response.json();

    // Create parent in the database
    await prisma.parent.create({
      data: {
        id: user.id, // Use Clerk user ID
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    return { success: true, error: null };
  } catch (err) {
    console.error("Error creating parent:", err.message);
    return { success: false, error: err.message };
  }
};
export const updateParent = async (data) => {
  if (!data.id) return { success: false, error: "No ID provided" };

  try {
    const validation = validateData(data, parentSchema);
    if (!validation.success) return validation;

    // Update user in Clerk (if needed)
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

    // Update parent in the database
    await prisma.parent.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        students: {
          set: data.students?.map((studentId) => ({ id: studentId })), // Update connected students
        },
      },
    });

    return { success: true, error: null };
  } catch (err) {
    console.error("Error updating parent:", err.message);
    return { success: false, error: err.message };
  }
};
export const deleteParent = async (data) => {
  const id = data.get("id");

  try {
    // Delete user from Clerk (if needed)
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

    // Delete parent from the database
    await prisma.parent.delete({ where: { id } });
    console.log(`Successfully deleted parent from database: ${id}`);

    return { success: true, error: null };
  } catch (err) {
    console.error("Error deleting parent:", err.message);
    return { success: false, error: err.message };
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

//Announcement Action
export const createAnnouncement = async (data) => {
  try {
    const validation = announcementSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        classId: data.classId && data.classId !== "" ? data.classId : null, // Convert empty string to null
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Create Announcement Error:", err);
    return { success: false, error: err.message };
  }
};

export const updateAnnouncement = async (data) => {
  try {
    console.log("Received Data:", data); // Debugging log

    if (!data.id || isNaN(Number(data.id))) {
      console.error("Invalid ID:", data.id);
      return {
        success: false,
        error: "Valid Announcement ID is required for update.",
      };
    }

    // Validate input data
    const validation = announcementSchema.safeParse(data);
    if (!validation.success) {
      console.error("Validation Error:", validation.error.errors);
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    // Convert ID to a number explicitly
    const announcementId = Number(data.id);

    // Check if the announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    console.log("Existing Announcement:", existingAnnouncement); // Debugging log

    if (!existingAnnouncement) {
      return { success: false, error: "Announcement not found." };
    }

    // Update announcement
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: announcementId },
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        classId: data.classId ? Number(data.classId) : null, // Convert to null if empty
      },
    });

    console.log("Updated Announcement:", updatedAnnouncement); // Debugging log

    return { success: true };
  } catch (err) {
    console.error("Update Announcement Error:", err);
    return { success: false, error: err.message };
  }
};

export const deleteAnnouncement = async (data) => {
  const id = data.get("id");
  try {
    await prisma.announcement.delete({
      where: {
        id: parseInt(id),
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Delete Announcement Error:", err);
    return { success: false, error: err.message };
  }
};

//Event Actions

export const createEvent = async (data) => {
  try {
    const validation = eventSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId && data.classId !== "" ? data.classId : null, // Convert empty string to null
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Create Event Error:", err);
    return { success: false, error: err.message };
  }
};

export const updateEvent = async (data) => {
  try {
    const validation = validateData(data, eventSchema);
    if (!validation.success) return validation;

    // Convert ID to a number explicitly
    const eventId = Number(data.id);

    // Check if the announcement exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    console.log("Existing Event:", existingEvent); // Debugging log

    if (!existingEvent) {
      return { success: false, error: "Event not found." };
    }

    // Update announcement
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId ? Number(data.classId) : null, // Convert to null if empty
      },
    });

    console.log("Updated Event:", updatedEvent); // Debugging log

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (data) => {
  const id = data.get("id");
  try {
    await prisma.event.delete({
      where: {
        id: parseInt(id),
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Delete Announcement Error:", err);
    return { success: false, error: err.message };
  }
};

//Assignment Actions
export const createAssignment = async (data) => {
  try {
    const validation = validateData(data, assignmentSchema);
    if (!validation.success) return validation;
    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
export const updateAssignment = async (data) => {
  try {
    const validation = validateData(data, assignmentSchema);
    if (!validation.success) return validation;
    await prisma.assignment.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
export const deleteAssignment = async (data) => {
  const id = data.get("id");

  try {
    await prisma.assignment.delete({
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

//Lesson Actions

export const createLesson = async (data) => {
  try {
    const validation = lessonSchema.safeParse(data);
    if (!validation.success)
      return { success: false, error: validation.error.format() };

    // Create the lesson
    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: new Date(data.startTime), // Ensure DateTime format
        endTime: new Date(data.endTime), // Ensure DateTime format
        class: { connect: { id: data.classId } },
        subject: { connect: { id: data.subjectId } },
        teacher: { connect: { id: data.teacherId } },
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Error creating Lesson:", err);
    return { success: false, error: err.message || "Failed to create Lesson." };
  }
};

export const updateLesson = async (data) => {
  try {
    if (!data.id) return { success: false, error: "Lesson ID is required." };

    const validation = lessonSchema.safeParse(data);
    if (!validation.success)
      return { success: false, error: validation.error.format() };

    // Update the lesson
    await prisma.lesson.update({
      where: { id: data.id },
      data: {
        name: data.name,
        day: data.day,
        startTime: new Date(data.startTime), // Ensure DateTime format
        endTime: new Date(data.endTime), // Ensure DateTime format
        class: { connect: { id: data.classId } },
        subject: { connect: { id: data.subjectId } },
        teacher: { connect: { id: data.teacherId } },
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Error updating Lesson:", err);
    return {
      success: false,
      error: "Failed to update Lesson. Please try again.",
    };
  }
};

export const deleteLesson = async (data) => {
  const id = data.get("id");

  try {
    await prisma.lesson.delete({
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
