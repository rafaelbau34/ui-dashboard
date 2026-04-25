// app/login/page.tsx
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const errorMessage =
    searchParams?.error === "CredentialsSignin"
      ? "Invalid username or password."
      : "";

  async function handleLogin(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        name: formData.get("name"),
        password: formData.get("password"),
        redirectTo: "/",
      });
    } catch (error) {
      // If it's an Auth.js error, redirect back to the login page with an error flag
      if (error instanceof AuthError) {
        if (error.type === "CredentialsSignin") {
          // We have to use a relative redirect to pass the error parameter
          const { redirect } = await import("next/navigation");
          redirect("/login?error=CredentialsSignin");
        }
      }
      // VERY IMPORTANT: Next.js relies on throwing errors to handle redirects.
      // If it's NOT an AuthError (like a successful login redirect), we must re-throw it!
      throw error;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Dashboard Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Username</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Show error message if credentials fail */}
            {errorMessage && (
              <div className="text-sm text-red-500 text-center font-medium">
                {errorMessage}
              </div>
            )}

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
