const router = require('koa-router')()
const jwt = require('koa-jwt')
const User = require('../../models/user')
const log = require('../../utils').log

router.post('/token-auth', function *(next) {
  const body = this.request.body

  if (!body.username || !body.password) {
    this.status = 400
    this.body = {
      error: 'User and/or password empty'
    }
    return
  }

  const query = User.where({ _id: body.username })

  try {
    var user = yield query.findOne()
  } catch (err) {
    log('Couldn\'t load user', err)
  }

  if (!user) {
    this.status = 400
    this.body = {
      error: 'User doesn\'t exist'
    }
    return
  }

  // Compare password with the one within the DB
  const isMatch = user.tryPassword(body.password)

  if (isMatch) {
    const token = jwt.sign(body, process.env.SESSION_SECRET, {
      expiresIn: 300
    })

    this.body = {
      token
    }

    return
  }

  this.status = 400

  this.body = {
    error: 'Wrong password'
  }

  yield next
})

router.post('/token-refresh', function *(next) {
  const token = this.request.body.token

  try {
    const decoded = jwt.verify(token, process.env.SESSION_SECRET)
  } catch (err) {
    this.status = 401
    this.body = { error: err }

    return
  }

  const query = User.where({ _id: decoded.username })

  try {
    var user = yield query.findOne()
  } catch (err) {
    log('Couldn\'t load user', err)
  }

  if (!user) {
    this.status = 401
    this.body = {
      error: 'User doesn\'t exist'
    }

    return
  }

  const isMatch = user.tryPassword(decoded.password)

  if (isMatch) {
    this.body = {
      token: jwt.sign(decoded, process.env.SESSION_SECRET, {
        expiresIn: 300
      })
    }

    return
  }

  this.status = 401

  this.body = {
    error: 'Wrong password'
  }

  yield next
})

module.exports = router
