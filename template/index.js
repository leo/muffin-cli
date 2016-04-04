export function onListen() {
  const port = this.address().port
  const url = 'http://localhost:' + port

  console.log('Muffin is running: ' + url)
}
