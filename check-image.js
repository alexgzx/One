// 检查 PNG 图像的实际尺寸和内容
const fs = require('fs');
const path = require('path');

const pngPath = path.join(__dirname, 'one.png');
const buffer = fs.readFileSync(pngPath);

// 读取 PNG 头信息
console.log('PNG 文件大小:', (buffer.length / 1024).toFixed(2), 'KB');

// PNG 文件签名
const signature = buffer.slice(0, 8).toString('hex');
console.log('PNG 签名:', signature);

// 查找 IHDR 块
const ihdrIndex = buffer.indexOf('IHDR');
if (ihdrIndex > 0) {
  const width = buffer.readUInt32BE(ihdrIndex + 4);
  const height = buffer.readUInt32BE(ihdrIndex + 8);
  console.log('图像尺寸:', width + 'x' + height);
}

// 看看文件是不是 SVG 伪装的
const first100 = buffer.slice(0, 100).toString('utf8', 0, 100);
if (first100.includes('<svg') || first100.includes('<?xml')) {
  console.log('\n⚠️  注意：这个 .png 文件实际上是 SVG 格式！');
  console.log('文件开头内容:', first100);
} else {
  console.log('文件确实是 PNG 二进制格式');
}
