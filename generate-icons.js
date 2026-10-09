const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Target directory paths
const sourceImage = path.join(__dirname, 'public', 'icons', 'icon-512x512.png'); 
const outputDir = path.join(__dirname, 'public', 'icons');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generatePwaIcons() {
  try {
    console.log('Starting TACS PWA icon batch automation parsing engine...');

    // 1. Standard App Drawer Size (192x192)
    await sharp(sourceImage)
      .resize(192, 192)
      .toFile(path.join(outputDir, 'icon-192x192.png'));
    console.log('✅ Generated: icon-192x192.png');

    // 2. Android Maskable Layer Size (192x192 with 15% safety padding margins)
    await sharp(sourceImage)
      .resize(144, 144) 
      .extend({
        top: 24, bottom: 24, left: 24, right: 24,
        background: { r: 18, g: 18, b: 20, alpha: 1 } 
      })
      .toFile(path.join(outputDir, 'icon-maskable-192x192.png'));
    console.log('✅ Generated: icon-maskable-192x192.png');

    // 3. Android Maskable SplashScreen Size (512x512 with 15% safety padding margins)
    await sharp(sourceImage)
      .resize(384, 384)
      .extend({
        top: 64, bottom: 64, left: 64, right: 64,
        background: { r: 18, g: 18, b: 20, alpha: 1 }
      })
      .toFile(path.join(outputDir, 'icon-maskable-512x512.png'));
    console.log('✅ Generated: icon-maskable-512x512.png');

    console.log('🎉 System success! All matching manifest icon variations are compiled.');
  } catch (error) {
    console.error('❌ Automation script execution halted:', error.message);
    console.log('💡 Note: Ensure your main source image is saved exactly at public/icons/icon-512x512.png before executing this tool.');
  }
}

generatePwaIcons();
