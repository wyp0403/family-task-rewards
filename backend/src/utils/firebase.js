const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// 初始化Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
  console.log('Firebase初始化成功');
} catch (error) {
  console.error('Firebase初始化失败:', error);
}

// 获取Firestore实例
const db = admin.firestore();

module.exports = { admin, db };