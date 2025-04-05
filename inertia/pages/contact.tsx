import { useForm } from '@inertiajs/react'
import { Button } from '~/components/button'
import { Input } from '~/components/input'
import { Label } from '~/components/label'
import { MarketingLayout } from '~/components/marketing-layout/marketing-layout'
import { Textarea } from '~/components/textarea'
import { useState } from 'react'
import { Check } from 'lucide-react'

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const form = useForm({
    email: '',
    message: '',
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    form.post('/contact', {
      onSuccess: () => {
        setIsSubmitted(true)
      },
    })
  }

  return (
    <MarketingLayout>
      <section className="flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
        <h2 className="text-5xl text-center font-serif italic">Get in touch</h2>

        {isSubmitted ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="rounded-full bg-emerald-50 border border-emerald-600 p-3">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-medium mb-2">Message sent!</h3>
              <p className="text-neutral-500">
                Thanks for reaching out.
                <br />
                We'll get back to you as soon as possible.
              </p>
            </div>
          </div>
        ) : (
          <form className="w-full gap-4 flex flex-col" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                name="email"
                id="email"
                type="email"
                placeholder="cyrano@bergerac.com"
                value={form.data.email}
                onChange={(e) => form.setData('email', e.target.value)}
                disabled={form.processing}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                name="message"
                id="message"
                placeholder="What's on your mind?"
                value={form.data.message}
                onChange={(e) => form.setData('message', e.target.value)}
                disabled={form.processing}
              />
            </div>
            <Button disabled={form.processing}>
              {form.processing ? 'Sending...' : 'Send message'}
            </Button>
          </form>
        )}
      </section>
    </MarketingLayout>
  )
}
