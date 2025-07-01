import { z } from 'zod';

// Regex para validar contraseña: mayúscula, minúscula, número, carácter especial y sin espacios
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9])(?=^\S+$).{8,}$/;

/**
 * Schema para solicitar el envío de correo de restablecimiento de contraseña
 */
export const getResetRequestSchema = () =>
  z.object({
    email: z
      .string()
      .trim()
      .min(1, { message: 'El correo electrónico es obligatorio.' })
      .email({ message: 'Por favor ingresa una dirección de correo válida.' })
      .transform((val) => val.toLowerCase()),
  });

export type ResetRequestSchemaType = z.infer<ReturnType<typeof getResetRequestSchema>>;

/**
 * Schema para establecer una nueva contraseña
 */
export const getNewPasswordSchema = () =>
  z
    .object({
      password: z
        .string()
        .min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
        .regex(passwordRegex, {
          message:
            'La contraseña debe incluir una mayúscula, una minúscula, un número, un carácter especial y no contener espacios.',
        }),
      confirmPassword: z
        .string()
        .min(1, { message: 'Por favor confirma tu contraseña.' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Las contraseñas no coinciden.',
      path: ['confirmPassword'],
    });

export type NewPasswordSchemaType = z.infer<ReturnType<typeof getNewPasswordSchema>>;
