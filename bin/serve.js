#!/usr/bin/env node --use_strict

const koa = require('koa')
const program = require('commander')
const chalk = require('chalk')
const exec = require('child_process').execSync
const enableDestroy = require('server-destroy')
const http = require('http')

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
const utils = require('../lib/utils')
const controller = require('../lib/controller')

const app = koa()
const rope = db.rope

program
  .option('-w, --watch', 'Rebuild site if files change')
  .option('-p, --port <port>', 'The port on which your site will be available', parseInt)
  .parse(process.argv)

if (!utils.isSite()) {
  utils.log(chalk.red('No site in here!'))
  process.exit(1)
}

// Build before serving if "dist" directory doesn't exist
if (!utils.exists(process.cwd() + '/dist')) {
  try {
    exec('muffin build', {stdio: [0, 1]})
  } catch (err) {
    utils.log(err)
    process.exit(1)
  }
}

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

const APIroutes = [
  'content',
  'reset-password',
  'token',
  'upload'
]

// Register media routes and API
router.use('/uploads*', getRoutes('uploads'))

for (let route of APIroutes) {
  router.use('/api', getRoutes('api/' + route))
}

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

  console.log(chalk.blue('[muffin]') + ' %s %s - %sms', this.method, this.url, ms)
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

var server = http.createServer(app.callback())

server.listen(program.port || process.env.PORT, function () {
  const port = this.address().port
  const host = 'localhost'
  const url = 'http://' + host + ':' + port

  console.log(chalk.blue('[muffin]') + ' ' + 'Running at ' + chalk.grey(url))
  controller.emit('listening', host, port)

  process.stdin.resume()
  process.stdin.setEncoding('utf8')
  enableDestroy(server)

  process.stdin.on('data', data => {
    data = (data + '').trim().toLowerCase()

    if (data === 'rs') {
      server.destroy()

      server = http.createServer(app.callback())

      server.listen(program.port || process.env.PORT, () => {
        enableDestroy(server)
        utils.log(chalk.green('Restarted!'))
      })
    }
  })
})
