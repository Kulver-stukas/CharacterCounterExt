function countCharacters() {
  const text = document.body.innerText || '';
  return text.length;
}

let initialCharCount = 0;

window.addEventListener('load', () => {
  initialCharCount = countCharacters();
  console.log("Initial count set:", initialCharCount); // Отладка
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCharCount") {
    const total = countCharacters();
    console.log("Total:", total, "Difference:", total - initialCharCount); // Отладка
    sendResponse({
      total: total,
      difference: total - initialCharCount
    });
  }
  return true; // Асинхронный ответ
});