import Link from "next/link"
import { Activity, Mail, Lock, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

export default function SignupPage() {

  const [email, setEmail] = useState("");
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <main className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-foreground">
              <Activity className="size-6 text-background" />
            </div>
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>Start managing your medications with smart technology</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <User className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="name"
                  type="text"
                  placeholder="John Doe"
                />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Mail className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Lock className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Lock className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                />
              </InputGroup>
            </Field>
            <div className="flex items-center gap-2">
              <Checkbox id="terms" />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the{" "}
                <Link href="#" className="text-foreground hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="#" className="text-foreground hover:underline">Privacy Policy</Link>
              </label>
            </div>
            <Button className="w-full" size="lg" asChild>
              <Link href="/dashboard">Create Account</Link>
            </Button>
          </CardContent>
          <CardFooter className="justify-center border-t pt-6">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-foreground hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Smart Pill Dispenser Portal. All rights reserved.
      </footer>
    </div>
  )
}
