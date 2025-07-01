import { z } from 'zod';

// Regex para validar contraseña: min 8 chars, mayúscula, minúscula, número, caracter especial y sin espacios
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9])(?=^\S+$).{8,}$/;

/**
 * Schema para cambiar contraseña:
 * - currentPassword: obligatorio
 * - newPassword: mínimo 8 caracteres, fuerza y sin espacios
 * - confirmNewPassword: debe coincidir con newPassword
 */
export const getChangePasswordSchema = () =>
  z
    .object({
      currentPassword: z
        .string()
        .min(1, { message: 'La contraseña actual es obligatoria.' }),
      newPassword: z
        .string()
        .min(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres.' })
        .regex(passwordRegex, {
          message:
            'La nueva contraseña debe incluir una mayúscula, una minúscula, un número, un carácter especial y no contener espacios.',
        }),
      confirmNewPassword: z
        .string()
        .min(1, { message: 'Por favor confirma tu nueva contraseña.' }),
    })
    .refine((data) => data.newPassword !== data.currentPassword, {
      message: 'La nueva contraseña debe ser distinta de la actual.',
      path: ['newPassword'],
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: 'Las contraseñas no coinciden.',
      path: ['confirmNewPassword'],
    });

export type ChangePasswordSchemaType = z.infer<ReturnType<typeof getChangePasswordSchema>>;
