import mongoose from 'mongoose'
import { log } from './utils'

const dbHost = process.env.DB_HOST || 'localhost'
const dbName = process.env.DB_NAME || 'muffin'

// Connect to DB using the credentials set in the ".env" file
mongoose.connect('mongodb://' + dbHost + '/' + dbName, {
  user: process.env.DB_USER,
  pass: process.env.DB_PASSWORD
})

const connection = mongoose.connection

connection.on('error', function (info) {
  if (info.message.includes('ECONNREFUSED')) {
    info.message = 'Please make sure it\'s running and accessible!'
  }

  log('Couldn\'t connect to DB: ' + info.message)
  process.exit(1)
})

process.on('SIGINT', () => connection.close(() => {
  process.exit(0)
}))

export default connection
