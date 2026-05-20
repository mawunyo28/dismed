'use client';
import Link from "next/link"
import { Activity, Mail, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { SetStateAction, useState} from "react"
import {createClient} from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async () => {
    await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })

    
  }

  function passwordEntry(event: { target: { value: SetStateAction<string>; }; }) {
        setPassword(event.target.value);
  }

  function emailEntry(event) {
    setEmail(event.target.value);
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <main className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-foreground">
              <Activity className="size-6 text-background" />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your health portal</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
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

                  onChange={emailEntry}
                />
              </InputGroup>
            </Field>
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Forgot password?
                </Link>
              </div>
              <InputGroup>
                <InputGroupAddon>
                  <Lock className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="password"
                  type="password"
                  placeholder="********"
                  onChange={passwordEntry}
                />
              </InputGroup>
            </Field>
            <Button className="w-full" size="lg" asChild onClick={signIn}>
              <Link href="/dashboard">Sign In</Link>
            </Button>
          </CardContent>
          <CardFooter className="justify-center border-t pt-6">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-foreground hover:underline">
                Sign up now
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
