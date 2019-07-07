const functions = require('firebase-functions')
const app = require('express')()
const { 
  getAllScreams, 
  postOneScream,
  getScream,
  commentOnScream,
  likeScream,
  unlikeScream,
  deleteScream
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
app.delete('/scream/:screamId', FireBaseAuth, deleteScream)
app.get('/scream/:screamId/like', FireBaseAuth, likeScream)
app.get('/scream/:screamId/unlike', FireBaseAuth, unlikeScream)
app.post('/scream/:screamId/comment', FireBaseAuth, commentOnScream)
app.post('/signup', signUp)
app.post('/login', login)
app.post('/user/image', FireBaseAuth, uploadImage)
app.post('/user', FireBaseAuth, addUserDetails)
app.get('/user', FireBaseAuth, getAuthenticatedUser)

exports.api = functions.region('europe-west1').https.onRequest(app)
