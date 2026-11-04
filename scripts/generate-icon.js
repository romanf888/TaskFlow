import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

const svgPath = path.resolve('public/logo.svg');
const svgBuffer = fs.readFileSync(svgPath);

const resvg = new Resvg(svgBuffer, {
  fitTo: {
    mode: 'width',
    value: 512,
  },
});

const pngData = resvg.render();
const pngBuffer = pngData.asPng();

// Ensure output directories exist
fs.mkdirSync('public', { recursive: true });
fs.mkdirSync('build', { recursive: true });

// Write PNG icons
fs.writeFileSync('public/icon.png', pngBuffer);
fs.writeFileSync('build/icon.png', pngBuffer);

console.log('Successfully generated 512x512 PNG icon at public/icon.png and build/icon.png');
