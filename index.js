const config = require('./config')
const app = require('muffin')(config)

app.setRenderingEngine = function (old) {
  return 'jade'
}
