const input = document.getElementById("minutes");
chrome.storage.local.get({ minutes: 25 }).then(({ minutes }) => (input.value = minutes));

document.getElementById("save").onclick = async () => {
  const minutes = Math.max(1, Math.min(999, parseInt(input.value, 10) || 25));
  input.value = minutes;
  // Guardar el nuevo tiempo reinicia el contador.
  await chrome.storage.local.set({ minutes, endTime: null, pausedRemaining: null });
  const msg = document.getElementById("msg");
  msg.textContent = "Guardado ✓";
  setTimeout(() => (msg.textContent = ""), 1500);
};
