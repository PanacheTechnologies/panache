import router from '@adonisjs/core/services/router'

const PublicationController = () => import('#controllers/publication_controller')

router.get('/p/:slug', [PublicationController, 'listPosts']).as('listPosts')
router.get('/p/:slug/posts/:id', [PublicationController, 'showPost'])
router.post('/p/:slug/subscribe', [PublicationController, 'subscribe'])
