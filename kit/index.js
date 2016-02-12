const app = require('muffin')
const router = app.router

router.get('/', function *(next) {
  yield next
})

app.run(router, {
  render: {
    defaultLayout: 'default'
  }
})
