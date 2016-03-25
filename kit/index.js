const app = require('muffin')
const router = app.router

router.get('/', function *(next) {
  console.log('Visited the front page!')
  yield next
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(2000)
