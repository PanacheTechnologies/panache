import { Button, buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import EditorLayout from '~/components/editor_layout'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { useForm } from '@inertiajs/react'
import Publication from '#models/publication'
import useParams from '~/hooks/use_params'
import { SettingsLayoutNav } from '~/components/settings_layout_nav'
import { Field } from '~/components/ui/field'

export default function GeneralSettings({ publication }: { publication: Publication }) {
  const params = useParams()
  const form = useForm({
    title: publication.title,
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    form.patch(`/publications/${params.slug}`)
  }

  const handleDelete = () => {
    form.delete(`/publications/${publication.id}`)
  }

  const publicationUrl = `${publication.slug}.panache.so`

  return (
    <EditorLayout title="General Settings">
      <div className="grid sm:grid-cols-4 lg:grid-cols-9 gap-x-8 py-8">
        <div className="lg:col-span-2">
          <SettingsLayoutNav />
        </div>

        <div className="sm:col-span-3 lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your publication's basic settings.</CardDescription>
            </CardHeader>
            <CardContent className="!pt-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Field>
                  <Label htmlFor="domain">Domain</Label>
                  <div className="flex items-center">
                    <div className="flex w-full">
                      <span className="flex font-medium items-center border-r-0 px-3 h-10 bg-neutral-50 text-neutral-600 rounded-sm rounded-r-none border border-neutral-300 text-sm">
                        https://
                      </span>
                      <Input
                        id="domain"
                        value={publicationUrl}
                        readOnly
                        className="!w-full rounded-l-none bg-neutral-50 text-neutral-600 border-neutral-200 cursor-not-allowed pr-[42px]"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600">This is your publication's URL.</p>
                </Field>

                <Field>
                  <Label htmlFor="title">Publication Title</Label>
                  <Input
                    id="title"
                    value={form.data.title}
                    onChange={(e) => form.setData('title', e.target.value)}
                  />
                </Field>

                <div className="flex justify-between items-center">
                  <Button type="submit" disabled={form.processing}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
                <CardDescription>
                  Actions here can't be undone. Please proceed with caution.
                </CardDescription>
              </CardHeader>
              <CardContent className="!pt-0">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="danger">Delete Publication</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your publication
                        and remove all of its data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className={buttonVariants({ variant: 'danger' })}
                        onClick={handleDelete}
                      >
                        Delete Publication
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </EditorLayout>
  )
}
