// Pequeño "click/tic" generado con Web Audio (sin archivos externos).
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "beep") return;
  const ctx = new AudioContext();
  [0, 0.25].forEach((delay) => {
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  });
  setTimeout(() => { ctx.close(); window.close(); }, 800);
});
