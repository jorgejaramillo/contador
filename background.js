const DEFAULTS = { minutes: 25, endTime: null, pausedRemaining: null };

async function getState() {
  return { ...DEFAULTS, ...(await chrome.storage.local.get(DEFAULTS)) };
}

async function updateBadge() {
  const s = await getState();
  let text = "";
  if (s.endTime) {
    const ms = s.endTime - Date.now();
    text = ms > 0 ? String(Math.ceil(ms / 60000)) : "";
  } else if (s.pausedRemaining) {
    text = String(Math.ceil(s.pausedRemaining / 60000));
  }
  await chrome.action.setBadgeBackgroundColor({ color: s.endTime ? "#E5322D" : "#888888" });
  await chrome.action.setBadgeText({ text });
}

async function playSound() {
  if (!(await chrome.offscreen.hasDocument())) {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Sonido al terminar la cuenta regresiva"
    });
  }
  chrome.runtime.sendMessage({ type: "beep" });
}

async function finish() {
  await chrome.storage.local.set({ endTime: null, pausedRemaining: null });
  await chrome.alarms.clear("end");
  await chrome.alarms.clear("tick");
  await playSound();
  await updateBadge();
}

async function schedule(endTime) {
  await chrome.alarms.create("end", { when: endTime });
  await chrome.alarms.create("tick", { periodInMinutes: 0.5 });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  const s = await getState();
  if (!s.endTime) return;
  if (alarm.name === "end" || Date.now() >= s.endTime) return finish();
  updateBadge();
});

chrome.storage.onChanged.addListener(async (changes) => {
  if (changes.endTime) {
    const { endTime } = changes.endTime.newValue === undefined ? {} : { endTime: changes.endTime.newValue };
    if (endTime) await schedule(endTime);
    else { await chrome.alarms.clear("end"); await chrome.alarms.clear("tick"); }
  }
  updateBadge();
});

chrome.runtime.onStartup.addListener(async () => {
  const s = await getState();
  if (s.endTime) {
    if (Date.now() >= s.endTime) await finish();
    else await schedule(s.endTime);
  }
  updateBadge();
});

chrome.runtime.onInstalled.addListener(updateBadge);
