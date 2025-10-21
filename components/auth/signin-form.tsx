"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ActionResponse, signinAction } from "@/app/actions/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
const initialState: ActionResponse = {
  success: false,
  message: "",
  errors: {},
};
export function SigninForm() {
  const router = useRouter();
  const [state, signin, isPending] = useActionState<ActionResponse, FormData>(
    async (prevState: ActionResponse, payload: FormData) => {
      try {
        const response = await signinAction(payload);
        if (!response.success) {
          toast.error(response.message);
          return response;
        }
        toast.success(response.message);
        router.replace("/dashboard");
        return response;
      } catch (error: any) {
        toast.error("An error occurred");
        return {
          success: false,
          message: "An error occurred",
          errors: { error: ["Something went wrong. Please try again."] },
        };
      }
    },
    initialState
  );

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your MealWise account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a
                  href="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={isPending}
              />
              {state.errors.error && (
                <p className="text-red-500 text-sm">{state.errors.error[0]}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{" "}
              <a
                href="/signup"
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
