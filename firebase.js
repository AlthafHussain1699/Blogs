
const admin = require('firebase-admin');
require('dotenv').config();
const serviceAccount = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
    privateKey: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
};


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'blogs-97029.appspot.com'
});

const bucket = admin.storage().bucket(); 
module.exports = bucket;
