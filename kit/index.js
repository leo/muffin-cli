const app = require('muffin')
const router = app.router

router.get('/', function *() {
  yield this.render('index')
})

app.run(router)
