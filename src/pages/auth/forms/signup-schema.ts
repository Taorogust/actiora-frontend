import { z } from 'zod';

// Regex para validar contraseña con mayúsculas, minúsculas, números, carácter especial y sin espacios
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9])(?=^\S+$).{10,}$/;

export const getSignupSchema = () =>
  z
    .object({
      firstName: z
        .string()
        .trim()
        .min(1, { message: 'El nombre es obligatorio.' })
        .max(50, { message: 'El nombre no puede exceder 50 caracteres.' }),

      lastName: z
        .string()
        .trim()
        .min(1, { message: 'Los apellidos son obligatorios.' })
        .max(50, { message: 'Los apellidos no pueden exceder 50 caracteres.' }),

      email: z
        .string()
        .trim()
        .min(1, { message: 'El correo electrónico es obligatorio.' })
        .email({ message: 'Por favor ingresa una dirección de correo válida.' })
        .transform((val) => val.toLowerCase()),

      emailConfirm: z
        .string()
        .trim()
        .min(1, { message: 'Por favor confirma tu correo electrónico.' })
        .email({ message: 'Por favor ingresa una dirección de correo válida.' })
        .transform((val) => val.toLowerCase()),

      password: z
        .string()
        .min(10, { message: 'La contraseña debe tener al menos 10 caracteres.' })
        .regex(passwordRegex, {
          message:
            'La contraseña debe incluir una mayúscula, una minúscula, un número, un carácter especial y no contener espacios.',
        }),

      confirmPassword: z
        .string()
        .min(1, { message: 'Por favor confirma tu contraseña.' }),

      terms: z
        .boolean()
        .refine((val) => val === true, {
          message: 'Debes aceptar los términos y condiciones.',
        })
        .default(false),

      captchaToken: z
        .string()
        .min(1, { message: 'Por favor completa la verificación anti-robots.' }),
    })
    // Validaciones cruzadas
    .refine((data) => data.email === data.emailConfirm, {
      message: 'Los correos electrónicos no coinciden.',
      path: ['emailConfirm'],
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Las contraseñas no coinciden.',
      path: ['confirmPassword'],
    });

export type SignupSchemaType = z.infer<ReturnType<typeof getSignupSchema>>;
