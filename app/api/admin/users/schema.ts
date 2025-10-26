import { UserRole } from "@prisma/client";
import { z } from "zod";

export const userUpdateSchema = z.object({
  role: z.nativeEnum(UserRole),
});
