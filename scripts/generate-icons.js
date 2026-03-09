const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateIcons() {
  const inputPath = path.join(__dirname, '../assets/icon-source.png');
  const outputDir = path.join(__dirname, '../assets');
  const publicDir = path.join(__dirname, '../public');

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('Generating PWA icons from new logo...');

  // Read the source image
  const sourceBuffer = fs.readFileSync(inputPath);
  const metadata = await sharp(sourceBuffer).metadata();
  console.log(`Source image: ${metadata.width}x${metadata.height}`);

  // Generate main 512x512 icon
  const mainIcon = await sharp(sourceBuffer)
    .resize(512, 512, { fit: 'cover' })
    .png()
    .toBuffer();

  // Save main icons
  await sharp(mainIcon).toFile(path.join(outputDir, 'icon.png'));
  await sharp(mainIcon).toFile(path.join(publicDir, 'icon.png'));
  console.log('icon.png (512x512)');

  // Generate adaptive icon
  await sharp(mainIcon).toFile(path.join(outputDir, 'adaptive-icon.png'));
  await sharp(mainIcon).toFile(path.join(publicDir, 'adaptive-icon.png'));
  console.log('adaptive-icon.png (512x512)');

  // Generate splash icon (1024x1024)
  const splashIcon = await sharp(sourceBuffer)
    .resize(1024, 1024, { fit: 'cover' })
    .png()
    .toBuffer();

  await sharp(splashIcon).toFile(path.join(outputDir, 'splash-icon.png'));
  await sharp(splashIcon).toFile(path.join(publicDir, 'splash-icon.png'));
  console.log('splash-icon.png (1024x1024)');

  // Generate favicon (32x32)
  await sharp(mainIcon)
    .resize(32, 32)
    .toFile(path.join(outputDir, 'favicon.png'));
  await sharp(mainIcon)
    .resize(32, 32)
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('favicon.png (32x32)');

  // Generate different sizes for PWA
  for (const size of [192, 180, 152, 120]) {
    await sharp(mainIcon)
      .resize(size, size)
      .toFile(path.join(publicDir, `icon-${size}.png`));
    console.log(`icon-${size}.png`);
  }

  console.log('\nAll icons generated successfully!');
  console.log(`Assets: ${outputDir}`);
  console.log(`Public: ${publicDir}`);
}

generateIcons().catch(console.error);
