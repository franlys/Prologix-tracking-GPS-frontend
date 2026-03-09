#!/usr/bin/env node

/**
 * Script para copiar archivos de public/ a dist/ despues del build de Expo
 * Esto asegura que manifest.json, iconos PWA y otros assets estaticos
 * esten disponibles en el build final.
 */

const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');
const distDir = path.join(__dirname, '../dist');

console.log('Copiando archivos de public/ a dist/...');

// Verificar que dist existe
if (!fs.existsSync(distDir)) {
  console.log('Creando directorio dist/');
  fs.mkdirSync(distDir, { recursive: true });
}

// Copiar todos los archivos de public a dist
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItem) => {
      copyRecursive(path.join(src, childItem), path.join(dest, childItem));
    });
  } else {
    fs.copyFileSync(src, dest);
    console.log(`  Copiado: ${path.basename(src)}`);
  }
}

if (fs.existsSync(publicDir)) {
  copyRecursive(publicDir, distDir);
  console.log('Archivos PWA copiados exitosamente!');
} else {
  console.log('Directorio public/ no encontrado');
}
