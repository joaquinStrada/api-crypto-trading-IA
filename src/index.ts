import '@babel/polyfill'
import { createConnection } from './database'
import app from './app'

createConnection()
app.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'))
})