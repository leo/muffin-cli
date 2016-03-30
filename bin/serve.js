#!/usr/bin/env node

const koa = require('koa')
const program = require('commander')

const serve = require('koa-static')
const mount = require('koa-mount')
const compress = require('koa-compress')
const handlebars = require('koa-handlebars')
const router = require('koa-router')()
const sendfile = require('koa-sendfile')
const bodyParser = require('koa-body')
const jwt = require('koa-jwt')

const db = require('../lib/db')
const helpers = require('../lib/helpers')
const log = require('../lib/log')

const app = koa()
const rope = db.rope

program
  .option('-p, --port <port>', 'The port on which your site will be available')
  .parse(process.argv)

process.on('SIGINT', () => rope.close(() => {
  process.exit(0)
}))

app.use(compress())

router.use('/api', jwt({
  secret: process.env.SESSION_SECRET
}).unless({
  path: [/token-auth/, /token-refresh/, /reset-password/]
}))

router.use(bodyParser({
  multipart: true
}))

function getRoutes (path) {
  // Retrieve routes from passed path
  return require('../lib/routes/' + path).routes()
}

// Register media routes and API
router.use('/uploads*', getRoutes('uploads'))
router.use('/api', getRoutes('api'))

// Serve assets of admin area...
app.use(mount('/admin', serve(__dirname + '/../dist')))

// ...and the Ember app
router.get('/admin*', function *() {
  yield* sendfile.call(this, __dirname + '/../dist/index.html')
  if (!this.status) this.throw(404)
})

// Serve frontend assets
app.use(mount('/assets', serve(process.cwd() + '/dist')))

router.get('/login', function *(next) {
  yield next
  this.redirect('/admin/login')
})

// Log HTTP requests to console
app.use(function *(next){
  var start = new Date
  yield next
  var ms = new Date - start

  if (this.url.split('/')[1] == 'api') {
    return
  }

  console.log('%s %s - %s', this.method, this.url, ms)
})

const frontRouter = require('../lib/routes/front')

// Enable new instance of rendering engine for front
frontRouter.use(handlebars({
  cache: app.env !== 'development',
  root: process.cwd() + '/views',
  layoutsDir: '../layouts',
  viewsDir: '/',
  defaultLayout: 'default',
  helpers
}))

// Register front routes
router.use('/', frontRouter.routes())

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(program.port || process.env.PORT, function () {
  const port = this.address().port
  const url = 'http://localhost:' + port

  console.log('Muffin is running: ' + url)
})
