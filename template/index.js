const app = require('muffin')
const convert = require('koa-convert')

const router = app.router

router.get('/', convert(function *(next) {
  // console.log('Home visited!')
  yield next
}))

app.run(router)
