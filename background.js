function updateBadgeAndTooltip(tabId, initial = false) {
  console.log("Function called - Tab:", tabId, "Initial:", initial);
  
  if (initial) {
    console.log("Setting initial title");
    chrome.action.setTitle({
      title: "Character Counter\nChecking site access...",
      tabId: tabId
    });
    return;
  }

  console.log("Executing script");
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: () => document.body.innerText?.length || 0
  }, (results) => {
    if (chrome.runtime.lastError) {
      console.error("Script error:", chrome.runtime.lastError.message);
      chrome.action.setBadgeText({ text: "N/A", tabId: tabId });
      chrome.action.setTitle({
        title: "Character Counter\nNot available on this page",
        tabId: tabId
      });
      chrome.storage.local.set({ lastCount: null });
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
      chrome.storage.local.set({ lastCount: badgeText }); // Сохраняем последнее значение
    }
  });
}

// Восстановление значка при загрузке страницы
function restoreBadge(tabId) {
  chrome.storage.local.get(["isCounting", "lastCount"], (data) => {
    const isCounting = data.isCounting || false;
    const lastCount = data.lastCount || "";
    if (isCounting && lastCount) {
      console.log("Restoring badge - Tab:", tabId, "Last count:", lastCount);
      chrome.action.setBadgeText({ text: lastCount, tabId: tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#666" });
      chrome.action.setTitle({
        title: `Character Counter\nCounting...\nAuto: On`,
        tabId: tabId
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
      updateBadgeAndTooltip(tab.id, true);
      
      setTimeout(() => {
        console.log("First count after delay");
        updateBadgeAndTooltip(tab.id, false);
      }, 2000);

      chrome.alarms.create("autoUpdate", { periodInMinutes: 1 });
    } else {
      console.log("Second click - Immediate count");
      updateBadgeAndTooltip(tab.id, false);
    }
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "autoUpdate") {
    console.log("Alarm triggered");
    chrome.storage.local.get(["isCounting"], (data) => {
      if (data.isCounting) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            console.log("Auto-update for tab:", tabs[0].id);
            updateBadgeAndTooltip(tabs[0].id, false);
          }
        });
      }
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  console.log("Tab removed:", tabId);
  chrome.storage.local.get(["isCounting"], (data) => {
    if (data.isCounting) {
      chrome.storage.local.set({ isCounting: false, lastCount: null });
      chrome.alarms.clear("autoUpdate");
    }
  });
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  console.log("Page changed - Tab:", details.tabId);
  chrome.storage.local.get(["isCounting"], (data) => {
    if (data.isCounting) {
      restoreBadge(details.tabId); // Восстанавливаем значок сразу
      console.log("Immediate update on navigation");
      updateBadgeAndTooltip(details.tabId, false); // Обновляем счетчик
    }
  });
});