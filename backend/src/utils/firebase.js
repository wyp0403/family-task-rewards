const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// 处理私钥格式
let privateKey;
try {
  // 尝试解析JSON格式的私钥（如果是JSON字符串）
  if (process.env.FIREBASE_PRIVATE_KEY.startsWith('{')) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_PRIVATE_KEY);
    privateKey = serviceAccount.privateKey;
  } else {
    // 否则直接使用环境变量中的私钥，并替换转义的换行符
    privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  }
} catch (error) {
  console.error('处理Firebase私钥时出错:', error);
  privateKey = process.env.FIREBASE_PRIVATE_KEY;
}

// 初始化Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: privateKey,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
  console.log('Firebase初始化成功');
} catch (error) {
  console.error('Firebase初始化失败:', error);
  // 打印更详细的错误信息以便调试
  console.error('项目ID:', process.env.FIREBASE_PROJECT_ID);
  console.error('客户端邮箱:', process.env.FIREBASE_CLIENT_EMAIL);
  console.error('私钥长度:', privateKey ? privateKey.length : 0);
}

// 获取Firestore实例
let db;
try {
  db = admin.firestore();
} catch (error) {
  console.error('获取Firestore实例失败:', error);
}

module.exports = { admin, db };