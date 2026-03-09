const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const BACKGROUND_COLOR = '#1e3a8a'; // Azul oscuro
const BACKGROUND_RGB = { r: 30, g: 58, b: 138 };
const SIZES = [512, 192, 180, 152, 120, 96, 72, 48];

// Colors to replace (checkerboard pattern - light and dark gray)
const CHECKER_COLORS = [
  { r: 204, g: 204, b: 204 }, // Light gray
  { r: 255, g: 255, b: 255 }, // White
  { r: 238, g: 238, b: 238 }, // Very light gray
  { r: 221, g: 221, b: 221 }, // Light gray variant
  { r: 192, g: 192, b: 192 }, // Silver
  { r: 170, g: 170, b: 170 }, // Medium gray
  { r: 153, g: 153, b: 153 }, // Gray
  { r: 128, g: 128, b: 128 }, // Dark gray
];

function isCheckerColor(r, g, b) {
  // Check if color is grayscale (dark or light)
  const isGray = Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && Math.abs(r - b) < 30;
  // Include darker grays too (the checkerboard pattern in this image is dark)
  const inRange = (r > 30 && r < 260) && (g > 30 && g < 260) && (b > 30 && b < 260);
  // Also check for the specific dark purple/blue-gray of the checkerboard
  const isDarkChecker = (r > 40 && r < 100) && (g > 40 && g < 100) && (b > 50 && b < 120);
  return (isGray && inRange) || isDarkChecker;
}

async function replaceCheckerboard(inputBuffer) {
  const { data, info } = await sharp(inputBuffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data);

  for (let i = 0; i < pixels.length; i += info.channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = info.channels === 4 ? pixels[i + 3] : 255;

    // Replace checkerboard colors with background
    if (isCheckerColor(r, g, b)) {
      pixels[i] = BACKGROUND_RGB.r;
      pixels[i + 1] = BACKGROUND_RGB.g;
      pixels[i + 2] = BACKGROUND_RGB.b;
      if (info.channels === 4) pixels[i + 3] = 255;
    }
  }

  return sharp(pixels, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  }).png().toBuffer();
}

async function generateIcons() {
  const inputPath = path.join(__dirname, '../assets/icon.png');
  const outputDir = path.join(__dirname, '../assets');
  const publicDir = path.join(__dirname, '../public');

  console.log('🎨 Generating PWA icons...');
  console.log('🔧 Removing checkerboard pattern...');

  // Clean the checkerboard pattern first
  const originalBuffer = fs.readFileSync(inputPath);
  const cleanedBuffer = await replaceCheckerboard(originalBuffer);

  // Get cleaned image metadata
  const metadata = await sharp(cleanedBuffer).metadata();
  console.log(`📐 Cleaned size: ${metadata.width}x${metadata.height}`);

  // Create square icon with background
  const squareSize = 512;
  const padding = 40; // Padding around the logo

  // Calculate scale to fit logo in square with padding
  const availableSize = squareSize - (padding * 2);
  const scale = Math.min(
    availableSize / metadata.width,
    availableSize / metadata.height
  );

  const newWidth = Math.round(metadata.width * scale);
  const newHeight = Math.round(metadata.height * scale);

  // Create the main 512x512 icon
  // First, flatten the logo with the background color to remove transparency
  const flattenedLogo = await sharp(cleanedBuffer)
    .resize(newWidth, newHeight, { fit: 'inside' })
    .flatten({ background: BACKGROUND_COLOR })
    .toBuffer();

  const mainIcon = await sharp({
    create: {
      width: squareSize,
      height: squareSize,
      channels: 4,
      background: BACKGROUND_COLOR
    }
  })
  .composite([{
    input: flattenedLogo,
    gravity: 'center'
  }])
  .png()
  .toBuffer();

  // Save main icon
  await sharp(mainIcon).toFile(path.join(outputDir, 'icon.png'));
  await sharp(mainIcon).toFile(path.join(publicDir, 'icon.png'));
  console.log('✅ icon.png (512x512)');

  // Generate adaptive icon (same as icon for now)
  await sharp(mainIcon).toFile(path.join(outputDir, 'adaptive-icon.png'));
  await sharp(mainIcon).toFile(path.join(publicDir, 'adaptive-icon.png'));
  console.log('✅ adaptive-icon.png (512x512)');

  // Generate splash icon (larger, 1024x1024)
  const flattenedSplash = await sharp(cleanedBuffer)
    .resize(Math.round(newWidth * 2), Math.round(newHeight * 2), { fit: 'inside' })
    .flatten({ background: BACKGROUND_COLOR })
    .toBuffer();

  const splashIcon = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: BACKGROUND_COLOR
    }
  })
  .composite([{
    input: flattenedSplash,
    gravity: 'center'
  }])
  .png()
  .toBuffer();

  await sharp(splashIcon).toFile(path.join(outputDir, 'splash-icon.png'));
  await sharp(splashIcon).toFile(path.join(publicDir, 'splash-icon.png'));
  console.log('✅ splash-icon.png (1024x1024)');

  // Generate favicon (small version)
  await sharp(mainIcon)
    .resize(32, 32)
    .toFile(path.join(outputDir, 'favicon.png'));
  await sharp(mainIcon)
    .resize(32, 32)
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✅ favicon.png (32x32)');

  // Generate different sizes for PWA
  for (const size of [192, 180, 152, 120]) {
    await sharp(mainIcon)
      .resize(size, size)
      .toFile(path.join(publicDir, `icon-${size}.png`));
    console.log(`✅ icon-${size}.png`);
  }

  console.log('\n🎉 All icons generated successfully!');
  console.log(`📁 Output: ${outputDir}`);
  console.log(`📁 Public: ${publicDir}`);
}

generateIcons().catch(console.error);
