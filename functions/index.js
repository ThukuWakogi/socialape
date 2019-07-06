const functions = require('firebase-functions')
const app = require('express')()
const { 
  getAllScreams, 
  postOneScream 
} = require('./handlers/Screams')
const { 
  signUp, 
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser
} = require('./handlers/Users')
const FireBaseAuth = require('./util/FirebaseAuth')

app.get('/screams', getAllScreams)
app.post('/scream', FireBaseAuth, postOneScream)
app.post('/signup', signUp)
app.post('/login', login)
app.post('/user/image', FireBaseAuth, uploadImage)
app.post('/user', FireBaseAuth, addUserDetails)
app.get('/user', FireBaseAuth, getAuthenticatedUser)

exports.api = functions.region('europe-west1').https.onRequest(app)
