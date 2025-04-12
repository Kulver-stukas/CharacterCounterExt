// background.js
function formatBadgeText(count) {
  if (count < 1000) {
    return count.toString(); // Например, "238"
  } else if (count < 10000) {
    return Math.floor(count / 1000) + "K"; // Например, "1K", "9K"
  } else {
    return Math.floor(count / 1000) + "K"; // Например, "33K", "238K"
  }
}

function updateBadgeAndTooltip(tabId) {
  console.log("Function called - Tab:", tabId);

  // Проверяем существование вкладки
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError || !tab || !tab.url || tab.status !== "complete") {
      console.log("Tab not found, no URL, or not ready, skipping:", tabId, chrome.runtime.lastError?.message);
      return; // Пропускаем, не устанавливая ничего
    }

    // Проверяем, доступен ли URL
    const url = new URL(tab.url);
    if (
      url.protocol === "chrome:" ||
      url.protocol === "about:" ||
      url.protocol === "edge:" ||
      tab.url.includes("yandex.ru/chrome/newtab")
    ) {
      console.log("Restricted page, setting N/A:", tab.url);
      chrome.action.setBadgeText({ text: "N/A", tabId: tabId });
      chrome.action.setTitle({ title: "Character Counter: N/A", tabId: tabId });
      return;
    }

    console.log("Executing script on:", tab.url);
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => document.body.innerText?.length || 0
    }, (results) => {
      if (chrome.runtime.lastError || !results || !results[0]) {
        console.error("Script error or no results:", chrome.runtime.lastError?.message);
        chrome.action.setBadgeText({ text: "N/A", tabId: tabId });
        chrome.action.setTitle({ title: "Character Counter: N/A", tabId: tabId });
        return;
      }

      // Проверяем результат
      const count = Number(results[0]?.result) || 0;
      if (isNaN(count) || count < 0) {
        console.log("Invalid count, setting N/A:", count);
        chrome.action.setBadgeText({ text: "N/A", tabId: tabId });
        chrome.action.setTitle({ title: "Character Counter: N/A", tabId: tabId });
        return;
      }

      // Форматируем бейдж
      const displayText = formatBadgeText(count);
      console.log("Setting badge:", displayText, "Count:", count);
      chrome.action.setBadgeText({ text: displayText, tabId: tabId });
      chrome.action.setTitle({ title: `Character Counter: ${count}`, tabId: tabId });

      // Сохраняем последнее значение
      chrome.storage.local.set({ lastCount: { tabId: tabId, count: count } });
    });
  });
}

// Запуск при активации вкладки
chrome.tabs.onActivated.addListener((activeInfo) => {
  updateBadgeAndTooltip(activeInfo.tabId);
});

// Запуск при обновлении вкладки
chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) { // Только основной фрейм
    updateBadgeAndTooltip(details.tabId);
  }
}, { url: [{ schemes: ["http", "https"] }] }); // Ограничиваем только http/https

// Периодическое обновление каждые 5 секунд
chrome.alarms.create("updateBadge", { periodInMinutes: 5 / 60 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "updateBadge") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        updateBadgeAndTooltip(tabs[0].id);
      }
    });
  }
});

// Восстановление последнего значения при загрузке
chrome.storage.local.get("lastCount", (data) => {
  if (data.lastCount?.tabId) {
    chrome.tabs.get(data.lastCount.tabId, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        console.log("Tab for lastCount not found, skipping:", data.lastCount.tabId);
        return;
      }
      const count = data.lastCount.count;
      const displayText = formatBadgeText(count);
      console.log("Restoring last count:", displayText);
      chrome.action.setBadgeText({ text: displayText, tabId: data.lastCount.tabId });
      chrome.action.setTitle({ title: `Character Counter: ${count}`, tabId: data.lastCount.tabId });
    });
  }
});