const app = require('koa')()
const open = require('open')

const handlebars = require('koa-handlebars')
const session = require('koa-generic-session')
const bodyParser = require('koa-body')
const compress = require('koa-compress')
const router = require('koa-router')()
const mongoStore = require('koa-session-mongoose')
const serve = require('koa-static')
const mount = require('koa-mount')

const db = require('./lib/db')
const helpers = require('./lib/helpers')
const log = require('./lib/etc').log

app.use(compress())

if (app.env === 'development' && !module.parent) {
  app.use(require('koa-livereload')({
    port: 35800
  }))
}

process.on('uncaughtException', err => {
  if (err.errno === 'EADDRINUSE') {
    return log('Port already in use')
  }

  log(err)
})

if (module.parent) {
  require('dotenv').config({
    path: process.cwd() + '/.env'
  })
} else {
  // This is fine since it's only being used in the development env
  process.env.SESSION_SECRET = 'random'
}

const rope = db.rope

process.on('SIGINT', () => {
  rope.close(() => {
    process.exit(0)
  })
})

app.keys = [process.env.SESSION_SECRET]

app.use(session({
  key: 'muffin.sess',
  prefix: 'muffin:sess:',
  cookie: {
    // Kill client part of session when user closes browser
    maxage: null
  },
  store: mongoStore.create(),
  connection: rope,
  // Kill DB part of session after one day if not updated
  rolling: true,
  ttl: 86400000
}))

router.use(bodyParser({
  multipart: true
}))

var globals = {}

const menuItems = [
  'Dashboard',
  'Pages',
  'Users',
  'Media',
  'Logout'
]

const specialURLs = {
  'logout': '../logout',
  'dashboard': '.'
}

globals.menuItems = []

for (var handle of menuItems) {
  var slug = handle.toLowerCase()

  globals.menuItems.push({
    url: specialURLs[slug] || slug,
    title: handle
  })
}

globals.appVersion = require('./package.json').version

app.use(handlebars({
  defaultLayout: 'main',
  cache: app.env !== 'development',
  helpers: helpers.admin,
  root: __dirname + '/views',
  viewsDir: '/',
  data: globals
}))

router.all('/admin*', function *(next) {
  if (this.session.loggedIn || this.request.method === 'GET') {
    yield next
  } else {
    this.response.body('Sorry, but I can\'t let you in.')
  }
})

router.get('/admin*', function *(next) {
  const url = this.request.url
  var to

  // Check if request wants a file. If so, let it through.
  if (url.match(/[^\\/]+\.[^\\/]+$/)) {
    yield next
  }

  if (this.session.loggedIn) {
    yield next
  } else {
    const original = this.request.originalUrl

    switch (original) {
      case '/admin':
      case '/admin/':
        to = ''
        break

      default:
        to = '/?to=' + encodeURIComponent(original.replace('/admin/', ''))
    }

    this.response.redirect('/login' + to)
  }
})

app.use(mount('/assets', serve('./dist')))
app.use(mount('/admin/assets', serve(__dirname + '/dist')))

function getRoutes (path) {
  return require('./lib/routes/' + path).routes()
}

router.get('/logout', function *(next) {
  this.session = null
  this.response.redirect('/login')

  yield next
})

router.use('/login', getRoutes('login'))
router.use('/uploads*', getRoutes('uploads'))

router.use('/admin', getRoutes('dashboard'))
router.use('/admin/pages', getRoutes('pages'))
router.use('/admin/users', getRoutes('users'))
router.use('/admin/media', getRoutes('media'))

// Tell kit where to find router for outer routes
app.router = require('./lib/routes/front')

function listening () {
  const port = this.address().port
  const path = module.parent ? '' : '/admin'
  const url = 'http://localhost:' + port + path

  console.log('Muffin is running at ' + url)

  if (!process.env.restarted) {
    open(url)
    process.env.restarted = false
  }
}

var hbsConfig = {
  cache: app.env !== 'development',
  root: process.cwd() + '/views',
  layoutsDir: '../layouts',
  viewsDir: '/',
  defaultLayout: 'default',
  helpers: helpers.front
}

app.run = (front, config) => {
  // Allow kit to overwrite template options
  if (config && config.render) {
    Object.assign(hbsConfig, config.render)
  }

  // Require outer routes if run from kit
  if (front) {
    front.use(handlebars(hbsConfig))
    router.use('/', front.routes())
  }

  app.use(router.routes())
  app.use(router.allowedMethods())

  app.listen(5000, listening)
}

if (!module.parent) app.run()
module.exports = app
