import { z } from "zod";

// ============================================================
// Schémas de validation auth — partagés frontend + server actions
// ============================================================

export const signupSchema = z
  .object({
    email: z
      .string()
      .email("Adresse email invalide")
      .max(254, "Email trop long"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .max(72, "Mot de passe trop long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .max(72, "Mot de passe trop long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// RG-001: username format — a-z, 0-9, tirets, 3-30 chars
export const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Le username doit contenir au moins 3 caractères")
    .max(30, "Le username ne peut pas dépasser 30 caractères")
    .regex(
      /^[a-z0-9-]+$/,
      "Uniquement des lettres minuscules, chiffres et tirets",
    )
    .refine((val) => !val.startsWith("-") && !val.endsWith("-"), {
      message: "Le username ne peut pas commencer ou finir par un tiret",
    }),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UsernameInput = z.infer<typeof usernameSchema>;
