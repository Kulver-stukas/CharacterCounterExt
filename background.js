function updateBadgeAndTooltip(tabId, delay = false) {
  if (!delay) {
    chrome.action.setTitle({
      title: "Character Counter\nChecking site access...",
      tabId: tabId
    });
    chrome.action.setBadgeText({ text: "", tabId: tabId });
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: () => {
      const text = document.body.innerText || '';
      return text.length;
    }
  }, (results) => {
    if (chrome.runtime.lastError) {
      console.error("Script error:", chrome.runtime.lastError.message);
      chrome.action.setBadgeText({ text: "ERR", tabId: tabId });
      chrome.action.setTitle({
        title: "Character Counter\nError: No access to site",
        tabId: tabId
      });
      return;
    }
    if (results && results[0].result !== undefined) {
      const total = results[0].result;
      let badgeText = total >= 1000 ? Math.floor(total / 1000) + "k" : total.toString();

      chrome.action.setBadgeText({ text: badgeText, tabId: tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#666" });
      chrome.action.setTitle({
        title: `Character Counter\nTotal: ${total} chars`,
        tabId: tabId
      });
    }
  });
}

chrome.action.onClicked.addListener((tab) => {
  updateBadgeAndTooltip(tab.id, false);

  setTimeout(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        updateBadgeAndTooltip(tabs[0].id, true);
      }
    });
  }, 2000);
});