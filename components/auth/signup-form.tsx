"use client";

import { useActionState, useState } from "react";
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
import { ActionResponse, signupAction } from "@/app/actions/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
const initialState: ActionResponse = {
  success: false,
  message: "",
  errors: {},
};
export function SignupForm() {
  const router = useRouter();
  const [state, signUpAction, isPending] = useActionState<
    ActionResponse,
    FormData
  >(async (prevState: ActionResponse, payload: FormData) => {
    const response = await signupAction(payload);
    if (!response.success) {
      toast.error(response.message);
      return response;
    }
    toast.success(response.message);
    router.replace("/dashboard");
    return response;
  }, initialState);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information to get started with MealWise
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={signUpAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              required
              disabled={isPending}
              aria-invalid={!!state.errors.name}
            />
            {state.errors.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              disabled={isPending}
              aria-invalid={!!state.errors.email}
            />
            {state.errors.email && (
              <p className="text-sm text-destructive">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isPending}
              aria-invalid={!!state.errors.password}
            />
            {state.errors.password && (
              <p className="text-sm text-destructive">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              disabled={isPending}
              aria-invalid={!!state.errors.confirmPassword}
            />
            {state.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {state.errors.confirmPassword[0]}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating account..." : "Sign Up"}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <a
              href="/signin"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
