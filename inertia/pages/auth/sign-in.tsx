import { Link, useForm } from '@inertiajs/react'
import { AuthLayout } from '~/components/auth/auth-layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/card'
import { Input } from '~/components/input'
import { Label } from '~/components/label'
import { Error } from '~/components/error'
import { Button } from '~/components/button'

export default function SignInPage() {
  const form = useForm({
    email: '',
    password: '',
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    form.post('/auth/sign-in')
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your Panache account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                className="mt-1"
                id="email"
                name="email"
                type="email"
                placeholder="cyrano@bergerac.fr"
                value={form.data.email}
                onChange={(e) => form.setData('email', e.target.value)}
              />
              <Error errorKey="email" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                className="mt-1"
                id="password"
                name="password"
                type="password"
                placeholder="••••••••••••••"
                value={form.data.password}
                onChange={(e) => form.setData('password', e.target.value)}
              />
              <Error errorKey="password" />
            </div>

            <Error errorKey="E_INVALID_CREDENTIALS" />

            <Button className="w-full" type="submit" loading={form.processing}>
              Sign in
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-neutral-500 text-center justify-center">
          <p>Don't have an account?</p>{' '}
          <Link
            className="ml-1 underline underline-offset-4 text-emerald-700 hover:text-emerald-500 transition-colors"
            href="/auth/sign-up"
          >
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
