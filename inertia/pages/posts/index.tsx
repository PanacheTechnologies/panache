import he from 'he'
import Post from '#models/post'
import Publication from '#models/publication'
import { Link, Head } from '@inertiajs/react'
import SubscribeToNewsletter from '~/components/subscribe-to-newsletter'
import { formatDate } from 'date-fns'
import { cn } from '~/lib/utils'
import { IconArrowRight } from '@tabler/icons-react'
import PublicationFooter from '~/components/publications/publication-footer'
import { buttonVariants } from '~/components/ui/button'
import usePageProps from '~/hooks/use_page_props'

export default function PostsIndex({
  publication,
  posts,
}: {
  publication: Publication
  posts: Post[]
}) {
  return (
    <div>
      <Head>
        <title>{he.encode(publication.title)}</title>
        <meta
          name="description"
          content={he.encode(`Read the latest articles from ${publication.title}`)}
        />
        <meta property="og:title" content={he.encode(publication.title)} />
        <meta
          property="og:description"
          content={he.encode(`Read the latest articles from ${publication.title}`)}
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={he.encode(publication.title)} />
        <meta property="og:url" content={he.encode(publication.url)} />
      </Head>
      <main className="min-h-[calc(100vh-50px)] sm:min-h-[calc(100vh-50px)] max-w-2xl mx-auto px-4 sm:px-0 py-8 sm:py-16 space-y-8">
        <hgroup className="mx-auto flex flex-col items-center gap-1 w-full max-w-xl">
          <h2 className="font-serif text-4xl italic text-center">{publication.title}</h2>
          <p className="text-base text-center text-neutral-700">Read our latest articles.</p>
        </hgroup>
        <hr className="border-neutral-300 w-full mt-4" />
        <SubscribeToNewsletter
          className="mb-8"
          publicationId={publication.id}
          publicationSlug={publication.slug}
        />

        <PostsGrid posts={posts} />
      </main>
      <PublicationFooter publicationTitle={publication.title} showPanacheAttribution />
    </div>
  )
}

function PostsGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="mx-auto mt-6 grid max-w-xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  )
}

function PostCard({ post }: { post: Post }) {
  const { publication } = usePageProps<{ publication: Publication }>()
  return (
    <Link
      className="hover:opacity-80 transition-opacity"
      key={post.id}
      href={`/p/${publication.slug}/posts/${post.id}`}
    >
      <article className="flex flex-col items-start justify-between border p-5 rounded-lg">
        <div className="relative w-full">
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt=""
              className="aspect-[16/9] max-h-48 w-full rounded-md bg-neutral-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
            />
          ) : null}
          <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-neutral-900/10" />
        </div>
        <div className="max-w-xl w-full">
          <div className="group relative">
            <h3 className="text-lg text-center mt-1 font-semibold leading-6 text-neutral-900 group-hover:text-neutral-600">
              <span className="absolute inset-0" />
              {post.title}
            </h3>

            <div className="mt-1 gap-y-1 flex flex-col justify-center items-center gap-x-4 text-xs text-neutral-500">
              <time dateTime={post.date} className="text-neutral-500">
                Published on {formatDate(new Date(post.date as unknown as string), 'MMMM d, yyyy')}
              </time>
              {post.author && post.author.fullName && (
                <p className="text-sm text-neutral-700">by {he.encode(post.author.fullName)}</p>
              )}
            </div>

            {post.summary ? (
              <p
                className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-600"
                dangerouslySetInnerHTML={{ __html: post.summary }}
              />
            ) : null}

            <div className="mt-2 flex justify-center">
              <span className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}>
                Read more
                <IconArrowRight className="size-4" />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
