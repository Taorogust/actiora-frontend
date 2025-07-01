import { z } from 'zod';

// Regex to enforce at least one uppercase, one lowercase, one number, one special char, no spaces, and minimum 8 chars
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s])(?!.*\s).{8,}$/;

export const getSigninSchema = () =>
  z.object({
    email: z
      .string()
      .trim()
      .min(1, { message: 'El correo electrónico es obligatorio.' })
      .email({ message: 'Por favor ingresa una dirección de correo válida.' })
      .transform((val) => val.toLowerCase()),

    password: z
      .string()
      .min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
      .regex(passwordRegex, {
        message:
          'La contraseña debe incluir al menos una mayúscula, una minúscula, un número, un carácter especial y no contener espacios.',
      }),

    rememberMe: z
      .boolean()
      .optional()
      .default(false),
  });

export type SigninSchemaType = z.infer<ReturnType<typeof getSigninSchema>>;
