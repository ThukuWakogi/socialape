const functions = require('firebase-functions')
const app = require('express')()
const { db } = require('./util/Admin')
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
  getAuthenticatedUser,
  markNotificationsRead,
  getUserDetails
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
app.get('/user/:handle', getUserDetails)
app.post('/notifications', FireBaseAuth, markNotificationsRead)

exports.api = functions.region('europe-west1').https.onRequest(app)
exports.createNotificationOnLike = functions
  .region('europe-west1')
  .firestore
  .document('likes/{id}')
  .onCreate((snapshot) => {
    db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => { 
        if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) 
          return db
            .doc(`/notifications/${snapshot.id}`)
            .set({
              createdAt: new Date().toISOString(),
              recipient: doc.data().userHandle,
              sender: snapshot.data().userHandle,
              type: 'like',
              read: false,
              screamId: doc.id
            })
      })
      //.then(() => { return })
      .catch(err => {
        console.error(err)
        return
      })
  })
exports.deleteNotificationOnUnlike = functions
  .region('europe-west1')
  .firestore
  .document('likes/{id}')
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(() => { return })
      .catch(err => {
        console.error(err)
        return
      })
  })
exports.createNotificationOnComment = functions
  .region('europe-west1')
  .firestore
  .document('comments/{id}')
  .onCreate((snapshot) => {
    db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => { 
        if (doc.exists) 
          return db
            .doc(`/notifications/${snapshot.id}`)
            .set({
              createdAt: new Date().toISOString(),
              recipient: doc.data().userHandle,
              sender: snapshot.data().userHandle,
              type: 'comment',
              read: false,
              screamId: doc.id
            })
      })
      .then(() => { return })
      .catch(err => {
        console.error(err)
        return
      })
  })
