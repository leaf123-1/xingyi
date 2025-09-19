import { ContactStatus } from "@prisma/client";
import { z } from "zod";

export const messageUpdateSchema = z.object({
  status: z.nativeEnum(ContactStatus),
});
