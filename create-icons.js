// Run this once with Node.js to generate simple PNG icons
// node create-icons.js
const { createCanvas } = require('canvas');
const fs = require('fs');

[16, 48, 128].forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#fe2c55');
  grad.addColorStop(1, '#ff6b81');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // Music note
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${size * 0.6}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♪', size / 2, size / 2);

  fs.writeFileSync(`icons/icon${size}.png`, canvas.toBuffer('image/png'));
  console.log(`Created icon${size}.png`);
});
