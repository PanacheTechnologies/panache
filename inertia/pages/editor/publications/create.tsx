import { Logo } from '~/components/logo'
import { Link } from '@inertiajs/react'
import CreatePublicationForm from '~/components/editor/create-publication-form'

export default function CreatePublication() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-orange-50 p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex justify-center w-full">
          <Link
            className="size-12 text-3xl hover:opacity-75 transition-opacity"
            href="/publications"
          >
            <Logo className="size-12 text-3xl" />
          </Link>
        </div>
        <header className="flex flex-col">
          <h1 className="font-medium text-2xl text-center">Create a new publication</h1>
          <h2 className="text-center text-neutral-600">
            Start sharing your ideas with the world, by setting up a new publication.
          </h2>
        </header>

        <CreatePublicationForm />
      </div>
    </div>
  )
}
