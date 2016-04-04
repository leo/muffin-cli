const router = require('koa-router')()
const load = require('../../get')

function singular (type) {
  return type.substring(0, type.length - 1)
}

router.get('/:type', function *(next) {
  const type = this.params.type

  this.body = {
    data: yield load.all(singular(type))
  }

  yield next
})

router.get('/(.*)/:id', function *(next) {
  const type = this.req.url.split('/')[2]

  this.body = {
    data: yield load.one(singular(type), this.params.id)
  }

  yield next
})

module.exports = router
