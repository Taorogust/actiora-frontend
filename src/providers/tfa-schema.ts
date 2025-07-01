import { z } from 'zod';

/**
 * Schema para validación del código 2FA (6 dígitos numéricos)
 */
export const getTfaSchema = () =>
  z.object({
    code: z
      .string()
      .length(6, { message: 'El código debe tener 6 dígitos.' })
      .regex(/^\d{6}$/, { message: 'El código solo puede contener números.' }),
  });

export type TfaSchemaType = z.infer<ReturnType<typeof getTfaSchema>>;
