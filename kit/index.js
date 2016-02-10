const app = require('muffin')
const router = app.router

router.get('/', function *(next) {
  console.log('Requested home')
  yield next
})

app.run(router, {
  render: {
    defaultLayout: 'default'
  }
})
