const { admin, db } = require('../util/Admin')
const firebase = require('firebase')
const firebaseConfig = require('../util/FirebaseConfig')
const { validateSignUpData, validateLoginData } = require('../util/Validators')

firebase.initializeApp(firebaseConfig)

exports.signUp = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  }
  const { valid, errors } = validateSignUpData(newUser)

  if (!valid) return res.status(400).json(errors)

  const noImg = 'no-img.png'

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
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
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
}

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  }
  const { valid, errors } = validateLoginData(user)

  if (!valid) return res.status(400).json(errors)

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {return data.user.getIdToken()})
    .then(token => {return res.json({ token })})
    .catch(err => {
      console.error(err)

      if (err.code === 'auth/wrong-password') return res.status(403).json({ general: 'Wrong credentials, please try again'})
      else return res.status(500).json({ err: err.code })
    })
}

exports.uploadImage = (req, res) => {
  const BusBoy = require('busboy')
  const path = require('path')
  const os = require('os')
  const fs = require('fs')

  const busBoy = new BusBoy({ headers: req.headers })
  let imageToBeUploaded = {}
  let imageFileName;
  busBoy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    console.log(fieldname, file, filename, encoding, mimetype);

    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') return res.status(400).json({ error: 'Wrong file type submitted' });

    const imageExtension = filename.split('.')[filename.split('.').length - 1]
    imageFileName = `${Math.round(Math.random() * 100000000000)}.${imageExtension}`
    const filepath = path.join(os.tmpdir(), imageFileName)
    imageToBeUploaded = { filepath, mimetype}
    file.pipe(fs.createWriteStream(filepath))
  })
  busBoy.on('error', err => { console.log(`busboy error: ${err}`) })
  busBoy.on('finish', () => {
    admin
      .storage()
      .bucket(firebaseConfig.storageBucket)
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`
        return db
          .doc(`/users/${req.user.handle}`)
          .update({ imageUrl })
      })
      .then(() => { return res.json({ message: 'image uploaded successfully' })})
      .catch(err => {
        console.error(err)
        return res.status(500).json({ error: err.code })
      })
  })
  busBoy.end(req.rawBody)
}
