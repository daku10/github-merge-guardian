import { sendToContentScript } from "@plasmohq/messaging"

import { UPDATE_PAGE } from "~lib/message"

// this is only for pull request page(not including commits, files, etc.)
const regex =
  /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+(?:\?[^#]*)?(?:#.*)?$/

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url?.match(regex)) {
    sendToContentScript({ tabId, name: UPDATE_PAGE }).catch((e) => {
      console.error(e)
    })
  }
})
