function updateBadgeAndTooltip(tabId, delay = false) {
  console.log("Function called - Tab:", tabId, "Delay:", delay);
  
  if (!delay) {
    console.log("Setting initial title");
    chrome.action.setTitle({
      title: "Character Counter\nChecking site access...",
      tabId: tabId
    });
    chrome.action.setBadgeText({ text: "", tabId: tabId });
    return;
  }

  console.log("Executing script");
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: () => document.body.innerText?.length || 0
  }, (results) => {
    if (chrome.runtime.lastError) {
      console.error("Script error:", chrome.runtime.lastError.message);
      chrome.action.setBadgeText({ text: "ERR", tabId: tabId });
      chrome.action.setTitle({
        title: "Character Counter\nError: No access",
        tabId: tabId
      });
      chrome.storage.local.set({ isCounting: false });
      chrome.alarms.clear("autoUpdate");
      return;
    }
    if (results && results[0].result !== undefined) {
      const total = results[0].result;
      let badgeText = total >= 1000 ? Math.floor(total / 1000) + "k" : total.toString();
      console.log("Result - Total:", total, "Badge:", badgeText);
      chrome.action.setBadgeText({ text: badgeText, tabId: tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#666" });
      chrome.storage.local.get(["isCounting"], (data) => {
        const isCounting = data.isCounting || false;
        chrome.action.setTitle({
          title: `Character Counter\nTotal: ${total}\nAuto: ${isCounting ? "On" : "Off"}`,
          tabId: tabId
        });
      });
    }
  });
}

chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) {
    console.error("No valid tab ID");
    return;
  }

  console.log("Click event triggered - Tab:", tab.id);
  chrome.storage.local.get(["isCounting"], (data) => {
    const isCounting = data.isCounting || false;
    console.log("Counting state:", isCounting);

    if (!isCounting) {
      console.log("First click - Starting count");
      chrome.storage.local.set({ isCounting: true });
      updateBadgeAndTooltip(tab.id, false);
      
      setTimeout(() => {
        console.log("First count after delay");
        updateBadgeAndTooltip(tab.id, true);
      }, 2000);

      // Создаем alarm для автообновления
      chrome.alarms.create("autoUpdate", { periodInMinutes: 1 });
    } else {
      console.log("Second click - Immediate count");
      updateBadgeAndTooltip(tab.id, true);
    }
  });
});

// Автообновление через alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "autoUpdate") {
    console.log("Alarm triggered");
    chrome.storage.local.get(["isCounting"], (data) => {
      if (data.isCounting) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            console.log("Auto-update for tab:", tabs[0].id);
            updateBadgeAndTooltip(tabs[0].id, true);
          }
        });
      }
    });
  }
});

// Сброс при закрытии вкладки
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log("Tab removed:", tabId);
  chrome.storage.local.get(["isCounting"], (data) => {
    if (data.isCounting) {
      chrome.storage.local.set({ isCounting: false });
      chrome.alarms.clear("autoUpdate");
    }
  });
});