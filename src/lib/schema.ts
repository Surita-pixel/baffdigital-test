import { z } from "zod";

export const PriceSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.string().min(3, "El tipo de precio debe tener al menos 3 caracteres"),
  amount: z.number().min(0, "El precio no puede ser negativo"),
});

export const ProcedureSchema = z.object({
  id: z.string().uuid().optional(),
  pk: z.string(),
  sk: z.literal("DETAILS"),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  prices: z.array(PriceSchema),
  createdAt: z.string().datetime({
    message: "Fecha inválida, debe estar en formato ISO 8601",
  }),
});


export const ClientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
});
export const QuoteSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  clientname: z.string().optional(),  
  discount: z.number().min(0).max(100),
  procedureId: z.string().uuid(),
  proceduretitle: z.string().optional(), 
  procedurePrice: z.object({
      id: z.string().uuid(),
      type: z.string(),
      amount: z.number(),
  }),
  amount: z.number(),
  notes: z.string().optional(),
});

export type ClientValues = z.infer<typeof ClientSchema>;
export type ProcedureValues = z.infer<typeof ProcedureSchema>;
export type PriceValues = z.infer<typeof PriceSchema>;
export type QuoteValues = z.infer<typeof QuoteSchema>;