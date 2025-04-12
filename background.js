function updateBadgeAndTooltip(tabId) {
  console.log("Function called - Tab:", tabId);
  
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
      chrome.action.setTitle({
        title: `Character Counter\nTotal: ${total}`,
        tabId: tabId
      });
      chrome.storage.local.set({ lastCount: badgeText });
    }
  });
}

// Восстановление значка
function restoreBadge(tabId) {
  chrome.storage.local.get(["lastCount"], (data) => {
    const lastCount = data.lastCount || "";
    if (lastCount) {
      console.log("Restoring badge - Tab:", tabId, "Last count:", lastCount);
      chrome.action.setBadgeText({ text: lastCount, tabId: tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#666" });
      chrome.action.setTitle({
        title: "Character Counter\nCounting...",
        tabId: tabId
      });
    }
  });
}

// Старт подсчета для активной вкладки
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id) {
      console.log("Starting count on install - Tab:", tabs[0].id);
      updateBadgeAndTooltip(tabs[0].id);
      chrome.alarms.create("autoUpdate", { periodInMinutes: 5 / 60 }); // 5 секунд
    }
  });
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log("Tab activated - Tab:", activeInfo.tabId);
  restoreBadge(activeInfo.tabId);
  updateBadgeAndTooltip(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    console.log("Tab updated - Tab:", tabId);
    restoreBadge(tabId);
    updateBadgeAndTooltip(tabId);
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "autoUpdate") {
    console.log("Alarm triggered");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        console.log("Auto-update for tab:", tabs[0].id);
        updateBadgeAndTooltip(tabs[0].id);
      }
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  console.log("Tab removed:", tabId);
  chrome.storage.local.set({ lastCount: null });
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  console.log("Page changed - Tab:", details.tabId);
  chrome.tabs.get(details.tabId, (tab) => {
    if (tab.active) {
      restoreBadge(details.tabId);
      updateBadgeAndTooltip(details.tabId);
    }
  });
});