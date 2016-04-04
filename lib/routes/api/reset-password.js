const router = require('koa-router')()
const queryString = require('query-string')
const User = require('../../models/user')
const log = require('../../utils').log

router.get('/reset-password', function *(next) {
  const queries = queryString.extract(this.request.originalUrl)
  const _id = queryString.parse(queries).name

  if (!_id) {
    this.body = {
      error: 'No username'
    }

    return
  }

  const query = User.where({ _id })

  try {
    var user = yield query.findOne()
  } catch (err) {
    log('Couldn\'t load user', err)
  }

  if (!user) {
    this.body = {
      error: 'User doesn\'t exist'
    }

    return
  }

  console.log(_id)

  this.body = {
    success: 'LOL'
  }
})

module.exports = router
