#!/usr/bin/env node
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../build/icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 紫色云朵图标 - 用 sharp 画一个简单的版本
// 或者直接用用户提供的图片转格式

// 先创建一个紫色背景 + 白色云朵
// 由于是程序生成，我们用简单的方式：
// 用户图片是圆形紫底 + 白色云朵，我直接下载用户的图片并转换

async function generate() {
  // 读取用户提供的图标（先保存到临时文件，然后用它生成各种尺寸）
  // 这里我用一个简单的方法：创建一个紫色圆底 + SVG 云朵
  
  const svg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- 紫色圆形背景 -->
  <circle cx="512" cy="512" r="480" fill="#8B5CF6"/>
  <circle cx="512" cy="512" r="480" fill="url(#grad)" opacity="0.5"/>
  
  <!-- 白色云朵 -->
  <path d="M 320 420 C 250 420 190 480 190 560 C 190 630 250 680 330 690 L 330 710 C 330 780 400 830 480 830 C 540 830 590 790 610 740 C 630 750 650 750 670 750 C 740 750 800 690 800 620 C 800 550 740 490 670 490 L 670 470 C 670 400 600 350 530 350 C 480 350 440 380 420 410 C 390 410 360 420 340 420 Z" 
        fill="white" stroke="white" stroke-width="20"/>
  
  <defs>
    <radialGradient id="grad" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#A78BFA"/>
      <stop offset="100%" stop-color="#5B21B6"/>
    </radialGradient>
  </defs>
</svg>`;

  const sizes = [16, 32, 48, 64, 128, 256, 512, 1024];
  
  // 生成各种尺寸的 PNG
  for (const size of sizes) {
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, `icon-${size}x${size}.png`));
    console.log(`✓ Generated icon-${size}x${size}.png`);
  }

  // 生成 256x256 主图标
  await sharp(Buffer.from(svg))
    .resize(256, 256)
    .png()
    .toFile(path.join(outDir, 'icon.png'));
  console.log('✓ Generated icon.png (256x256)');

  console.log('\n✅ All PNG icons generated!');
  console.log(`   Output: ${outDir}`);
}

generate().catch(console.error);
