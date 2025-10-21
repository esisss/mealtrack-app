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
    .min(6, "Password must be at least 6 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});
export type SignInData = z.infer<typeof SignInSchema>;
const signinAction = async (formData: FormData): Promise<ActionResponse> => {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const result = SignInSchema.safeParse({ email, password });

    if (!result.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: z.flattenError(result.error).fieldErrors,
      };
    }
    console.log({ email, password });
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
export { signinAction };
