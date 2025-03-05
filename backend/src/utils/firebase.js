const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// 详细记录环境变量状态（不记录敏感内容）
console.log('Firebase 配置检查:');
console.log('- FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '已设置' : '未设置');
console.log('- FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '已设置' : '未设置');
console.log('- FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? `已设置 (长度: ${process.env.FIREBASE_PRIVATE_KEY.length})` : '未设置');
console.log('- FIREBASE_SERVICE_ACCOUNT_JSON:', process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? '已设置' : '未设置');
console.log('- FIREBASE_PRIVATE_KEY_BASE64:', process.env.FIREBASE_PRIVATE_KEY_BASE64 ? '已设置' : '未设置');

// 初始化变量
let admin_app = null;
let firestore_db = null;

// 尝试多种方式初始化 Firebase
try {
  // 方法 1: 使用完整的服务账号 JSON
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    console.log('尝试使用 FIREBASE_SERVICE_ACCOUNT_JSON 初始化...');
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin_app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('使用 FIREBASE_SERVICE_ACCOUNT_JSON 初始化成功');
  }
  // 方法 2: 使用 Base64 编码的私钥
  else if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
    console.log('尝试使用 FIREBASE_PRIVATE_KEY_BASE64 初始化...');
    const privateKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf8');
    admin_app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      })
    });
    console.log('使用 FIREBASE_PRIVATE_KEY_BASE64 初始化成功');
  }
  // 方法 3: 使用标准环境变量，处理私钥格式
  else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    console.log('尝试使用标准环境变量初始化...');
    
    // 处理私钥格式
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    // 检查私钥格式
    if (privateKey.includes('\\n')) {
      console.log('私钥包含转义的换行符，进行替换');
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    // 如果私钥被引号包围，去除引号
    if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || 
        (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
      console.log('私钥被引号包围，去除引号');
      privateKey = privateKey.slice(1, -1);
    }
    
    // 检查私钥是否包含 BEGIN PRIVATE KEY
    if (!privateKey.includes('BEGIN PRIVATE KEY')) {
      console.log('警告: 私钥可能格式不正确，不包含 "BEGIN PRIVATE KEY"');
    }
    
    admin_app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      })
    });
    console.log('使用标准环境变量初始化成功');
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
  
  // 详细记录错误信息
  if (error.code === 'app/invalid-credential') {
    console.error('凭据无效。请检查项目 ID、客户端邮箱和私钥格式。');
    
    // 尝试打印私钥的一部分（不泄露完整内容）
    if (process.env.FIREBASE_PRIVATE_KEY) {
      const keyPreview = process.env.FIREBASE_PRIVATE_KEY.substring(0, 20) + '...';
      console.error('私钥预览:', keyPreview);
      console.error('私钥是否包含 "BEGIN PRIVATE KEY":', process.env.FIREBASE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY'));
      console.error('私钥是否包含 "\\n":', process.env.FIREBASE_PRIVATE_KEY.includes('\\n'));
    }
  }
}

// 导出 Firebase 对象
// 即使初始化失败，也导出 null 值，让应用可以优雅地处理错误
module.exports = { 
  admin: admin_app, 
  db: firestore_db 
};