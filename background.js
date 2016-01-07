var updateIcon = function(filePath, tabId){
  chrome.browserAction.setIcon({
    path: filePath,
    tabId: tabId
  });
console.log("setting icon", filePath, tabId);
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(sender.tab.id && request.task == "updateIcon"){
      updateIcon(request.filePath, sender.tab.id);
    }
  });