import { buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '~/components/ui/card'
import useParams from '~/hooks/use_params'
import Publication from '#models/publication'
import { Link } from '@inertiajs/react'
import { IconExternalLink } from '@tabler/icons-react'
import EditorLayout from '~/components/editor_layout'
import NewPostForm from '~/components/new_post_form'

export default function EditorShow({
  publication,
  numberOfPosts,
  numberOfContacts,
}: {
  publication: Publication
  numberOfPosts: number
  numberOfContacts: number
}) {
  const params = useParams()

  return (
    <EditorLayout
      title="Overview"
      actions={
        <div className="flex items-center gap-x-2">
          <a
            className={buttonVariants({ variant: 'secondary' })}
            href={publication.url}
            target="_blank"
          >
            <IconExternalLink className="w-4.5 h-4.5 -ml-1" />
            <span className="flex items-center gap-x-2">View Site</span>
          </a>
          <NewPostForm publicationDomain={params.slug} />
        </div>
      }
    >
      <div className="my-8 flex items-center gap-x-4">
        <Link
          className="w-full hover:opacity-75 transition-opacity"
          href={`/publications/${params.slug}/posts`}
        >
          <Card className="w-full">
            <CardContent className="gap-y-2 flex flex-col">
              <CardDescription>Posts</CardDescription>
              <CardTitle className="text-xl">{numberOfPosts}</CardTitle>
            </CardContent>
          </Card>
        </Link>
        <Link
          className="w-full hover:opacity-75 transition-opacity"
          href={`/publications/${params.slug}/audience`}
        >
          <Card className="w-full">
            <CardContent className="gap-y-2 flex flex-col">
              <CardDescription>Subscribers</CardDescription>
              <CardTitle className="text-xl">{numberOfContacts}</CardTitle>
            </CardContent>
          </Card>
        </Link>
      </div>
    </EditorLayout>
  )
}
