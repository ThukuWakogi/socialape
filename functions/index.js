const functions = require('firebase-functions')
const admin = require('firebase-admin')
const firebase = require('firebase')
const app = require('express')()
var serviceAccount = require('./firebase-adminsdk.json')

const firebaseConfig = {
  apiKey: "AIzaSyBjs37cc8an5SuFP9iMSXPnryE7xHRPHOc",
  authDomain: "socialape-b8fd6.firebaseapp.com",
  databaseURL: "https://socialape-b8fd6.firebaseio.com",
  projectId: "socialape-b8fd6",
  storageBucket: "socialape-b8fd6.appspot.com",
  messagingSenderId: "558884159218",
  appId: "1:558884159218:web:0fcf1d7c21b31df1"
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://socialape-b8fd6.firebaseio.com"
})
firebase.initializeApp(firebaseConfig)
const db = admin.firestore()

app.get('/screams', (req, res) => {
  db
    .collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let screams = []
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        })
      })
      return res.json(screams)
    })
    .catch(err => console.error(err))
})

app.post('/scream', (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  }

  db
    .collection('screams')
    .add(newScream)
    .then(doc => { res.json({ message: `document ${doc.id} created successfully` })})
    .catch(err => { 
      res.status(500).json({ error: 'something went wrong' })
      console.error(err)
    })
})

app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  }

  // TODO: validate data
  let token, userId;
  db
    .doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) return res.status(400).json({ handle: 'this handle is already taken' })
      else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    .then(data => {
      userId = data.user.uid
      return data.user.getIdToken()
    })
    .then(idToken => {
      token = idToken
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      }
      return db.doc(`/users/${newUser.handle}`).set(userCredentials)
    })
    .then(() => { return res.status(201).json({ token }) })
    .catch(err => {
      console.error(err)

      if (err.code === 'auth/email-already-in-use') return res.status(400).json({ email: 'The email address is already in use by another account.' })
      else return res.status(500).json({ error: err.code })
    })
})

exports.api = functions.region('europe-west1').https.onRequest(app)
