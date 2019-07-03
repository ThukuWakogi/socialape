const admin = require('firebase-admin')
var serviceAccount = require('../firebase-adminsdk.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://socialape-b8fd6.firebaseio.com"
})

const db = admin.firestore()

module.exports = { admin, db }
