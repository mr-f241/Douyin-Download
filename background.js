// Open sidebar when clicking the extension icon
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// Relay messages from content/extractor → sidebar
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (['PROGRESS', 'DONE', 'ERROR'].includes(msg.type)) {
    // Attach the sender tabId so sidebar knows which tab
    chrome.runtime.sendMessage({ ...msg, tabId: sender.tab?.id }).catch(() => {});
  }
});
