"use server";
import { z } from "zod";
export type ActionResponse = {
  success: boolean;
  message: string;
  errors: Record<string, string[]>;
};
const SignInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z
    .string()
    .min(6)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/),
});

const SignUpSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type SignInData = z.infer<typeof SignInSchema>;
export type SignUpData = z.infer<typeof SignUpSchema>;
const signupAction = async (formData: FormData): Promise<ActionResponse> => {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    console.log(name, email, password, confirmPassword);
    const result = SignUpSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });
    console.log(result.error);
    if (!result.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: z.flattenError(result.error).fieldErrors,
      };
    }
    return {
      success: true,
      message: "Signed up successfully",
      errors: {},
    };
  } catch (error) {
    console.error("Signup failed:", error);
    return {
      success: false,
      message: "An error occurred",
      errors: { error: error as string[] },
    };
  }
};
const signinAction = async (formData: FormData): Promise<ActionResponse> => {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const result = SignInSchema.safeParse({ email, password });

    if (!result.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: { error: ["Invalid email or password"] },
      };
    }
    return {
      success: true,
      message: "Signed in successfully",
      errors: {},
    };
  } catch (error) {
    console.error("Signin failed:", error);
    return {
      success: false,
      message: "An error occurred",
      errors: { error: error as string[] },
    };
  }
};
export { signinAction, signupAction };
