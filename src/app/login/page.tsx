"use client"

import { useState } from "react"
import { login, signup } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(event.currentTarget)
    const action = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('formAction')
    
    try {
      let result;
      if (action === 'signup') {
        result = await signup(formData)
      } else {
        result = await login(formData)
      }
      
      if (result?.error) {
        setError(result.error)
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">UPSC PYQ Revision</CardTitle>
          <CardDescription>
            Enter your email and password to log in or create an account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m.gandhi@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {error && (
              <div className="text-sm font-medium text-destructive text-center">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" formAction="login" className="w-full" disabled={isLoading}>
              Sign In
            </Button>
            <Button type="submit" formAction="signup" variant="outline" className="w-full" disabled={isLoading}>
              Create Account
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
