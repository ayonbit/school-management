// fromValidationSchema.js
import { z } from "zod";

// Base User Schema (Reusable) validation
const baseUserSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  img: z.string().optional(),
});

// Subject Schema validation
export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()).default([]), // Default empty array if no teachers are assigned
});

// Class Schema
export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Class name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  supervisorId: z.coerce.string().optional(),
});

// Teacher Schema validation
export const teacherSchema = baseUserSchema.extend({
  id: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  dob: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Gender is required!" }),
  subjects: z.array(z.union([z.string(), z.number()])).default([]),
});

// Student Schema
export const studentSchema = baseUserSchema.extend({
  id: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  dob: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  parentId: z.string().min(1, { message: "Parent Id is required!" }),
});

//exam schema validation
export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

//Parent Schema validation//  *** Only used for updates  //Base User Schema is Same so no need new validation
export const parentSchema = baseUserSchema
  .extend({
    id: z.string().optional(),
  })
  .refine((data) => data.password || data.id, {
    message: "Password is required for new parents!",
    path: ["password"],
  });

//Announcement Schema Validation
export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters long" }),
  date: z.coerce
    .date()
    .refine((date) => date instanceof Date && !isNaN(date.getTime()), {
      message: "Invalid date format",
    }),

  // Ensure `classId` is either a number or null
  classId: z.union([z.coerce.number(), z.null()]).optional(),
});

//Event Schema Validation
export const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters long" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  classId: z.coerce.number({ message: "Lesson is required!" }),
});
//Assignment Schema Validation
export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startDate: z.coerce.date({ message: "Start time is required!" }),
  dueDate: z.coerce.date({ message: "End time is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});
//Lesson Schema Validation
export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(3, { message: "Lesson name is required!" }),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]), // Matches Prisma Enum
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  subjectId: z.coerce.number({ message: "Subject is required!" }),
  classId: z.coerce.number({ message: "Class is required!" }),
  teacherId: z.string({ message: "Teacher is required!" }),
});
