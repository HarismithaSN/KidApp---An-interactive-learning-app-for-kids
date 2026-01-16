const canvas = document.getElementById('draw');
const ctx = canvas.getContext('2d');
let drawing = false;
ctx.fillStyle='white'; ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.lineWidth = 16;
ctx.lineCap = 'round';
ctx.strokeStyle = 'black';

canvas.addEventListener('pointerdown', e => { drawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });
canvas.addEventListener('pointermove', e => { if (!drawing) return; ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); });
canvas.addEventListener('pointerup', () => drawing = false);
document.getElementById('clear').onclick = () => {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='white'; ctx.fillRect(0,0,canvas.width,canvas.height);
  document.getElementById('result').textContent = '';
};

let model;
(async () => {
  try {
    // place your TFJS model at ml/handwriting/model/model.json
    model = await tf.loadLayersModel('model/model.json');
    console.log('handwriting model loaded');
  } catch (e) {
    console.log('No model found yet. Add model/model.json to enable predictions.');
  }
})();

function preprocess() {
  // resize to 28x28
  const tmp = document.createElement('canvas');
  tmp.width = 28; tmp.height = 28;
  const tctx = tmp.getContext('2d');
  tctx.fillStyle='white'; tctx.fillRect(0,0,28,28);
  tctx.drawImage(canvas, 0, 0, 28, 28);
  const img = tctx.getImageData(0,0,28,28);
  const data = [];
  for (let i = 0; i < img.data.length; i += 4) {
    const r = img.data[i], g = img.data[i+1], b = img.data[i+2];
    const gray = (r+g+b)/3;
    data.push((255 - gray) / 255); // invert: ink -> high
  }
  return tf.tensor4d(data, [1,28,28,1]);
}

document.getElementById('check').onclick = async () => {
  if (!model) { alert('Model not loaded. Add TFJS model to ml/handwriting/model/'); return; }
  const input = preprocess();
  const pred = model.predict(input);
  const probs = await pred.data();
  const best = probs.indexOf(Math.max(...probs));
  // Map index to letter - adapt if you train on EMNIST (mapping may differ)
  const letter = String.fromCharCode(65 + best); // A,B,C...
  document.getElementById('result').textContent = `I think: ${letter}`;
  input.dispose(); pred.dispose();
};
