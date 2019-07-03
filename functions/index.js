const functions = require('firebase-functions')
const app = require('express')()
const { getAllScreams, postOneScream } = require('./handlers/Screams')
const { signUp, login } = require('./handlers/Users')
const FireBaseAuth = require('./util/FirebaseAuth')

app.get('/screams', getAllScreams)
app.post('/scream', FireBaseAuth, postOneScream)
app.post('/signup', signUp)
app.post('/login', login)

exports.api = functions.region('europe-west1').https.onRequest(app)
