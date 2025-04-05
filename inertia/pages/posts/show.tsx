import he from 'he'
import Post from '#models/post'
import Publication from '#models/publication'
import SubscribeToNewsletter from '~/components/subscribe-to-newsletter'
import { formatDate } from 'date-fns'
import { Link } from '@inertiajs/react'
import { IconArrowLeft } from '@tabler/icons-react'
import { Head } from '@inertiajs/react'
import PublicationFooter from '~/components/publications/publication-footer'

export default function PostsShow({ publication, post }: { publication: Publication; post: Post }) {
  return (
    <>
      <Head>
        <title>{he.encode(post.title)}</title>
        <meta name="description" content={he.encode(post.summary)} />
        {post.author && post.author.fullName && (
          <meta name="author" content={he.encode(post.author.fullName)} />
        )}
        <meta name="date" content={post.date} />

        {/* Open Graph */}
        <meta property="og:title" content={he.encode(post.title)} />
        <meta property="og:description" content={he.encode(post.summary)} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${he.encode(publication.url)}/posts/${post.id}`} />
        <meta property="og:site_name" content={he.encode(publication.title)} />
        {post.imageUrl && <meta property="og:image" content={post.imageUrl} />}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={he.encode(post.title)} />
        <meta name="twitter:description" content={he.encode(post.summary)} />
        {post.imageUrl && <meta name="twitter:image" content={post.imageUrl} />}
      </Head>
      <div>
        <main className="min-h-[calc(100vh-50px)] sm:min-h-[calc(100vh-50px)] flex flex-col justify-between max-w-2xl mx-auto px-4 sm:px-0 py-8 sm:py-16 space-y-8">
          <div>
            <header>
              <div className="flex justify-center items-center mb-2">
                <Link
                  href={`/p/${publication.slug}`}
                  className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  <IconArrowLeft className="size-4 mr-2" />
                  Back to posts
                </Link>
              </div>

              <hgroup className="mx-auto flex flex-col items-center gap-1 w-full max-w-xl">
                <h2 className="font-serif text-4xl italic text-center">{he.encode(post.title)}</h2>
                <p className="text-base text-center text-neutral-700">
                  Published on{' '}
                  {formatDate(new Date(post.date as unknown as string), 'MMMM d, yyyy')}
                </p>
                {post.author && post.author.fullName && (
                  <p className="text-sm text-neutral-700">by {he.encode(post.author.fullName)}</p>
                )}
              </hgroup>

              <hr className="border-neutral-300 w-full mt-4" />
            </header>
            <div className="mt-4" dangerouslySetInnerHTML={{ __html: post.html }} />
          </div>

          <SubscribeToNewsletter
            className="mt-auto"
            publicationId={publication.id}
            publicationSlug={he.encode(publication.slug)}
          />
        </main>
        <PublicationFooter publicationTitle={he.encode(publication.title)} showPanacheAttribution />
      </div>
    </>
  )
}
