import { z } from "zod";

// Schema validation
export const SubjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject Name is required !" }),
});
