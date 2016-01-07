var config = require('./config')
var app = require('muffin')(config)

app.setRenderingEngine = function (old) {
  return 'jade'
}
