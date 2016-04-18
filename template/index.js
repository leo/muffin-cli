import EventEmitter from 'events'
const emitter = new EventEmitter()

emitter.on('listening', (host, port) => {
  // This code will be executed after muffin started running
})

export default emitter
