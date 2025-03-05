const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// 详细记录环境变量状态（不记录敏感内容）
console.log('Firebase 配置检查:');
console.log('- FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '已设置' : '未设置');
console.log('- FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '已设置' : '未设置');
console.log('- FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? `已设置 (长度: ${process.env.FIREBASE_PRIVATE_KEY.length})` : '未设置');
console.log('- FIREBASE_SERVICE_ACCOUNT_JSON:', process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? `已设置 (长度: ${process.env.FIREBASE_SERVICE_ACCOUNT_JSON.length})` : '未设置');

// 初始化变量
let admin_app = null;
let firestore_db = null;

// 尝试初始化 Firebase
try {
  // 优先使用完整的服务账号 JSON
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    console.log('使用 FIREBASE_SERVICE_ACCOUNT_JSON 初始化...');
    
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin_app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('使用 FIREBASE_SERVICE_ACCOUNT_JSON 初始化成功');
    } catch (parseError) {
      console.error('解析 FIREBASE_SERVICE_ACCOUNT_JSON 失败:', parseError);
      throw new Error('无法解析服务账号 JSON');
    }
  }
  // 使用单独的环境变量
  else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    console.log('使用单独的环境变量初始化...');
    
    // 尝试解析私钥
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    // 如果私钥不包含 BEGIN PRIVATE KEY，可能需要进一步处理
    if (!privateKey.includes('BEGIN PRIVATE KEY')) {
      console.log('私钥不包含 BEGIN PRIVATE KEY，尝试进一步处理...');
      
      // 如果私钥被引号包围，去除引号
      if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || 
          (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
        privateKey = privateKey.slice(1, -1);
        console.log('已去除私钥周围的引号');
      }
      
      // 替换转义的换行符
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
        console.log('已替换私钥中的转义换行符');
      }
    }
    
    // 检查处理后的私钥
    if (!privateKey.includes('BEGIN PRIVATE KEY')) {
      console.error('警告: 处理后的私钥仍然不包含 "BEGIN PRIVATE KEY"');
      console.error('这可能不是有效的私钥格式');
      throw new Error('私钥格式无效，必须是有效的 PEM 格式');
    }
    
    admin_app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      })
    });
    console.log('使用单独的环境变量初始化成功');
  } 
  // 无法初始化
  else {
    throw new Error('缺少必要的 Firebase 配置环境变量');
  }
  
  // 初始化 Firestore
  if (admin_app) {
    firestore_db = admin_app.firestore();
    console.log('Firestore 初始化成功');
  }
} catch (error) {
  console.error('Firebase 初始化失败:', error);
}

// 导出 Firebase 对象
module.exports = { 
  admin: admin_app, 
  db: firestore_db 
};