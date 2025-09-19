import { OrderStatus } from "@prisma/client";
import { z } from "zod";

export const orderUpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  metadata: z.union([z.record(z.any()), z.string()]).optional(),
});
