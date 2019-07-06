const functions = require('firebase-functions')
const app = require('express')()
const { 
  getAllScreams, 
  postOneScream,
  getScream,
  commentOnScream
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
app.get('/scream/:screamId', getScream)
// TODO: delete scream
// TODO: like a scream
// TODO: unlike a scream
app.post('/scream/:screamId/comment', FireBaseAuth, commentOnScream)
app.post('/signup', signUp)
app.post('/login', login)
app.post('/user/image', FireBaseAuth, uploadImage)
app.post('/user', FireBaseAuth, addUserDetails)
app.get('/user', FireBaseAuth, getAuthenticatedUser)

exports.api = functions.region('europe-west1').https.onRequest(app)
