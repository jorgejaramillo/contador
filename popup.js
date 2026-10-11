const $ = (id) => document.getElementById(id);
let state = { minutes: 25, endTime: null, pausedRemaining: null };

const fmt = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
};

function remaining() {
  if (state.endTime) return state.endTime - Date.now();
  if (state.pausedRemaining) return state.pausedRemaining;
  return state.minutes * 60000;
}

function render() {
  const ms = remaining();
  $("time").textContent = fmt(ms);
  $("toggle").textContent = state.endTime ? "Pausar" : state.pausedRemaining ? "Continuar" : "Iniciar";
}

async function load() {
  state = { ...state, ...(await chrome.storage.local.get(["minutes", "endTime", "pausedRemaining"])) };
  render();
}

$("toggle").onclick = async () => {
  if (state.endTime) {
    await chrome.storage.local.set({ endTime: null, pausedRemaining: state.endTime - Date.now() });
  } else {
    await chrome.storage.local.set({ endTime: Date.now() + remaining(), pausedRemaining: null });
  }
};
$("reset").onclick = () => chrome.storage.local.set({ endTime: null, pausedRemaining: null });

chrome.storage.onChanged.addListener(load);
setInterval(render, 250);
load();
